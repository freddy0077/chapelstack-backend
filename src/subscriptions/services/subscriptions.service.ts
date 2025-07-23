import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaystackService } from './paystack.service';
import {
  SubscriptionStatus,
  PaymentStatus,
  SubscriptionInterval,
  Subscription,
  SubscriptionPayment,
  PaystackCustomer,
  Prisma
} from '@prisma/client';
import { CreateSubscriptionInput } from '../dto/create-subscription.input';
import { UpdateSubscriptionInput } from '../dto/update-subscription.input';
import { SubscriptionFilterInput } from '../dto/subscription-filter.input';
import { VerifyPaymentInput } from '../dto/verify-payment.input';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystackService: PaystackService,
  ) {}

  /**
   * Create a new subscription
   */
  async createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<Subscription> {
    try {
      this.logger.log(`Creating subscription for member: ${input.customerId}`);

      // Validate member exists
      const member = await this.prisma.member.findUnique({
        where: { id: input.customerId },
        include: { paystackCustomer: true },
      });

      if (!member) {
        throw new NotFoundException('Member not found');
      }

      // Validate plan exists
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: input.planId },
      });

      if (!plan) {
        throw new NotFoundException('Subscription plan not found');
      }

      if (!plan.isActive) {
        throw new BadRequestException('Subscription plan is not active');
      }

      // Create or get Paystack customer
      let paystackCustomer = member.paystackCustomer;
      if (!paystackCustomer) {
        const customerData: any = {
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email || '',
          metadata: {
            memberId: member.id,
            organisationId: member.organisationId || '',
            branchId: member.branchId || '',
          },
          phone: member.phoneNumber || undefined,
        };

        const paystackResponse =
          await this.paystackService.createCustomer(customerData);

        paystackCustomer = await this.prisma.paystackCustomer.create({
          data: {
            memberId: member.id,
            paystackCustomerCode: paystackResponse.data.customer_code,
            email: member.email || '',
            firstName: member.firstName,
            lastName: member.lastName,
            phone: member.phoneNumber || null,
            metadata: paystackResponse.data,
          },
        });
      }

      // Calculate subscription dates
      const now = new Date();
      const currentPeriodStart = input.startDate
        ? new Date(input.startDate)
        : now;
      const currentPeriodEnd = this.calculatePeriodEnd(
        currentPeriodStart,
        plan.interval,
        plan.intervalCount,
      );

      let trialStart: Date | null = null;
      let trialEnd: Date | null = null;

      if (plan.trialPeriodDays && plan.trialPeriodDays > 0) {
        trialStart = currentPeriodStart;
        trialEnd = new Date(currentPeriodStart);
        trialEnd.setDate(trialEnd.getDate() + plan.trialPeriodDays);
      }

      // Create subscription in database
      const subscription = await this.prisma.subscription.create({
        data: {
          customerId: input.customerId,
          planId: input.planId,
          status: trialStart
            ? SubscriptionStatus.TRIALING
            : SubscriptionStatus.ACTIVE,
          currentPeriodStart,
          currentPeriodEnd,
          trialStart,
          trialEnd,
          nextBillingDate: trialEnd || currentPeriodEnd,
          paystackCustomerCode: paystackCustomer.paystackCustomerCode,
          organisationId: member.organisationId || '',
          metadata: input.metadata,
        },
        include: {
          customer: true,
          plan: true,
          payments: true,
        },
      });

      // Create Paystack subscription if not in trial
      if (!trialStart && plan.paystackPlanCode) {
        try {
          const paystackSubscription =
            await this.paystackService.createSubscription({
              customer: paystackCustomer.paystackCustomerCode,
              plan: plan.paystackPlanCode,
              authorization: input.authorizationCode,
              startDate: currentPeriodStart.toISOString(),
              metadata: {
                subscriptionId: subscription.id,
                memberId: member.id,
                planId: plan.id,
              },
            });

          // Update subscription with Paystack subscription code
          await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              paystackSubscriptionCode:
                paystackSubscription.data.subscription_code,
            },
          });
        } catch (error) {
          this.logger.error(
            `Failed to create Paystack subscription: ${error.message}`,
          );
          // Don't fail the entire operation, but log the error
        }
      }

      this.logger.log(`Subscription created successfully: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error(
        `Failed to create subscription: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update a subscription
   */
  async updateSubscription(
    id: string,
    input: UpdateSubscriptionInput,
  ): Promise<Subscription> {
    try {
      this.logger.log(`Updating subscription: ${id}`);

      const subscription = await this.prisma.subscription.findUnique({
        where: { id },
        include: { plan: true, customer: true },
      });

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      const updateData: any = {};

      if (input.status) {
        updateData.status = input.status;

        if (input.status === SubscriptionStatus.CANCELLED) {
          updateData.cancelledAt = new Date();
          updateData.cancelReason = input.cancelReason;
        }
      }

      if (input.cancelAtPeriodEnd !== undefined) {
        updateData.cancelAtPeriodEnd = input.cancelAtPeriodEnd;
      }

      if (input.metadata) {
        updateData.metadata = input.metadata;
      }

      const updatedSubscription = await this.prisma.subscription.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          plan: true,
          payments: true,
        },
      });

      this.logger.log(`Subscription updated successfully: ${id}`);
      return updatedSubscription;
    } catch (error) {
      this.logger.error(
        `Failed to update subscription: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(id: string, reason?: string): Promise<Subscription> {
    try {
      this.logger.log(`Cancelling subscription: ${id}`);

      const subscription = await this.prisma.subscription.findUnique({
        where: { id },
        include: { customer: true, plan: true },
      });

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      // Cancel on Paystack if subscription code exists
      if (subscription.paystackSubscriptionCode) {
        try {
          await this.paystackService.cancelSubscription(
            subscription.paystackSubscriptionCode,
            'cancel_subscription',
          );
        } catch (error) {
          this.logger.error(
            `Failed to cancel Paystack subscription: ${error.message}`,
          );
          // Continue with local cancellation
        }
      }

      // Update subscription status
      const cancelledSubscription = await this.prisma.subscription.update({
        where: { id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: reason,
        },
        include: {
          customer: true,
          plan: true,
          payments: true,
        },
      });

      this.logger.log(`Subscription cancelled successfully: ${id}`);
      return cancelledSubscription;
    } catch (error) {
      this.logger.error(
        `Failed to cancel subscription: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(id: string): Promise<Subscription> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        organisation: true,
        plan: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  /**
   * Get subscriptions with filtering
   */
  async getSubscriptions(
    filter: SubscriptionFilterInput = {},
  ): Promise<Subscription[]> {
    const where: any = {};

    if (filter.organisationId) {
      where.organisationId = filter.organisationId;
    }

    if (filter.customerId) {
      where.customerId = filter.customerId;
    }

    if (filter.planId) {
      where.planId = filter.planId;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.dateFrom || filter.dateTo) {
      where.createdAt = {};
      if (filter.dateFrom) {
        where.createdAt.gte = new Date(filter.dateFrom);
      }
      if (filter.dateTo) {
        where.createdAt.lte = new Date(filter.dateTo);
      }
    }

    return this.prisma.subscription.findMany({
      where,
      include: {
        customer: true,
        plan: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Latest 5 payments
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: filter.skip || 0,
      take: filter.take || 50,
    });
  }

  /**
   * Process subscription payment
   */
  async processSubscriptionPayment(
    subscriptionId: string,
    paymentData: {
      amount: number;
      currency: string;
      paystackReference: string;
      paystackTransactionId: string;
      authorizationCode?: string;
      periodStart: Date;
      periodEnd: Date;
      status: PaymentStatus;
      paidAt?: Date;
      failureReason?: string;
    },
  ): Promise<SubscriptionPayment> {
    try {
      this.logger.log(`Processing payment for subscription: ${subscriptionId}`);

      const subscription = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true },
      });

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      // Create payment record
      const payment = await this.prisma.subscriptionPayment.create({
        data: {
          subscriptionId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: paymentData.status,
          paystackReference: paymentData.paystackReference,
          paystackTransactionId: paymentData.paystackTransactionId,
          authorizationCode: paymentData.authorizationCode,
          periodStart: paymentData.periodStart,
          periodEnd: paymentData.periodEnd,
          paidAt: paymentData.paidAt,
          failureReason: paymentData.failureReason,
        },
      });

      // Update subscription based on payment status
      if (paymentData.status === PaymentStatus.SUCCESSFUL) {
        const nextBillingDate = this.calculatePeriodEnd(
          paymentData.periodEnd,
          subscription.plan.interval,
          subscription.plan.intervalCount,
        );

        await this.prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: paymentData.periodStart,
            currentPeriodEnd: paymentData.periodEnd,
            nextBillingDate,
            lastPaymentDate: paymentData.paidAt,
            failedPaymentCount: 0,
          },
        });
      } else if (paymentData.status === PaymentStatus.FAILED) {
        await this.prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            failedPaymentCount: { increment: 1 },
            status: SubscriptionStatus.PAST_DUE,
          },
        });
      }

      this.logger.log(
        `Payment processed successfully for subscription: ${subscriptionId}`,
      );
      return payment;
    } catch (error) {
      this.logger.error(
        `Failed to process subscription payment: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Calculate period end date based on interval
   */
  private calculatePeriodEnd(
    startDate: Date,
    interval: SubscriptionInterval,
    intervalCount: number,
  ): Date {
    const endDate = new Date(startDate);

    switch (interval) {
      case SubscriptionInterval.DAILY:
        endDate.setDate(endDate.getDate() + intervalCount);
        break;
      case SubscriptionInterval.WEEKLY:
        endDate.setDate(endDate.getDate() + intervalCount * 7);
        break;
      case SubscriptionInterval.MONTHLY:
        endDate.setMonth(endDate.getMonth() + intervalCount);
        break;
      case SubscriptionInterval.QUARTERLY:
        endDate.setMonth(endDate.getMonth() + intervalCount * 3);
        break;
      case SubscriptionInterval.YEARLY:
        endDate.setFullYear(endDate.getFullYear() + intervalCount);
        break;
    }

    return endDate;
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats(organisationId?: string) {
    const where: any = {};
    if (organisationId) where.organisationId = organisationId;

    const [
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      trialingSubscriptions,
      pastDueSubscriptions,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      this.prisma.subscription.count({ where }),
      this.prisma.subscription.count({
        where: { ...where, status: SubscriptionStatus.ACTIVE },
      }),
      this.prisma.subscription.count({
        where: { ...where, status: SubscriptionStatus.CANCELLED },
      }),
      this.prisma.subscription.count({
        where: { ...where, status: SubscriptionStatus.TRIALING },
      }),
      this.prisma.subscription.count({
        where: { ...where, status: SubscriptionStatus.PAST_DUE },
      }),
      this.prisma.subscriptionPayment.aggregate({
        where: {
          subscription: where,
          status: PaymentStatus.SUCCESSFUL,
        },
        _sum: { amount: true },
      }),
      this.prisma.subscriptionPayment.aggregate({
        where: {
          subscription: where,
          status: PaymentStatus.SUCCESSFUL,
          paidAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      trialingSubscriptions,
      pastDueSubscriptions,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
    };
  }

  /**
   * Get subscription payments with filtering
   */
  async getSubscriptionPayments(filter: any = {}): Promise<any[]> {
    const where: any = {};

    if (filter.organisationId) {
      where.subscription = {
        organisationId: filter.organisationId,
      };
    }

    if (filter.subscriptionId) {
      where.subscriptionId = filter.subscriptionId;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.dateFrom || filter.dateTo) {
      where.createdAt = {};
      if (filter.dateFrom) {
        where.createdAt.gte = new Date(filter.dateFrom);
      }
      if (filter.dateTo) {
        where.createdAt.lte = new Date(filter.dateTo);
      }
    }

    return this.prisma.subscriptionPayment.findMany({
      where,
      include: {
        subscription: {
          include: {
            plan: true,
            customer: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: filter.skip || 0,
      take: filter.take || 50,
    });
  }

  /**
   * Update organization status based on subscription status
   */
  async updateOrganizationStatusFromSubscription(
    organizationId: string,
    subscriptionStatus: SubscriptionStatus,
  ): Promise<void> {
    try {
      this.logger.log(`Updating organization status for: ${organizationId}`);

      let organizationStatus: any;

      switch (subscriptionStatus) {
        case SubscriptionStatus.ACTIVE:
          organizationStatus = 'ACTIVE';
          break;
        case SubscriptionStatus.TRIALING:
          organizationStatus = 'TRIAL';
          break;
        case SubscriptionStatus.PAST_DUE:
          organizationStatus = 'SUSPENDED';
          break;
        case SubscriptionStatus.CANCELLED:
          organizationStatus = 'CANCELLED';
          break;
        default:
          organizationStatus = 'INACTIVE';
      }

      await this.prisma.organisation.update({
        where: { id: organizationId },
        data: {
          status: organizationStatus,
          updatedAt: new Date(),
        },
      });

      this.logger.log(
        `Organization ${organizationId} status updated to: ${organizationStatus}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update organization status: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Check and update expired subscriptions
   */
  async checkAndUpdateExpiredSubscriptions(): Promise<void> {
    try {
      this.logger.log('Checking for expired subscriptions...');

      const now = new Date();

      // Find subscriptions that have expired
      const expiredSubscriptions = await this.prisma.subscription.findMany({
        where: {
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
          },
          OR: [
            {
              // Trial expired
              trialEnd: {
                lt: now,
              },
              status: SubscriptionStatus.TRIALING,
            },
            {
              // Subscription period expired
              currentPeriodEnd: {
                lt: now,
              },
              status: SubscriptionStatus.ACTIVE,
            },
          ],
        },
        include: {
          organisation: true,
          plan: true,
        },
      });

      this.logger.log(
        `Found ${expiredSubscriptions.length} expired subscriptions`,
      );

      for (const subscription of expiredSubscriptions) {
        // Update subscription status to PAST_DUE (grace period)
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.PAST_DUE,
            updatedAt: new Date(),
          },
        });

        // Update organization status
        await this.updateOrganizationStatusFromSubscription(
          subscription.organisationId,
          SubscriptionStatus.PAST_DUE,
        );

        this.logger.log(`Subscription ${subscription.id} marked as PAST_DUE`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to check expired subscriptions: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Check and cancel subscriptions in grace period
   */
  async checkAndCancelGracePeriodSubscriptions(
    gracePeriodDays: number = 7,
  ): Promise<void> {
    try {
      this.logger.log('Checking for subscriptions past grace period...');

      const gracePeriodDate = new Date();
      gracePeriodDate.setDate(gracePeriodDate.getDate() - gracePeriodDays);

      // Find subscriptions that are past due and beyond grace period
      const pastDueSubscriptions = await this.prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.PAST_DUE,
          updatedAt: {
            lt: gracePeriodDate,
          },
        },
        include: {
          organisation: true,
        },
      });

      this.logger.log(
        `Found ${pastDueSubscriptions.length} subscriptions past grace period`,
      );

      for (const subscription of pastDueSubscriptions) {
        // Cancel subscription
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.CANCELLED,
            cancelledAt: new Date(),
            cancelReason: 'Automatic cancellation due to non-payment',
            updatedAt: new Date(),
          },
        });

        // Update organization status to CANCELLED
        await this.updateOrganizationStatusFromSubscription(
          subscription.organisationId,
          SubscriptionStatus.CANCELLED,
        );

        this.logger.log(
          `Subscription ${subscription.id} automatically cancelled`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to check grace period subscriptions: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Get organization subscription status
   */
  async getOrganizationSubscriptionStatus(organizationId: string): Promise<{
    hasActiveSubscription: boolean;
    subscription?: Subscription;
    daysUntilExpiry?: number;
    isInGracePeriod?: boolean;
  }> {
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: {
          organisationId: organizationId,
          status: {
            in: [
              SubscriptionStatus.ACTIVE,
              SubscriptionStatus.TRIALING,
              SubscriptionStatus.PAST_DUE,
            ],
          },
        },
        include: {
          plan: true,
          organisation: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!subscription) {
        return { hasActiveSubscription: false };
      }

      const now = new Date();
      const expiryDate = subscription.trialEnd || subscription.currentPeriodEnd;
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        hasActiveSubscription:
          subscription.status === SubscriptionStatus.ACTIVE ||
          subscription.status === SubscriptionStatus.TRIALING,
        subscription,
        daysUntilExpiry,
        isInGracePeriod: subscription.status === SubscriptionStatus.PAST_DUE,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get organization subscription status: ${error.message}`,
        error.stack,
      );
      return { hasActiveSubscription: false };
    }
  }

  /**
   * Create organization-centric subscription (updated method)
   */
  async createOrganizationSubscription(
    organizationId: string,
    planId: string,
    input: {
      startDate?: string;
      authorizationCode?: string;
      metadata?: any;
    },
  ): Promise<Subscription> {
    try {
      this.logger.log(
        `Creating organization subscription for: ${organizationId}`,
      );

      // Validate organization exists
      const organization = await this.prisma.organisation.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      // Validate plan exists
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException('Subscription plan not found');
      }

      if (!plan.isActive) {
        throw new BadRequestException('Subscription plan is not active');
      }

      // Check if organization already has an active subscription
      // Only block if subscription is truly active (ACTIVE or TRIALING with valid dates)
      const existingSubscription = await this.prisma.subscription.findFirst({
        where: {
          organisationId: organizationId,
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
          },
        },
      });

      // Additional check for truly active subscriptions (not expired)
      if (existingSubscription) {
        const now = new Date();
        const currentPeriodEnd = new Date(
          existingSubscription.currentPeriodEnd,
        );
        const trialEnd = existingSubscription.trialEnd
          ? new Date(existingSubscription.trialEnd)
          : null;

        const isSubscriptionExpired = now > currentPeriodEnd;
        const isTrialExpired = trialEnd && now > trialEnd;

        // Only block if subscription is truly active (not expired)
        if (
          existingSubscription.status === SubscriptionStatus.ACTIVE &&
          !isSubscriptionExpired
        ) {
          throw new BadRequestException(
            'Organization already has an active subscription',
          );
        }

        if (
          existingSubscription.status === SubscriptionStatus.TRIALING &&
          !isTrialExpired
        ) {
          throw new BadRequestException(
            'Organization already has an active trial subscription',
          );
        }
      }

      // Calculate subscription dates
      const now = new Date();
      const currentPeriodStart = input.startDate
        ? new Date(input.startDate)
        : now;
      const currentPeriodEnd = this.calculatePeriodEnd(
        currentPeriodStart,
        plan.interval,
        plan.intervalCount,
      );

      let trialStart: Date | null = null;
      let trialEnd: Date | null = null;

      if (plan.trialPeriodDays && plan.trialPeriodDays > 0) {
        trialStart = currentPeriodStart;
        trialEnd = new Date(currentPeriodStart);
        trialEnd.setDate(trialEnd.getDate() + plan.trialPeriodDays);
      }

      // Create subscription in database - organization is the customer
      const subscription = await this.prisma.subscription.create({
        data: {
          customerId: organizationId, // Organization is the customer
          planId: planId,
          status: trialStart
            ? SubscriptionStatus.TRIALING
            : SubscriptionStatus.ACTIVE,
          currentPeriodStart,
          currentPeriodEnd,
          trialStart,
          trialEnd,
          nextBillingDate: trialEnd || currentPeriodEnd,
          organisationId: organizationId,
          metadata: {
            ...input.metadata,
            organizationCentric: true,
            systemGenerated: true,
          },
        },
        include: {
          customer: true,
          plan: true,
          payments: true,
        },
      });

      // Update organization status
      await this.updateOrganizationStatusFromSubscription(
        organizationId,
        subscription.status,
      );

      this.logger.log(
        `Organization subscription created successfully: ${subscription.id}`,
      );
      return subscription;
    } catch (error) {
      this.logger.error(
        `Failed to create organization subscription: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Verify payment and create subscription
   */
  async verifyPaymentAndCreateSubscription(
    input: VerifyPaymentInput,
  ): Promise<Subscription> {
    try {
      // Verify payment on Paystack
      const paymentVerification = await this.paystackService.verifyTransaction(input.reference);

      if (!paymentVerification.status || paymentVerification.data.status !== 'success') {
        throw new BadRequestException('Payment verification failed or payment was not successful');
      }

      // Get the organization
      const organization = await this.prisma.organisation.findUnique({
        where: { id: input.organizationId },
      });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      // Get the subscription plan
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: input.planId },
      });

      if (!plan) {
        throw new NotFoundException('Subscription plan not found');
      }

      // Verify payment amount matches plan amount
      const expectedAmount = plan.amount * 100; // Convert to kobo/pesewas
      if (paymentVerification.data.amount !== expectedAmount) {
        throw new BadRequestException('Payment amount does not match plan amount');
      }

      // Create subscription for the organization
      const startDate = new Date();
      const currentPeriodEnd = new Date();
      
      // Calculate period end based on plan interval
      if (plan.interval === 'MONTHLY') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      } else if (plan.interval === 'YEARLY') {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      }

      const subscription = await this.prisma.subscription.create({
        data: {
          organisationId: input.organizationId,
          customerId: input.organizationId, // Organization-centric: customerId = organisationId
          planId: input.planId,
          status: 'ACTIVE',
          currentPeriodStart: startDate,
          currentPeriodEnd: currentPeriodEnd,
          paystackCustomerCode: paymentVerification.data.customer?.customer_code,
          metadata: {
            paymentReference: input.reference,
            contactName: input.contactName,
            contactEmail: input.contactEmail,
            verificationData: paymentVerification.data,
          },
        },
        include: {
          plan: true,
          organisation: true,
        },
      });

      // Create payment record
      await this.prisma.subscriptionPayment.create({
        data: {
          subscriptionId: subscription.id,
          amount: plan.amount,
          currency: plan.currency,
          status: 'SUCCESSFUL',
          paystackReference: input.reference,
          paidAt: new Date(),
          periodStart: startDate,
          periodEnd: currentPeriodEnd,
          metadata: {
            paystackData: paymentVerification.data,
          },
        },
      });

      this.logger.log(`Successfully created subscription ${subscription.id} for organization ${input.organizationId} after payment verification`);

      return subscription;
    } catch (error) {
      this.logger.error(
        `Failed to verify payment and create subscription: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
