import { Injectable } from '@nestjs/common';
import { INotificationDispatcher, SendNotificationInput } from '../interfaces';
import { EmailService } from '../../../communications/services/email.service';
import { SmsService } from '../../../communications/services/sms.service';

@Injectable()
export class DispatcherService implements INotificationDispatcher {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async send(input: SendNotificationInput): Promise<{ success: boolean; count: number }>
  {
    if (input.channel === 'EMAIL') {
      // Map to existing email input with full support
      const emails = (input.recipients || [])
        .map((r) => r.email || r.id) // support email or member ID
        .filter((e): e is string => !!e);

      const ok = await this.emailService.sendEmail({
        recipients: emails,
        subject: input.variables?.subject || input.templateKey || 'Notification',
        bodyHtml: input.variables?.html || input.variables?.bodyHtml || '',
        bodyText: input.variables?.text || input.variables?.bodyText || '',
        templateId: input.templateId,
        templateData: input.variables,
        branchId: input.branchId,
        organisationId: input.organisationId,
        groupIds: input.groupIds,
        filters: input.filters,
        birthdayRange: input.birthdayRange,
        scheduledAt: input.scheduleAt || undefined,
      } as any);
      return { success: ok, count: emails.length };
    }

    if (input.channel === 'SMS') {
      // Map to existing sms input with full support
      const recipientIds = (input.recipients || [])
        .map((r) => r.id || r.phone) // support member ID or phone
        .filter((p): p is string => !!p);

      const okResp = await this.smsService.sendSmsWithTracking({
        recipients: recipientIds,
        message: input.variables?.message || input.variables?.text || input.variables?.body || '',
        branchId: input.branchId,
        organisationId: input.organisationId,
        groupIds: input.groupIds,
        filters: input.filters,
        birthdayRange: input.birthdayRange,
        scheduledAt: input.scheduleAt || undefined,
      } as any);
      const ok = okResp.success;
      return { success: ok, count: okResp.recipientCount || 0 };
    }

    return { success: false, count: 0 };
  }
}
