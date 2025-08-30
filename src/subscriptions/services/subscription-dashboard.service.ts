import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  SubscriptionDashboardStats,
  SubscriptionActivityItem,
  SubscriptionTabCounts,
} from '../entities/subscription-dashboard-stats.entity';

@Injectable()
export class SubscriptionDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<SubscriptionDashboardStats> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    const lastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate(),
    );
    const lastYear = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate(),
    );

    // Get current stats
    const [
      totalOrganizations,
      activeSubscriptions,
      expiredSubscriptions,
      expiringSoon,
      trialSubscriptions,
      gracePeriodSubscriptions,
      monthlyRevenue,
      totalRevenue,
      lastMonthOrgs,
      lastYearOrgs,
      lastMonthSubs,
      lastYearSubs,
      lastMonthRevenue,
      lastYearRevenue,
    ] = await Promise.all([
      // Total organizations
      this.prisma.organisation.count(),

      // Active subscriptions
      this.prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),

      // Expired subscriptions
      this.prisma.subscription.count({
        where: { status: 'PAST_DUE' },
      }),

      // Expiring soon (within 30 days)
      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            lte: thirtyDaysFromNow,
          },
        },
      }),

      // Trial subscriptions
      this.prisma.subscription.count({
        where: { status: 'TRIALING' },
      }),

      // Grace period subscriptions
      this.prisma.subscription.count({
        where: { status: 'INCOMPLETE' },
      }),

      // Monthly revenue (current month)
      this.prisma.subscriptionPayment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESSFUL',
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        },
      }),

      // Total revenue
      this.prisma.subscriptionPayment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESSFUL' },
      }),

      // Last month organizations for growth calculation
      this.prisma.organisation.count({
        where: {
          createdAt: { lte: lastMonth },
        },
      }),

      // Last year organizations for growth calculation
      this.prisma.organisation.count({
        where: {
          createdAt: { lte: lastYear },
        },
      }),

      // Last month subscriptions for growth calculation
      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          createdAt: { lte: lastMonth },
        },
      }),

      // Last year subscriptions for growth calculation
      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          createdAt: { lte: lastYear },
        },
      }),

      // Last month revenue
      this.prisma.subscriptionPayment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESSFUL',
          createdAt: {
            gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
            lt: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        },
      }),

      // Last year revenue
      this.prisma.subscriptionPayment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESSFUL',
          createdAt: {
            gte: new Date(lastYear.getFullYear(), lastYear.getMonth(), 1),
            lt: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        },
      }),
    ]);

    // Calculate growth rates
    const organizationGrowthRate =
      lastMonthOrgs > 0
        ? ((totalOrganizations - lastMonthOrgs) / lastMonthOrgs) * 100
        : 0;

    const subscriptionGrowthRate =
      lastMonthSubs > 0
        ? ((activeSubscriptions - lastMonthSubs) / lastMonthSubs) * 100
        : 0;

    const currentMonthRevenue = monthlyRevenue._sum?.amount || 0;
    const previousMonthRevenue = lastMonthRevenue._sum?.amount || 0;
    const revenueGrowthRate =
      previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue) *
          100
        : 0;

    return {
      totalOrganizations,
      activeSubscriptions,
      expiredSubscriptions,
      expiringSoon,
      monthlyRevenue: currentMonthRevenue,
      totalRevenue: totalRevenue._sum?.amount || 0,
      organizationGrowthRate: Math.round(organizationGrowthRate * 100) / 100,
      subscriptionGrowthRate: Math.round(subscriptionGrowthRate * 100) / 100,
      revenueGrowthRate: Math.round(revenueGrowthRate * 100) / 100,
      trialSubscriptions,
      gracePeriodSubscriptions,
    };
  }

  async getRecentActivity(
    limit: number = 10,
  ): Promise<SubscriptionActivityItem[]> {
    // Get recent subscription events
    const recentSubscriptions = await this.prisma.subscription.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        organisation: {
          select: { name: true },
        },
      },
    });

    // Get recent payments
    const recentPayments = await this.prisma.subscriptionPayment.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: {
          include: {
            organisation: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Get recent organizations
    const recentOrganizations = await this.prisma.organisation.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Combine and format activities
    const activities: SubscriptionActivityItem[] = [];

    // Add subscription activities
    recentSubscriptions.forEach((sub) => {
      activities.push({
        id: `sub_${sub.id}`,
        type: 'SUBSCRIPTION_CREATED',
        description: `New subscription created for ${sub.organisation.name}`,
        organizationName: sub.organisation.name,
        organizationId: sub.organisationId,
        subscriptionId: sub.id,
        timestamp: sub.createdAt.toISOString(),
        metadata: {
          planId: sub.planId,
          status: sub.status,
          currentPeriodEnd: sub.currentPeriodEnd,
        },
        severity: 'SUCCESS',
      });
    });

    // Add payment activities
    recentPayments.forEach((payment) => {
      const severity =
        payment.status === 'SUCCESSFUL'
          ? 'SUCCESS'
          : payment.status === 'FAILED'
            ? 'ERROR'
            : 'INFO';
      const description =
        payment.status === 'SUCCESSFUL'
          ? `Payment completed for ${payment.subscription.organisation.name}`
          : payment.status === 'FAILED'
            ? `Payment failed for ${payment.subscription.organisation.name}`
            : `Payment pending for ${payment.subscription.organisation.name}`;

      activities.push({
        id: `pay_${payment.id}`,
        type: `PAYMENT_${payment.status}`,
        description,
        organizationName: payment.subscription.organisation.name,
        organizationId: payment.subscription.organisationId,
        subscriptionId: payment.subscriptionId,
        timestamp: payment.createdAt.toISOString(),
        metadata: {
          amount: payment.amount,
          status: payment.status,
          subscriptionId: payment.subscriptionId,
        },
        severity,
      });
    });

    // Add organization activities
    recentOrganizations.forEach((org) => {
      activities.push({
        id: `org_${org.id}`,
        type: 'ORGANIZATION_CREATED',
        description: `New organization registered: ${org.name}`,
        organizationName: org.name,
        organizationId: org.id,
        timestamp: org.createdAt.toISOString(),
        metadata: {
          organizationId: org.id,
          status: org.status,
        },
        severity: 'INFO',
      });
    });

    // Sort by timestamp and return limited results
    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  }

  async getTabCounts(): Promise<SubscriptionTabCounts> {
    const [
      activeSubscriptions,
      expiredSubscriptions,
      trialSubscriptions,
      gracePeriodSubscriptions,
      pendingRenewals,
      cancelledSubscriptions,
    ] = await Promise.all([
      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
        },
      }),

      this.prisma.subscription.count({
        where: {
          status: 'PAST_DUE',
        },
      }),

      this.prisma.subscription.count({
        where: {
          status: 'TRIALING',
        },
      }),

      this.prisma.subscription.count({
        where: {
          status: 'INCOMPLETE',
        },
      }),

      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
          },
        },
      }),

      this.prisma.subscription.count({
        where: {
          status: 'CANCELLED',
        },
      }),
    ]);

    return {
      activeSubscriptions,
      expiredSubscriptions,
      trialSubscriptions,
      gracePeriodSubscriptions,
      pendingRenewals,
      cancelledSubscriptions,
    };
  }
}
