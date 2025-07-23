import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionLifecycleService {
  private readonly logger = new Logger(SubscriptionLifecycleService.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Run subscription lifecycle checks every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleSubscriptionLifecycle(): Promise<void> {
    this.logger.log('Running subscription lifecycle checks...');

    try {
      // Check for expired subscriptions
      await this.subscriptionsService.checkAndUpdateExpiredSubscriptions();

      // Check for subscriptions past grace period (7 days)
      await this.subscriptionsService.checkAndCancelGracePeriodSubscriptions(7);

      // Send expiry warnings
      await this.sendExpiryWarnings();

      this.logger.log('Subscription lifecycle checks completed successfully');
    } catch (error) {
      this.logger.error(
        `Subscription lifecycle checks failed: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Send expiry warnings to organizations
   */
  private async sendExpiryWarnings(): Promise<void> {
    try {
      const now = new Date();
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + 7); // 7 days warning

      // Find subscriptions expiring in 7 days
      const expiringSubscriptions = await this.prisma.subscription.findMany({
        where: {
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
          },
          OR: [
            {
              trialEnd: {
                gte: now,
                lte: warningDate,
              },
              status: SubscriptionStatus.TRIALING,
            },
            {
              currentPeriodEnd: {
                gte: now,
                lte: warningDate,
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

      for (const subscription of expiringSubscriptions) {
        // Log warning (in production, this would send emails/notifications)
        this.logger.warn(
          `Subscription ${subscription.id} for organization ${subscription.organisation?.name} expires in 7 days`,
        );

        // TODO: Implement email/notification service
        // await this.notificationService.sendExpiryWarning(subscription);
      }

      this.logger.log(
        `Sent expiry warnings for ${expiringSubscriptions.length} subscriptions`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send expiry warnings: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Manual trigger for subscription lifecycle checks (for testing)
   */
  async triggerLifecycleCheck(): Promise<{
    expiredCount: number;
    cancelledCount: number;
    warningsCount: number;
  }> {
    this.logger.log('Manually triggering subscription lifecycle checks...');

    const beforeExpired = await this.prisma.subscription.count({
      where: { status: SubscriptionStatus.PAST_DUE },
    });

    const beforeCancelled = await this.prisma.subscription.count({
      where: { status: SubscriptionStatus.CANCELLED },
    });

    await this.handleSubscriptionLifecycle();

    const afterExpired = await this.prisma.subscription.count({
      where: { status: SubscriptionStatus.PAST_DUE },
    });

    const afterCancelled = await this.prisma.subscription.count({
      where: { status: SubscriptionStatus.CANCELLED },
    });

    return {
      expiredCount: afterExpired - beforeExpired,
      cancelledCount: afterCancelled - beforeCancelled,
      warningsCount: 0, // Would be calculated from notification service
    };
  }

  /**
   * Get subscription lifecycle statistics
   */
  async getLifecycleStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    pastDueSubscriptions: number;
    cancelledSubscriptions: number;
    expiringIn7Days: number;
    expiringIn30Days: number;
  }> {
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const [
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      pastDueSubscriptions,
      cancelledSubscriptions,
      expiringIn7Days,
      expiringIn30Days,
    ] = await Promise.all([
      this.prisma.subscription.count(),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.TRIALING },
      }),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.PAST_DUE },
      }),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.CANCELLED },
      }),
      this.prisma.subscription.count({
        where: {
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
          },
          OR: [
            {
              trialEnd: {
                gte: now,
                lte: in7Days,
              },
              status: SubscriptionStatus.TRIALING,
            },
            {
              currentPeriodEnd: {
                gte: now,
                lte: in7Days,
              },
              status: SubscriptionStatus.ACTIVE,
            },
          ],
        },
      }),
      this.prisma.subscription.count({
        where: {
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
          },
          OR: [
            {
              trialEnd: {
                gte: now,
                lte: in30Days,
              },
              status: SubscriptionStatus.TRIALING,
            },
            {
              currentPeriodEnd: {
                gte: now,
                lte: in30Days,
              },
              status: SubscriptionStatus.ACTIVE,
            },
          ],
        },
      }),
    ]);

    return {
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      pastDueSubscriptions,
      cancelledSubscriptions,
      expiringIn7Days,
      expiringIn30Days,
    };
  }
}
