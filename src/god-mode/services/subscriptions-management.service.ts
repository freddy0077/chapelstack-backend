import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateSubscriptionInput {
  organisationId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  autoRenew?: boolean;
}

export interface UpdateSubscriptionInput {
  endDate?: Date;
  autoRenew?: boolean;
  status?: string;
}

@Injectable()
export class SubscriptionsManagementService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all subscriptions with pagination
   */
  async getSubscriptions(skip: number = 0, take: number = 10) {
    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip,
        take,
        include: {
          plan: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.subscription.count(),
    ]);

    return {
      subscriptions,
      total,
      skip,
      take,
    };
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: true,
        organisation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  /**
   * Get subscriptions for an organisation
   */
  async getOrganisationSubscriptions(organisationId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { organisationId },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return subscriptions;
  }

  /**
   * Get all subscription plans
   */
  async getSubscriptionPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      orderBy: {
        amount: 'asc',
      },
    });

    return plans;
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats() {
    const [totalSubscriptions, activeSubscriptions, expiredSubscriptions] = await Promise.all([
      this.prisma.subscription.count(),
      this.prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.subscription.count({
        where: {
          status: 'CANCELLED',
        },
      }),
    ]);

    return {
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      totalRevenue: 0,
      monthlyRecurringRevenue: 0,
    };
  }

  /**
   * Create new subscription
   */
  async createSubscription(input: CreateSubscriptionInput) {
    // Verify organisation exists
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: input.organisationId },
    });

    if (!organisation) {
      throw new NotFoundException(`Organisation with ID ${input.organisationId} not found`);
    }

    // Verify plan exists
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: input.planId },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${input.planId} not found`);
    }

    // Check if organisation already has an active subscription
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        organisationId: input.organisationId,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      throw new BadRequestException(
        `Organisation already has an active subscription. Cancel it first to create a new one.`,
      );
    }

    // Determine status based on dates
    let status = 'ACTIVE';
    if (new Date(input.endDate) < new Date()) {
      status = 'EXPIRED';
    }

    const subscription = await this.prisma.subscription.create({
      data: {
        organisationId: input.organisationId,
        planId: input.planId,
        customerId: input.organisationId,
        currentPeriodStart: input.startDate,
        currentPeriodEnd: input.endDate,
        status: status as any,
      },
      include: {
        plan: true,
      },
    });

    return subscription;
  }

  /**
   * Update subscription
   */
  async updateSubscription(id: string, input: UpdateSubscriptionInput) {
    // Verify subscription exists
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    // Determine status based on end date
    let status = input.status || subscription.status;
    if (input.endDate) {
      if (new Date(input.endDate) < new Date()) {
        status = 'EXPIRED';
      } else if (status === 'EXPIRED') {
        status = 'ACTIVE';
      }
    }

    const updateData: any = {};
    if (input.endDate) updateData.currentPeriodEnd = input.endDate;
    if (input.autoRenew !== undefined) updateData.cancelAtPeriodEnd = !input.autoRenew;
    if (status) updateData.status = status;

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        plan: true,
      },
    });

    return updatedSubscription;
  }

  /**
   * Delete subscription
   */
  async deleteSubscription(id: string) {
    // Verify subscription exists
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    await this.prisma.subscription.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Subscription deleted successfully`,
    };
  }

  /**
   * Upgrade subscription to a new plan
   */
  async upgradeSubscription(id: string, newPlanId: string) {
    // Verify subscription exists
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    // Verify new plan exists
    const newPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan) {
      throw new NotFoundException(`Plan with ID ${newPlanId} not found`);
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        planId: newPlanId,
      },
      include: {
        plan: true,
      },
    });

    return updatedSubscription;
  }

  /**
   * Renew subscription
   */
  async renewSubscription(id: string) {
    // Verify subscription exists
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    // Calculate new end date based on current period end
    const newEndDate = new Date(subscription.currentPeriodEnd);
    newEndDate.setMonth(newEndDate.getMonth() + 1);

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        currentPeriodEnd: newEndDate,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
    });

    return updatedSubscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(id: string) {
    // Verify subscription exists
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      include: {
        plan: true,
      },
    });

    return updatedSubscription;
  }

  /**
   * Check if organisation has active subscription
   */
  async hasActiveSubscription(organisationId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        organisationId,
        status: 'ACTIVE',
        currentPeriodEnd: {
          gt: new Date(),
        },
      },
    });

    return !!subscription;
  }
}
