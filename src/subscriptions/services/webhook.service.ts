import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionsService } from './subscriptions.service';
import { PaystackService } from './paystack.service';
import { SubscriptionStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly paystackService: PaystackService,
  ) {}

  /**
   * Process Paystack webhook event
   */
  async processWebhookEvent(
    eventType: string,
    data: any,
    paystackId?: string,
  ): Promise<void> {
    try {
      this.logger.log(`Processing webhook event: ${eventType}`);

      // Log webhook event
      const webhookEvent = await this.prisma.webhookEvent.create({
        data: {
          eventType,
          paystackId,
          data,
          processed: false,
        },
      });

      try {
        // Process based on event type
        switch (eventType) {
          case 'subscription.create':
            await this.handleSubscriptionCreated(data);
            break;
          case 'subscription.disable':
            await this.handleSubscriptionDisabled(data);
            break;
          case 'subscription.enable':
            await this.handleSubscriptionEnabled(data);
            break;
          case 'invoice.create':
            await this.handleInvoiceCreated(data);
            break;
          case 'invoice.update':
            await this.handleInvoiceUpdated(data);
            break;
          case 'invoice.payment_failed':
            await this.handleInvoicePaymentFailed(data);
            break;
          case 'charge.success':
            // Check if this is an event registration payment
            if (data.metadata?.eventId) {
              await this.handleEventRegistrationPayment(data);
            } else {
              await this.handleChargeSuccess(data);
            }
            break;
          case 'charge.failed':
            // Check if this is an event registration payment
            if (data.metadata?.eventId) {
              await this.handleEventRegistrationPaymentFailed(data);
            } else {
              await this.handleChargeFailed(data);
            }
            break;
          case 'customeridentification.success':
            await this.handleCustomerIdentificationSuccess(data);
            break;
          case 'customeridentification.failed':
            await this.handleCustomerIdentificationFailed(data);
            break;
          default:
            this.logger.warn(`Unhandled webhook event type: ${eventType}`);
        }

        // Mark as processed
        await this.prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: {
            processed: true,
            processedAt: new Date(),
          },
        });

        this.logger.log(`Webhook event processed successfully: ${eventType}`);
      } catch (error) {
        // Mark as failed with error
        await this.prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: {
            processed: false,
            errorMessage: error.message,
            retryCount: { increment: 1 },
          },
        });

        throw error;
      }
    } catch (error) {
      this.logger.error(
        `Failed to process webhook event: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle subscription created event
   */
  private async handleSubscriptionCreated(data: any): Promise<void> {
    try {
      const subscriptionCode = data.subscription_code;
      const customerCode = data.customer.customer_code;

      this.logger.log(`Handling subscription created: ${subscriptionCode}`);

      // Find subscription by Paystack subscription code
      const subscription = await this.prisma.subscription.findUnique({
        where: { paystackSubscriptionCode: subscriptionCode },
      });

      if (subscription) {
        // Update subscription with Paystack data
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: this.mapPaystackStatusToLocal(data.status),
            paystackSubscriptionCode: subscriptionCode,
            paystackCustomerCode: customerCode,
            metadata: data,
          },
        });
      } else {
        this.logger.warn(
          `Subscription not found for Paystack code: ${subscriptionCode}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle subscription created: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle subscription disabled event
   */
  private async handleSubscriptionDisabled(data: any): Promise<void> {
    try {
      const subscriptionCode = data.subscription_code;

      this.logger.log(`Handling subscription disabled: ${subscriptionCode}`);

      const subscription = await this.prisma.subscription.findUnique({
        where: { paystackSubscriptionCode: subscriptionCode },
      });

      if (subscription) {
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.CANCELLED,
            cancelledAt: new Date(),
            cancelReason: 'Cancelled via Paystack',
          },
        });
      } else {
        this.logger.warn(
          `Subscription not found for Paystack code: ${subscriptionCode}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle subscription disabled: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle subscription enabled event
   */
  private async handleSubscriptionEnabled(data: any): Promise<void> {
    try {
      const subscriptionCode = data.subscription_code;

      this.logger.log(`Handling subscription enabled: ${subscriptionCode}`);

      const subscription = await this.prisma.subscription.findUnique({
        where: { paystackSubscriptionCode: subscriptionCode },
      });

      if (subscription) {
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.ACTIVE,
            cancelledAt: null,
            cancelReason: null,
          },
        });
      } else {
        this.logger.warn(
          `Subscription not found for Paystack code: ${subscriptionCode}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle subscription enabled: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle invoice created event
   */
  private async handleInvoiceCreated(data: any): Promise<void> {
    try {
      const subscriptionCode = data.subscription?.subscription_code;

      if (!subscriptionCode) {
        this.logger.warn('Invoice created without subscription code');
        return;
      }

      this.logger.log(
        `Handling invoice created for subscription: ${subscriptionCode}`,
      );

      const subscription = await this.prisma.subscription.findUnique({
        where: { paystackSubscriptionCode: subscriptionCode },
        include: { plan: true },
      });

      if (subscription) {
        // Create payment record with pending status
        await this.subscriptionsService.processSubscriptionPayment(
          subscription.id,
          {
            amount: data.amount / 100, // Convert from kobo to naira
            currency: data.currency || 'NGN',
            paystackReference: data.reference,
            paystackTransactionId: data.id.toString(),
            periodStart: new Date(data.period_start),
            periodEnd: new Date(data.period_end),
            status: PaymentStatus.PENDING,
          },
        );
      } else {
        this.logger.warn(
          `Subscription not found for Paystack code: ${subscriptionCode}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle invoice created: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle invoice updated event
   */
  private async handleInvoiceUpdated(data: any): Promise<void> {
    try {
      const reference = data.reference;

      this.logger.log(`Handling invoice updated: ${reference}`);

      const payment = await this.prisma.subscriptionPayment.findUnique({
        where: { paystackReference: reference },
      });

      if (payment) {
        const status = this.mapPaystackPaymentStatusToLocal(data.status);

        await this.prisma.subscriptionPayment.update({
          where: { id: payment.id },
          data: {
            status,
            paidAt: data.paid_at ? new Date(data.paid_at) : null,
            failedAt: status === PaymentStatus.FAILED ? new Date() : null,
            failureReason: data.gateway_response || null,
          },
        });

        // Update subscription status if payment successful
        if (status === PaymentStatus.SUCCESSFUL) {
          await this.prisma.subscription.update({
            where: { id: payment.subscriptionId },
            data: {
              status: SubscriptionStatus.ACTIVE,
              lastPaymentDate: new Date(data.paid_at),
              failedPaymentCount: 0,
            },
          });
        }
      } else {
        this.logger.warn(`Payment not found for reference: ${reference}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle invoice updated: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle invoice payment failed event
   */
  private async handleInvoicePaymentFailed(data: any): Promise<void> {
    try {
      const subscriptionCode = data.subscription?.subscription_code;

      if (!subscriptionCode) {
        this.logger.warn('Invoice payment failed without subscription code');
        return;
      }

      this.logger.log(
        `Handling invoice payment failed for subscription: ${subscriptionCode}`,
      );

      const subscription = await this.prisma.subscription.findUnique({
        where: { paystackSubscriptionCode: subscriptionCode },
      });

      if (subscription) {
        // Update subscription status and increment failed payment count
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.PAST_DUE,
            failedPaymentCount: { increment: 1 },
          },
        });

        // Create or update payment record
        const payment = await this.prisma.subscriptionPayment.findUnique({
          where: { paystackReference: data.reference },
        });

        if (payment) {
          await this.prisma.subscriptionPayment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.FAILED,
              failedAt: new Date(),
              failureReason: data.gateway_response || 'Payment failed',
            },
          });
        } else {
          await this.subscriptionsService.processSubscriptionPayment(
            subscription.id,
            {
              amount: data.amount / 100,
              currency: data.currency || 'NGN',
              paystackReference: data.reference,
              paystackTransactionId: data.id.toString(),
              periodStart: new Date(data.period_start),
              periodEnd: new Date(data.period_end),
              status: PaymentStatus.FAILED,
              failureReason: data.gateway_response || 'Payment failed',
            },
          );
        }
      } else {
        this.logger.warn(
          `Subscription not found for Paystack code: ${subscriptionCode}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle invoice payment failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle charge success event
   */
  private async handleChargeSuccess(data: any): Promise<void> {
    try {
      const reference = data.reference;

      this.logger.log(`Handling charge success: ${reference}`);

      const payment = await this.prisma.subscriptionPayment.findUnique({
        where: { paystackReference: reference },
      });

      if (payment) {
        await this.prisma.subscriptionPayment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCESSFUL,
            paidAt: new Date(data.paid_at),
            authorizationCode: data.authorization?.authorization_code,
          },
        });

        // Update subscription
        await this.prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: SubscriptionStatus.ACTIVE,
            lastPaymentDate: new Date(data.paid_at),
            failedPaymentCount: 0,
          },
        });
      } else {
        this.logger.warn(`Payment not found for reference: ${reference}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle charge success: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle charge failed event
   */
  private async handleChargeFailed(data: any): Promise<void> {
    try {
      const reference = data.reference;

      this.logger.log(`Handling charge failed: ${reference}`);

      const payment = await this.prisma.subscriptionPayment.findUnique({
        where: { paystackReference: reference },
      });

      if (payment) {
        await this.prisma.subscriptionPayment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            failedAt: new Date(),
            failureReason: data.gateway_response || 'Charge failed',
          },
        });

        // Update subscription
        await this.prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: SubscriptionStatus.PAST_DUE,
            failedPaymentCount: { increment: 1 },
          },
        });
      } else {
        this.logger.warn(`Payment not found for reference: ${reference}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle charge failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle customer identification success event
   */
  private async handleCustomerIdentificationSuccess(data: any): Promise<void> {
    try {
      const customerCode = data.customer_code;

      this.logger.log(
        `Handling customer identification success: ${customerCode}`,
      );

      const paystackCustomer = await this.prisma.paystackCustomer.findUnique({
        where: { paystackCustomerCode: customerCode },
      });

      if (paystackCustomer) {
        await this.prisma.paystackCustomer.update({
          where: { id: paystackCustomer.id },
          data: {
            metadata: data,
          },
        });
      } else {
        this.logger.warn(`Paystack customer not found: ${customerCode}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle customer identification success: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle customer identification failed event
   */
  private async handleCustomerIdentificationFailed(data: any): Promise<void> {
    try {
      const customerCode = data.customer_code;

      this.logger.log(
        `Handling customer identification failed: ${customerCode}`,
      );

      // Log the failure but don't take any action
      this.logger.warn(`Customer identification failed for: ${customerCode}`);
    } catch (error) {
      this.logger.error(
        `Failed to handle customer identification failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Map Paystack subscription status to local status
   */
  private mapPaystackStatusToLocal(paystackStatus: string): SubscriptionStatus {
    switch (paystackStatus?.toLowerCase()) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'cancelled':
      case 'canceled':
        return SubscriptionStatus.CANCELLED;
      case 'non-renewing':
        return SubscriptionStatus.CANCELLED;
      case 'attention':
        return SubscriptionStatus.PAST_DUE;
      case 'completed':
        return SubscriptionStatus.CANCELLED;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }

  /**
   * Map Paystack payment status to local status
   */
  private mapPaystackPaymentStatusToLocal(
    paystackStatus: string,
  ): PaymentStatus {
    switch (paystackStatus?.toLowerCase()) {
      case 'success':
      case 'successful':
        return PaymentStatus.SUCCESSFUL;
      case 'failed':
      case 'failure':
        return PaymentStatus.FAILED;
      case 'pending':
        return PaymentStatus.PENDING;
      case 'cancelled':
      case 'canceled':
        return PaymentStatus.CANCELLED;
      case 'refunded':
        return PaymentStatus.REFUNDED;
      default:
        return PaymentStatus.PENDING;
    }
  }

  /**
   * Retry failed webhook events
   */
  async retryFailedWebhookEvents(maxRetries: number = 3): Promise<void> {
    try {
      this.logger.log('Retrying failed webhook events');

      const failedEvents = await this.prisma.webhookEvent.findMany({
        where: {
          processed: false,
          retryCount: { lt: maxRetries },
        },
        orderBy: { createdAt: 'asc' },
        take: 10, // Process 10 at a time
      });

      for (const event of failedEvents) {
        try {
          await this.processWebhookEvent(
            event.eventType,
            event.data,
            event.paystackId || '',
          );
        } catch (error) {
          this.logger.error(
            `Failed to retry webhook event ${event.id}: ${error.message}`,
          );
        }
      }

      this.logger.log(`Retried ${failedEvents.length} failed webhook events`);
    } catch (error) {
      this.logger.error(
        `Failed to retry webhook events: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle event registration payment success
   */
  private async handleEventRegistrationPayment(data: any): Promise<void> {
    try {
      const reference = data.reference;
      const { eventId } = data.metadata || {};

      this.logger.log(
        `💳 [EVENT REGISTRATION PAYMENT] Processing payment: ${reference}`,
      );

      if (!eventId) {
        this.logger.warn(
          `❌ [EVENT REGISTRATION PAYMENT] No eventId in metadata for reference: ${reference}`,
        );
        return;
      }

      // Find registration by transaction ID
      const registration = await this.prisma.eventRegistration.findFirst({
        where: {
          transactionId: reference,
        },
      });

      if (!registration) {
        this.logger.warn(
          `⚠️ [EVENT REGISTRATION PAYMENT] Registration not found for reference: ${reference}`,
        );
        return;
      }

      // Update registration with payment info
      await this.prisma.eventRegistration.update({
        where: {
          id: registration.id,
        },
        data: {
          paymentStatus: 'completed',
          amountPaid: data.amount / 100, // Convert from kobo
          transactionId: reference,
        },
      });

      this.logger.log(
        `✅ [EVENT REGISTRATION PAYMENT] Payment recorded successfully: ${reference}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ [EVENT REGISTRATION PAYMENT] Failed to process: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle event registration payment failure
   */
  private async handleEventRegistrationPaymentFailed(data: any): Promise<void> {
    try {
      const reference = data.reference;
      const { eventId } = data.metadata || {};

      this.logger.log(
        `❌ [EVENT REGISTRATION PAYMENT] Payment failed: ${reference}`,
      );

      if (!eventId) {
        this.logger.warn(
          `⚠️ [EVENT REGISTRATION PAYMENT] No eventId in metadata for reference: ${reference}`,
        );
        return;
      }

      // Find registration by transaction ID
      const registration = await this.prisma.eventRegistration.findFirst({
        where: {
          transactionId: reference,
        },
      });

      if (!registration) {
        this.logger.warn(
          `⚠️ [EVENT REGISTRATION PAYMENT] Registration not found for reference: ${reference}`,
        );
        return;
      }

      // Update registration with failure info
      await this.prisma.eventRegistration.update({
        where: {
          id: registration.id,
        },
        data: {
          paymentStatus: 'failed',
          notes: `Payment failed: ${data.gateway_response || 'Unknown reason'}`,
        },
      });

      this.logger.log(
        `✅ [EVENT REGISTRATION PAYMENT] Failure recorded: ${reference}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ [EVENT REGISTRATION PAYMENT] Failed to record failure: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
