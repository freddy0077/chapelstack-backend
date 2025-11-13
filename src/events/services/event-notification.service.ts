import { Injectable, Logger } from '@nestjs/common';
import { NotificationsFacade } from '../../engagement/notifications/notifications.facade';
import { PrismaService } from '../../prisma/prisma.service';
import { format } from 'date-fns';

@Injectable()
export class EventNotificationService {
  private readonly logger = new Logger(EventNotificationService.name);

  constructor(
    private readonly notificationsFacade: NotificationsFacade,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Send registration confirmation email
   */
  async sendRegistrationConfirmation(registrationId: string): Promise<void> {
    try {
      const registration = await this.prisma.eventRegistration.findUnique({
        where: { id: registrationId },
        include: {
          event: {
            include: {
              organisation: true,
            },
          },
          member: true,
        },
      });

      if (!registration) {
        throw new Error('Registration not found');
      }

      const { event, member, guestEmail, guestName } = registration;
      const recipientEmail = member?.email || guestEmail;
      const recipientName = member
        ? `${member.firstName} ${member.lastName}`
        : guestName;

      if (!recipientEmail) {
        this.logger.warn(`No email found for registration ${registrationId}`);
        return;
      }

      const subject = `Registration Confirmed: ${event.title}`;
      const bodyHtml = this.buildRegistrationConfirmationEmail({
        memberName: recipientName || 'Guest',
        eventTitle: event.title,
        eventDate: format(new Date(event.startDate), 'PPPP'),
        eventTime: format(new Date(event.startDate), 'p'),
        eventLocation: event.location || 'TBA',
        numberOfGuests: registration.numberOfGuests,
        requiresApproval: event.requiresApproval,
        registrationId: registration.id,
        churchName: event.organisation?.name || 'ChapelStack',
        churchEmail: event.organizerEmail || 'info@chapelstack.com',
      });

      await this.notificationsFacade.send({
        channel: 'EMAIL',
        recipients: [{ email: recipientEmail }],
        variables: {
          subject,
          html: bodyHtml,
        },
        branchId: event.branchId || undefined,
        organisationId: event.organisationId || undefined,
      });

      this.logger.log(
        `Registration confirmation sent to ${recipientEmail} for event ${event.title}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send registration confirmation: ${error.message}`,
        error.stack,
      );
      // Don't throw - we don't want to fail the registration if email fails
    }
  }

  /**
   * Send approval notification email
   */
  async sendApprovalNotification(registrationId: string): Promise<void> {
    try {
      const registration = await this.prisma.eventRegistration.findUnique({
        where: { id: registrationId },
        include: {
          event: {
            include: {
              organisation: true,
            },
          },
          member: true,
        },
      });

      if (!registration) {
        throw new Error('Registration not found');
      }

      const { event, member, guestEmail, guestName } = registration;
      const recipientEmail = member?.email || guestEmail;
      const recipientName = member
        ? `${member.firstName} ${member.lastName}`
        : guestName;

      if (!recipientEmail) {
        this.logger.warn(`No email found for registration ${registrationId}`);
        return;
      }

      const subject = `Registration Approved: ${event.title}`;
      const bodyHtml = this.buildApprovalEmail({
        recipientName: recipientName || 'Guest',
        eventTitle: event.title,
        eventDate: format(new Date(event.startDate), 'EEEE, MMMM d, yyyy'),
        eventTime: format(new Date(event.startDate), 'h:mm a'),
        eventLocation: event.location || 'TBA',
        numberOfGuests: registration.numberOfGuests || 0,
        churchName: event.organisation?.name || 'ChapelStack',
      });

      await this.notificationsFacade.send({
        channel: 'EMAIL',
        recipients: [{ email: recipientEmail }],
        variables: {
          subject,
          html: bodyHtml,
        },
        branchId: event.branchId || undefined,
        organisationId: event.organisationId || undefined,
      });

      this.logger.log(
        `Approval notification sent to ${recipientEmail} for event ${event.title}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send approval notification: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Send rejection notification email
   */
  async sendRejectionNotification(registrationId: string): Promise<void> {
    try {
      const registration = await this.prisma.eventRegistration.findUnique({
        where: { id: registrationId },
        include: {
          event: {
            include: {
              organisation: true,
            },
          },
          member: true,
        },
      });

      if (!registration) {
        throw new Error('Registration not found');
      }

      const { event, member, guestEmail, guestName, rejectionReason } =
        registration;
      const recipientEmail = member?.email || guestEmail;
      const recipientName = member
        ? `${member.firstName} ${member.lastName}`
        : guestName;

      if (!recipientEmail) {
        this.logger.warn(`No email found for registration ${registrationId}`);
        return;
      }

      const subject = `Registration Update: ${event.title}`;
      const bodyHtml = this.buildRejectionEmail({
        recipientName: recipientName || 'Guest',
        eventTitle: event.title,
        reason: rejectionReason || 'No reason provided',
        churchName: event.organisation?.name || 'ChapelStack',
      });

      await this.notificationsFacade.send({
        channel: 'EMAIL',
        recipients: [{ email: recipientEmail }],
        variables: {
          subject,
          html: bodyHtml,
        },
        branchId: event.branchId || undefined,
        organisationId: event.organisationId || undefined,
      });

      this.logger.log(
        `Rejection notification sent to ${recipientEmail} for event ${event.title}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send rejection notification: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Send SMS confirmation (optional)
   */
  async sendSmsConfirmation(registrationId: string): Promise<void> {
    try {
      const registration = await this.prisma.eventRegistration.findUnique({
        where: { id: registrationId },
        include: {
          event: {
            include: {
              organisation: true,
            },
          },
          member: true,
        },
      });

      if (!registration) {
        throw new Error('Registration not found');
      }

      const { event, member, guestPhone } = registration;
      const recipientPhone = member?.phoneNumber || guestPhone;

      if (!recipientPhone) {
        this.logger.debug(`No phone found for registration ${registrationId}`);
        return;
      }

      const message = `${event.organisation?.name || 'ChapelStack'}: Your registration for ${event.title} on ${format(new Date(event.startDate), 'PP')} is confirmed! See you there.`;

      await this.notificationsFacade.send({
        channel: 'SMS',
        recipients: [{ phone: recipientPhone }],
        variables: {
          message,
        },
        branchId: event.branchId || undefined,
        organisationId: event.organisationId || undefined,
      });

      this.logger.log(`SMS confirmation sent to ${recipientPhone}`);
    } catch (error) {
      this.logger.warn(
        `Failed to send SMS confirmation: ${error.message}`,
      );
      // Don't throw - SMS is optional
    }
  }

  /**
   * Build registration confirmation email HTML
   */
  private buildRegistrationConfirmationEmail(data: {
    memberName: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    numberOfGuests: number;
    requiresApproval: boolean;
    registrationId: string;
    churchName: string;
    churchEmail: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9f9f9; padding: 30px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .details-row { padding: 8px 0; border-bottom: 1px solid #eee; }
    .details-row:last-child { border-bottom: none; }
    .details-label { font-weight: bold; color: #667eea; display: inline-block; width: 120px; }
    .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Registration Confirmed!</h1>
    </div>
    <div class="content">
      <p>Dear ${data.memberName},</p>
      
      <p>Your registration for <strong>${data.eventTitle}</strong> has been confirmed!</p>
      
      <div class="details">
        <div class="details-row">
          <span class="details-label">📅 Date:</span>
          <span>${data.eventDate}</span>
        </div>
        <div class="details-row">
          <span class="details-label">🕐 Time:</span>
          <span>${data.eventTime}</span>
        </div>
        <div class="details-row">
          <span class="details-label">📍 Location:</span>
          <span>${data.eventLocation}</span>
        </div>
        ${
          data.numberOfGuests > 1
            ? `<div class="details-row">
          <span class="details-label">👥 Attendees:</span>
          <span>${data.numberOfGuests} people</span>
        </div>`
            : ''
        }
      </div>
      
      ${
        data.requiresApproval
          ? `<div class="alert">
        <strong>⏳ Approval Required</strong><br>
        Your registration is pending approval. You will receive another email once it has been reviewed.
      </div>`
          : '<p>We look forward to seeing you there!</p>'
      }
      
      <p>If you need to cancel your registration, please contact us at <a href="mailto:${data.churchEmail}">${data.churchEmail}</a>.</p>
      
      <p>Blessings,<br><strong>${data.churchName}</strong></p>
    </div>
    <div class="footer">
      <p>Registration ID: ${data.registrationId}</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Send registration approval email
   */
  async sendRegistrationApprovalEmail(registration: any): Promise<void> {
    try {
      const { event, member, guestEmail, guestName } = registration;
      const recipientEmail = member?.email || guestEmail;
      const recipientName = member
        ? `${member.firstName} ${member.lastName}`
        : guestName || 'Guest';

      if (!recipientEmail) {
        this.logger.warn(
          `No email found for registration ${registration.id}`,
        );
        return;
      }

      const subject = `Registration Approved: ${event.title}`;
      const bodyHtml = this.buildApprovalEmail({
        recipientName,
        eventTitle: event.title,
        eventDate: format(new Date(event.startDate), 'EEEE, MMMM d, yyyy'),
        eventTime: format(new Date(event.startDate), 'h:mm a'),
        eventLocation: event.location || 'TBA',
        numberOfGuests: registration.numberOfGuests || 0,
        churchName: event.organisation?.name || 'Church',
      });

      await this.notificationsFacade.send({
        channel: 'EMAIL',
        recipients: [{ email: recipientEmail }],
        variables: {
          subject,
          html: bodyHtml,
        },
        branchId: event.branchId || undefined,
        organisationId: event.organisationId || undefined,
      });

      this.logger.log(
        `Approval email sent for registration ${registration.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send approval email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Send registration rejection email
   */
  async sendRegistrationRejectionEmail(
    registration: any,
    reason: string,
  ): Promise<void> {
    try {
      const { event, member, guestEmail, guestName } = registration;
      const recipientEmail = member?.email || guestEmail;
      const recipientName = member
        ? `${member.firstName} ${member.lastName}`
        : guestName || 'Guest';

      if (!recipientEmail) {
        this.logger.warn(
          `No email found for registration ${registration.id}`,
        );
        return;
      }

      const subject = `Registration Update: ${event.title}`;
      const bodyHtml = this.buildRejectionEmail({
        recipientName,
        eventTitle: event.title,
        reason,
        churchName: event.organisation?.name || 'Church',
      });

      await this.notificationsFacade.send({
        channel: 'EMAIL',
        recipients: [{ email: recipientEmail }],
        variables: {
          subject,
          html: bodyHtml,
        },
        branchId: event.branchId || undefined,
        organisationId: event.organisationId || undefined,
      });

      this.logger.log(
        `Rejection email sent for registration ${registration.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send rejection email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Build approval email HTML
   */
  private buildApprovalEmail(data: {
    recipientName: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    numberOfGuests: number;
    churchName: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .detail-row { margin: 10px 0; }
    .label { font-weight: bold; color: #059669; }
    .success-badge { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Registration Approved!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.recipientName}</strong>,</p>
      
      <div class="success-badge">Your registration has been approved</div>
      
      <p>Great news! Your registration for <strong>${data.eventTitle}</strong> has been approved. We're excited to have you join us!</p>
      
      <div class="event-details">
        <h3 style="margin-top: 0; color: #059669;">Event Details</h3>
        <div class="detail-row">
          <span class="label">📅 Date:</span> ${data.eventDate}
        </div>
        <div class="detail-row">
          <span class="label">⏰ Time:</span> ${data.eventTime}
        </div>
        <div class="detail-row">
          <span class="label">📍 Location:</span> ${data.eventLocation}
        </div>
        ${
          data.numberOfGuests > 0
            ? `<div class="detail-row">
          <span class="label">👥 Guests:</span> ${data.numberOfGuests}
        </div>`
            : ''
        }
      </div>
      
      <p><strong>What to do next:</strong></p>
      <ul>
        <li>Mark your calendar for the event</li>
        <li>Plan to arrive 15 minutes early</li>
        <li>Bring this confirmation email if needed</li>
      </ul>
      
      <p>We look forward to seeing you there!</p>
      
      <p>Blessings,<br><strong>${data.churchName}</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Build rejection email HTML
   */
  private buildRejectionEmail(data: {
    recipientName: string;
    eventTitle: string;
    reason: string;
    churchName: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .reason-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Registration Update</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.recipientName}</strong>,</p>
      
      <p>We regret to inform you that your registration for <strong>${data.eventTitle}</strong> could not be approved at this time.</p>
      
      <div class="reason-box">
        <h3 style="margin-top: 0; color: #d97706;">Reason:</h3>
        <p style="margin: 0;">${data.reason}</p>
      </div>
      
      <p>If you have any questions or would like to discuss this further, please don't hesitate to contact us.</p>
      
      <p>We appreciate your understanding and hope to see you at future events.</p>
      
      <p>Blessings,<br><strong>${data.churchName}</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
