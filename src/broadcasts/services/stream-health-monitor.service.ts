import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ZoomService } from '../integrations/zoom/zoom.service';
import { FacebookService } from '../integrations/facebook/facebook.service';
import { InstagramService } from '../integrations/instagram/instagram.service';

export interface HealthCheckResult {
  platform: string;
  isHealthy: boolean;
  latency: number;
  error?: string;
  timestamp: Date;
}

export interface StreamMetrics {
  bitrate?: number;
  fps?: number;
  resolution?: string;
  droppedFrames?: number;
  bufferHealth?: number;
}

@Injectable()
export class StreamHealthMonitorService {
  private readonly logger = new Logger(StreamHealthMonitorService.name);
  private healthCheckInterval = 30000; // 30 seconds
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000; // 5 seconds

  constructor(
    private readonly prisma: PrismaService,
    private readonly zoomService: ZoomService,
    private readonly facebookService: FacebookService,
    private readonly instagramService: InstagramService,
  ) {}

  /**
   * Continuous health monitoring for all live broadcasts
   * Runs every 30 seconds
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async monitorLiveBroadcasts() {
    try {
      const liveBroadcasts = await this.prisma.broadcast.findMany({
        where: { status: 'LIVE' },
        include: { platforms: true },
      });

      for (const broadcast of liveBroadcasts) {
        await this.checkBroadcastHealth(broadcast.id);
      }
    } catch (error) {
      this.logger.error('Error in health monitoring cron:', error);
    }
  }

  /**
   * Check health of a specific broadcast and all its platforms
   */
  async checkBroadcastHealth(broadcastId: string): Promise<HealthCheckResult[]> {
    const broadcast = await this.prisma.broadcast.findUnique({
      where: { id: broadcastId },
      include: { platforms: true },
    });

    if (!broadcast) {
      throw new Error(`Broadcast ${broadcastId} not found`);
    }

    const results: HealthCheckResult[] = [];

    for (const platform of broadcast.platforms) {
      const result = await this.checkPlatformHealth(
        broadcast.organisationId,
        platform.platform,
        platform.platformId,
      );

      results.push(result);

      // Update platform status based on health check
      if (!result.isHealthy && platform.status === 'LIVE') {
        await this.handleUnhealthyPlatform(broadcast.id, platform.id, result);
      }

      // Record health metrics
      await this.recordHealthMetrics(broadcastId, platform.id, result);
    }

    return results;
  }

  /**
   * Check health of a specific platform
   */
  private async checkPlatformHealth(
    organisationId: string,
    platform: string,
    platformId: string,
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      switch (platform) {
        case 'ZOOM':
          await this.checkZoomHealth(organisationId, platformId);
          break;
        case 'FACEBOOK':
          await this.checkFacebookHealth(organisationId, platformId);
          break;
        case 'INSTAGRAM':
          await this.checkInstagramHealth(organisationId, platformId);
          break;
        default:
          throw new Error(`Unknown platform: ${platform}`);
      }

      const latency = Date.now() - startTime;

      return {
        platform,
        isHealthy: true,
        latency,
        timestamp: new Date(),
      };
    } catch (error) {
      const latency = Date.now() - startTime;

      return {
        platform,
        isHealthy: false,
        latency,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check Zoom meeting health
   */
  private async checkZoomHealth(
    organisationId: string,
    meetingId: string,
  ): Promise<void> {
    try {
      // Get meeting details to verify it's still active
      const meeting = await this.zoomService.getMeeting(
        organisationId,
        meetingId,
      );

      if (!meeting) {
        throw new Error('Meeting not found');
      }

      // Check if meeting is still in progress
      if (meeting.status !== 'started') {
        throw new Error(`Meeting status is ${meeting.status}`);
      }
    } catch (error) {
      this.logger.error(`Zoom health check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check Facebook Live health
   */
  private async checkFacebookHealth(
    organisationId: string,
    videoId: string,
  ): Promise<void> {
    try {
      const video = await this.facebookService.getLiveVideo(
        organisationId,
        videoId,
      );

      if (!video) {
        throw new Error('Live video not found');
      }

      // Check if video is still live
      if (video.status !== 'LIVE') {
        throw new Error(`Video status is ${video.status}`);
      }
    } catch (error) {
      this.logger.error(`Facebook health check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check Instagram Live health
   */
  private async checkInstagramHealth(
    organisationId: string,
    videoId: string,
  ): Promise<void> {
    try {
      // Instagram Live API is limited, so we do basic connectivity check
      const video = await this.instagramService.getLiveVideo(
        organisationId,
        videoId,
      );

      if (!video) {
        throw new Error('Live video not found');
      }
    } catch (error) {
      this.logger.error(`Instagram health check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle unhealthy platform - attempt recovery
   */
  private async handleUnhealthyPlatform(
    broadcastId: string,
    platformId: string,
    healthResult: HealthCheckResult,
  ): Promise<void> {
    this.logger.warn(
      `Platform ${healthResult.platform} is unhealthy for broadcast ${broadcastId}`,
    );

    const platform = await this.prisma.broadcastPlatform.findUnique({
      where: { id: platformId },
    });

    if (!platform) return;

    // Increment error count
    const errorCount = (platform.error ? parseInt(platform.error) : 0) + 1;

    // Update platform status
    await this.prisma.broadcastPlatform.update({
      where: { id: platformId },
      data: {
        status: 'ERROR',
        error: `Health check failed: ${healthResult.error} (Attempt ${errorCount})`,
      },
    });

    // Attempt auto-recovery if under max retries
    if (errorCount <= this.maxRetries) {
      await this.attemptAutoRecovery(broadcastId, platformId, healthResult.platform);
    } else {
      // Max retries exceeded, send alert
      await this.sendAlert(broadcastId, platformId, healthResult);
    }
  }

  /**
   * Attempt automatic recovery of failed platform
   */
  private async attemptAutoRecovery(
    broadcastId: string,
    platformId: string,
    platform: string,
  ): Promise<void> {
    this.logger.log(
      `Attempting auto-recovery for ${platform} on broadcast ${broadcastId}`,
    );

    try {
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, this.retryDelay));

      // Re-check health
      const broadcast = await this.prisma.broadcast.findUnique({
        where: { id: broadcastId },
      });

      if (!broadcast) return;

      const platformRecord = await this.prisma.broadcastPlatform.findUnique({
        where: { id: platformId },
      });

      if (!platformRecord) return;

      const healthResult = await this.checkPlatformHealth(
        broadcast.organisationId,
        platform,
        platformRecord.platformId,
      );

      if (healthResult.isHealthy) {
        // Recovery successful
        await this.prisma.broadcastPlatform.update({
          where: { id: platformId },
          data: {
            status: 'LIVE',
            error: null,
          },
        });

        this.logger.log(
          `Auto-recovery successful for ${platform} on broadcast ${broadcastId}`,
        );
      } else {
        throw new Error('Health check still failing');
      }
    } catch (error) {
      this.logger.error(
        `Auto-recovery failed for ${platform} on broadcast ${broadcastId}: ${error.message}`,
      );
    }
  }

  /**
   * Send alert for critical platform failure
   */
  private async sendAlert(
    broadcastId: string,
    platformId: string,
    healthResult: HealthCheckResult,
  ): Promise<void> {
    this.logger.error(
      `CRITICAL: Platform ${healthResult.platform} failed after ${this.maxRetries} retries`,
    );

    // TODO: Implement notification system
    // - Send email to broadcast creator
    // - Send SMS alert
    // - Push notification
    // - Webhook to external monitoring service

    // For now, just log and update status
    await this.prisma.broadcastPlatform.update({
      where: { id: platformId },
      data: {
        status: 'ERROR',
        error: `CRITICAL: Max retries exceeded. ${healthResult.error}`,
      },
    });
  }

  /**
   * Record health metrics for analytics
   */
  private async recordHealthMetrics(
    broadcastId: string,
    platformId: string,
    healthResult: HealthCheckResult,
  ): Promise<void> {
    try {
      // Store health check results in analytics table
      // This can be used for historical analysis and reporting
      await this.prisma.broadcastAnalytics.create({
        data: {
          broadcastId,
          platform: healthResult.platform as any,
          viewerCount: 0,
          timestamp: new Date(),
        },
      });
    } catch (error: any) {
      // Don't fail health check if analytics recording fails
      this.logger.warn(`Failed to record health metrics: ${error.message}`);
    }
  }

  /**
   * Get platform health history
   */
  async getPlatformHealthHistory(
    platformId: string,
    hours: number = 24,
  ): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Get the broadcast platform to find the broadcast and platform
    const broadcastPlatform = await this.prisma.broadcastPlatform.findUnique({
      where: { id: platformId },
    });

    if (!broadcastPlatform) {
      return [];
    }

    const analytics = await this.prisma.broadcastAnalytics.findMany({
      where: {
        broadcastId: broadcastPlatform.broadcastId,
        platform: broadcastPlatform.platform,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'asc' },
    });

    return analytics.map((record) => ({
      timestamp: record.timestamp,
      viewerCount: record.viewerCount,
      platform: record.platform,
    }));
  }

  /**
   * Get overall broadcast health score
   */
  async getBroadcastHealthScore(broadcastId: string): Promise<number> {
    const broadcast = await this.prisma.broadcast.findUnique({
      where: { id: broadcastId },
      include: { platforms: true },
    });

    if (!broadcast || broadcast.platforms.length === 0) {
      return 0;
    }

    const healthyPlatforms = broadcast.platforms.filter(
      (p) => p.status === 'LIVE' || p.status === 'CONNECTED',
    ).length;

    return (healthyPlatforms / broadcast.platforms.length) * 100;
  }

  /**
   * Force health check for a broadcast (on-demand)
   */
  async forceHealthCheck(broadcastId: string): Promise<HealthCheckResult[]> {
    this.logger.log(`Force health check requested for broadcast ${broadcastId}`);
    return await this.checkBroadcastHealth(broadcastId);
  }
}
