import { Injectable, Logger } from '@nestjs/common';
import { NotificationsFacade } from '../../notifications/notifications.facade';
import { PaymentStatus } from '../interfaces';

export interface ReceiptData {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  recipientEmail?: string;
  recipientPhone?: string;
  metadata?: Record<string, any>;
  organisationId?: string;
  branchId?: string;
}

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  constructor(private readonly notifications: NotificationsFacade) {}

  /**
   * Send payment receipt via email
   */
  async sendEmailReceipt(data: ReceiptData): Promise<boolean> {
    if (!data.recipientEmail) {
      this.logger.warn(`No email provided for receipt: ${data.reference}`);
      return false;
    }

    try {
      this.logger.log(`Sending email receipt for payment: ${data.reference}`);

      const result = await this.notifications.send({
        channel: 'EMAIL',
        recipients: [{ email: data.recipientEmail }],
        templateKey: 'Payment Receipt',
        variables: {
          subject: `Payment Receipt - ${data.reference}`,
          html: this.generateEmailReceiptHtml(data),
          text: this.generateEmailReceiptText(data),
        },
        branchId: data.branchId,
        organisationId: data.organisationId,
      });

      this.logger.log(
        `Email receipt sent for ${data.reference}: ${result.success ? 'SUCCESS' : 'FAILED'}`,
      );
      return result.success;
    } catch (error) {
      this.logger.error(
        `Failed to send email receipt for ${data.reference}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Send payment receipt via SMS
   */
  async sendSmsReceipt(data: ReceiptData): Promise<boolean> {
    if (!data.recipientPhone) {
      this.logger.warn(`No phone provided for receipt: ${data.reference}`);
      return false;
    }

    try {
      this.logger.log(`Sending SMS receipt for payment: ${data.reference}`);

      const result = await this.notifications.send({
        channel: 'SMS',
        recipients: [{ phone: data.recipientPhone }],
        variables: {
          message: this.generateSmsReceiptText(data),
        },
        branchId: data.branchId,
        organisationId: data.organisationId,
      });

      this.logger.log(
        `SMS receipt sent for ${data.reference}: ${result.success ? 'SUCCESS' : 'FAILED'}`,
      );
      return result.success;
    } catch (error) {
      this.logger.error(
        `Failed to send SMS receipt for ${data.reference}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Send receipt via both email and SMS
   */
  async sendReceipt(data: ReceiptData): Promise<{ email: boolean; sms: boolean }> {
    const [emailSent, smsSent] = await Promise.all([
      data.recipientEmail ? this.sendEmailReceipt(data) : Promise.resolve(false),
      data.recipientPhone ? this.sendSmsReceipt(data) : Promise.resolve(false),
    ]);

    return { email: emailSent, sms: smsSent };
  }

  /**
   * Generate HTML receipt content
   */
  private generateEmailReceiptHtml(data: ReceiptData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .detail { margin: 10px 0; }
          .label { font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Receipt</h1>
          </div>
          <div class="content">
            <div class="detail">
              <span class="label">Reference:</span> ${data.reference}
            </div>
            <div class="detail">
              <span class="label">Amount:</span> ${data.currency} ${(data.amount / 100).toFixed(2)}
            </div>
            <div class="detail">
              <span class="label">Status:</span> ${data.status}
            </div>
            <div class="detail">
              <span class="label">Date:</span> ${new Date().toLocaleString()}
            </div>
          </div>
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>This is an automated receipt. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text receipt content
   */
  private generateEmailReceiptText(data: ReceiptData): string {
    return `
Payment Receipt

Reference: ${data.reference}
Amount: ${data.currency} ${(data.amount / 100).toFixed(2)}
Status: ${data.status}
Date: ${new Date().toLocaleString()}

Thank you for your payment!
    `.trim();
  }

  /**
   * Generate SMS receipt content
   */
  private generateSmsReceiptText(data: ReceiptData): string {
    return `Payment received! Ref: ${data.reference}, Amount: ${data.currency} ${(data.amount / 100).toFixed(2)}. Thank you!`;
  }
}
