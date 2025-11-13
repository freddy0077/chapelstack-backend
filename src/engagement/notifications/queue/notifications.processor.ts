import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { NotificationsFacade } from '../notifications.facade';
import { SendNotificationInput } from '../interfaces';

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly notifications: NotificationsFacade) {}

  @Process('send')
  async handleSendNotification(job: Job<SendNotificationInput>) {
    try {
      this.logger.log(`Processing notification job ${job.id} for channel: ${job.data.channel}`);
      
      const result = await this.notifications.send(job.data);
      
      this.logger.log(
        `Notification job ${job.id} completed: ${result.success ? 'SUCCESS' : 'FAILED'}, count: ${result.count}`,
      );
      
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to process notification job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process('send-email')
  async handleSendEmail(job: Job<any>) {
    // Legacy email queue compatibility
    this.logger.log(`Processing legacy email job ${job.id}`);
    
    const input: SendNotificationInput = {
      channel: 'EMAIL',
      recipients: (job.data.recipients || []).map((r: any) => ({
        email: typeof r === 'string' ? r : r.email,
        id: typeof r === 'object' ? r.id : undefined,
      })),
      templateId: job.data.templateId,
      variables: {
        subject: job.data.subject,
        html: job.data.bodyHtml,
        text: job.data.bodyText,
        ...job.data.templateData,
      },
      branchId: job.data.branchId,
      organisationId: job.data.organisationId,
      groupIds: job.data.groupIds,
      filters: job.data.filters,
      scheduleAt: job.data.scheduledAt ? new Date(job.data.scheduledAt) : null,
    };

    return this.notifications.send(input);
  }

  @Process('send-sms')
  async handleSendSms(job: Job<any>) {
    // Legacy SMS queue compatibility
    this.logger.log(`Processing legacy SMS job ${job.id}`);
    
    const input: SendNotificationInput = {
      channel: 'SMS',
      recipients: (job.data.recipients || []).map((r: any) => ({
        phone: typeof r === 'string' ? r : undefined,
        id: typeof r === 'string' ? r : r.id,
      })),
      variables: {
        message: job.data.message,
      },
      branchId: job.data.branchId,
      organisationId: job.data.organisationId,
      groupIds: job.data.groupIds,
      filters: job.data.filters,
      birthdayRange: job.data.birthdayRange,
      scheduleAt: job.data.scheduledAt ? new Date(job.data.scheduledAt) : null,
    };

    return this.notifications.send(input);
  }
}
