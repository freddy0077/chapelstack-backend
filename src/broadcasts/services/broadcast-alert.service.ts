import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsFacade } from '../../engagement/notifications/notifications.facade';

export interface AlertConfig {
  email: boolean;
  sms: boolean;
  push: boolean;
  webhook: boolean;
}

export interface Alert {
  type: 'PLATFORM_FAILURE' | 'QUALITY_ISSUE' | 'VIEWER_SPIKE' | 'VIEWER_DROP' | 'STREAM_ENDED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  broadcastId: string;
  platformId?: string;
  metadata?: any;
  timestamp: Date;
}

@Injectable()
export class BroadcastAlertService {
  private readonly logger = new Logger(BroadcastAlertService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsFacade: NotificationsFacade,
  ) {}

  /**
   * Send alert to broadcast creator
   */
  async sendAlert(alert: Alert, config?: AlertConfig): Promise<void> {
    this.logger.log(`Sending ${alert.severity} alert: ${alert.title}`);

    const broadcast = await this.prisma.broadcast.findUnique({
      where: { id: alert.broadcastId },
      include: {
        createdBy: true,
        organisation: true,
      },
    });

    if (!broadcast) {
      this.logger.error(`Broadcast ${alert.broadcastId} not found`);
      return;
    }

    const defaultConfig: AlertConfig = {
      email: true,
      sms: alert.severity === 'CRITICAL',
      push: true,
      webhook: false,
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Send via configured channels
    const promises: Promise<void>[] = [];

    if (finalConfig.email) {
      promises.push(this.sendEmailAlert(broadcast.createdBy.email, alert));
    }

    if (finalConfig.sms && broadcast.createdBy.phoneNumber) {
      promises.push(this.sendSMSAlert(broadcast.createdBy.phoneNumber, alert));
    }

    if (finalConfig.push) {
      promises.push(this.sendPushNotification(broadcast.createdById, alert));
    }

    if (finalConfig.webhook) {
      promises.push(this.sendWebhook(broadcast.organisationId, alert));
    }

    // Execute all notifications in parallel
    await Promise.allSettled(promises);

    // Store alert in database
    await this.storeAlert(alert);
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(email: string, alert: Alert): Promise<void> {
    try {
      this.logger.log(`Sending email alert to ${email}: ${alert.title}`);

      const emailContent = `
        <h2>${alert.title}</h2>
        <p><strong>Severity:</strong> ${alert.severity}</p>
        <p><strong>Time:</strong> ${alert.timestamp.toLocaleString()}</p>
        <p>${alert.message}</p>
        ${alert.metadata ? `<pre>${JSON.stringify(alert.metadata, null, 2)}</pre>` : ''}
        <p><a href="${process.env.FRONTEND_URL}/dashboard/broadcasts/${alert.broadcastId}">View Broadcast</a></p>
      `;

      await this.notificationsFacade.send({
        channel: 'EMAIL',
        recipients: [{ email }],
        variables: {
          subject: `[${alert.severity}] ${alert.title}`,
          html: emailContent,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send email alert: ${error.message}`);
    }
  }

  /**
   * Send SMS alert
   */
  private async sendSMSAlert(phoneNumber: string, alert: Alert): Promise<void> {
    try {
      this.logger.log(`Sending SMS alert to ${phoneNumber}: ${alert.title}`);

      const smsContent = `[${alert.severity}] ${alert.title}: ${alert.message}`;

      await this.notificationsFacade.send({
        channel: 'SMS',
        recipients: [{ phone: phoneNumber }],
        variables: {
          message: smsContent,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send SMS alert: ${error.message}`);
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(
    userId: string,
    alert: Alert,
  ): Promise<void> {
    try {
      // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
      this.logger.log(`Would send push notification to user ${userId}: ${alert.title}`);

      // Actual push notification would go here
      // await pushService.send({
      //   userId,
      //   title: alert.title,
      //   body: alert.message,
      //   data: {
      //     broadcastId: alert.broadcastId,
      //     type: alert.type,
      //   },
      // });
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(
    organisationId: string,
    alert: Alert,
  ): Promise<void> {
    try {
      // Get organization webhook URL
      const org = await this.prisma.organisation.findUnique({
        where: { id: organisationId },
      });

      if (!org) return;

      // TODO: Get webhook URL from organization settings
      const webhookUrl = (org as any).webhookUrl;

      if (!webhookUrl) return;

      this.logger.log(`Would send webhook to ${webhookUrl}`);

      // Actual webhook sending would go here
      // await axios.post(webhookUrl, {
      //   event: 'broadcast.alert',
      //   alert,
      // });
    } catch (error) {
      this.logger.error(`Failed to send webhook: ${error.message}`);
    }
  }

  /**
   * Store alert in database for history
   */
  private async storeAlert(alert: Alert): Promise<void> {
    try {
      // Store in a dedicated alerts table or in broadcast metadata
      await this.prisma.broadcast.update({
        where: { id: alert.broadcastId },
        data: {
          // Store alerts in metadata or create a separate alerts table
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to store alert: ${error.message}`);
    }
  }

  /**
   * Create platform failure alert
   */
  async createPlatformFailureAlert(
    broadcastId: string,
    platformId: string,
    error: string,
  ): Promise<void> {
    const platform = await this.prisma.broadcastPlatform.findUnique({
      where: { id: platformId },
    });

    if (!platform) return;

    await this.sendAlert({
      type: 'PLATFORM_FAILURE',
      severity: 'CRITICAL',
      title: `${platform.platform} Stream Failed`,
      message: `Your ${platform.platform} stream has encountered an error and stopped broadcasting. Error: ${error}`,
      broadcastId,
      platformId,
      metadata: { error, platform: platform.platform },
      timestamp: new Date(),
    });
  }

  /**
   * Create quality issue alert
   */
  async createQualityIssueAlert(
    broadcastId: string,
    platformId: string,
    issues: string[],
  ): Promise<void> {
    const platform = await this.prisma.broadcastPlatform.findUnique({
      where: { id: platformId },
    });

    if (!platform) return;

    await this.sendAlert({
      type: 'QUALITY_ISSUE',
      severity: 'WARNING',
      title: `Stream Quality Issues Detected`,
      message: `Your ${platform.platform} stream is experiencing quality issues: ${issues.join(', ')}`,
      broadcastId,
      platformId,
      metadata: { issues, platform: platform.platform },
      timestamp: new Date(),
    });
  }

  /**
   * Create viewer spike alert (positive)
   */
  async createViewerSpikeAlert(
    broadcastId: string,
    currentViewers: number,
    previousViewers: number,
  ): Promise<void> {
    const increase = ((currentViewers - previousViewers) / previousViewers) * 100;

    await this.sendAlert(
      {
        type: 'VIEWER_SPIKE',
        severity: 'INFO',
        title: `Viewer Spike Detected!`,
        message: `Your broadcast is gaining traction! Viewers increased by ${increase.toFixed(0)}% (${previousViewers} → ${currentViewers})`,
        broadcastId,
        metadata: { currentViewers, previousViewers, increase },
        timestamp: new Date(),
      },
      { email: false, sms: false, push: true, webhook: false },
    );
  }

  /**
   * Create viewer drop alert (negative)
   */
  async createViewerDropAlert(
    broadcastId: string,
    currentViewers: number,
    previousViewers: number,
  ): Promise<void> {
    const decrease = ((previousViewers - currentViewers) / previousViewers) * 100;

    if (decrease > 50) {
      // Only alert on significant drops
      await this.sendAlert(
        {
          type: 'VIEWER_DROP',
          severity: 'WARNING',
          title: `Significant Viewer Drop`,
          message: `Your broadcast has lost ${decrease.toFixed(0)}% of viewers (${previousViewers} → ${currentViewers}). Check stream quality.`,
          broadcastId,
          metadata: { currentViewers, previousViewers, decrease },
          timestamp: new Date(),
        },
        { email: false, sms: false, push: true, webhook: false },
      );
    }
  }

  /**
   * Get alert history for a broadcast
   */
  async getAlertHistory(broadcastId: string): Promise<Alert[]> {
    // TODO: Implement alert history retrieval from database
    return [];
  }
}
