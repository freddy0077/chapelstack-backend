import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { ReceiptService } from './receipt.service';

export interface WebhookEvent {
  event: string;
  data: any;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly receiptService: ReceiptService,
  ) {}

  /**
   * Verify webhook signature
   */
  verifySignature(payload: any, signature: string): boolean {
    try {
      const secret = this.config.get<string>('PAYSTACK_WEBHOOK_SECRET');
      if (!secret) {
        this.logger.warn('PAYSTACK_WEBHOOK_SECRET not configured');
        return false;
      }
      const computed = createHmac('sha512', secret)
        .update(Buffer.isBuffer(payload) ? payload : JSON.stringify(payload))
        .digest('hex');
      return computed === signature;
    } catch (e) {
      this.logger.error(`Signature verification failed: ${e.message}`);
      return false;
    }
  }

  /**
   * Handle incoming webhook event
   */
  async handleWebhook(event: WebhookEvent): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Processing webhook event: ${event.event}`);

      switch (event.event) {
        case 'charge.success':
          return await this.handleChargeSuccess(event.data);
        
        case 'subscription.create':
          return await this.handleSubscriptionCreate(event.data);
        
        case 'subscription.disable':
          return await this.handleSubscriptionDisable(event.data);
        
        case 'subscription.not_renew':
          return await this.handleSubscriptionNotRenew(event.data);
        
        default:
          this.logger.warn(`Unhandled webhook event: ${event.event}`);
          return { success: true, message: `Event ${event.event} acknowledged but not processed` };
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle webhook event ${event.event}: ${error.message}`,
        error.stack,
      );
      return { success: false, message: error.message };
    }
  }

  /**
   * Handle successful charge event
   */
  private async handleChargeSuccess(data: any): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Processing charge.success for reference: ${data.reference}`);

    // Extract payment details
    const reference = data.reference;
    const amount = data.amount; // in kobo/cents
    const currency = data.currency;
    const customerEmail = data.customer?.email;
    const customerPhone = data.customer?.phone;
    const metadata = data.metadata || {};

    // Send receipt if customer contact info is available
    if (customerEmail || customerPhone) {
      await this.receiptService.sendReceipt({
        reference,
        amount,
        currency,
        status: 'SUCCESS',
        recipientEmail: customerEmail,
        recipientPhone: customerPhone,
        metadata,
        organisationId: metadata.organisationId,
        branchId: metadata.branchId,
      });
    }

    // Emit domain event for other handlers (subscriptions, events, etc.)
    // TODO: Implement event bus and emit PaymentVerified event

    return { success: true, message: `Charge processed: ${reference}` };
  }

  /**
   * Handle subscription creation event
   */
  private async handleSubscriptionCreate(data: any): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Processing subscription.create: ${data.subscription_code}`);
    
    // TODO: Implement subscription creation logic or emit event
    
    return { success: true, message: `Subscription created: ${data.subscription_code}` };
  }

  /**
   * Handle subscription disable event
   */
  private async handleSubscriptionDisable(data: any): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Processing subscription.disable: ${data.subscription_code}`);
    
    // TODO: Implement subscription disable logic or emit event
    
    return { success: true, message: `Subscription disabled: ${data.subscription_code}` };
  }

  /**
   * Handle subscription not renew event
   */
  private async handleSubscriptionNotRenew(data: any): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Processing subscription.not_renew: ${data.subscription_code}`);
    
    // TODO: Implement subscription not renew logic or emit event
    
    return { success: true, message: `Subscription not renewing: ${data.subscription_code}` };
  }
}
