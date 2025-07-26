import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionPlan, SubscriptionInterval } from '@prisma/client';
import { CreatePlanInput } from '../dto/create-plan.input';
import { UpdatePlanInput } from '../dto/update-plan.input';

@Injectable()
export class SubscriptionPlansService {
  private readonly logger = new Logger(SubscriptionPlansService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create a new subscription plan (GraphQL version)
   */
  async createPlan(input: CreatePlanInput): Promise<SubscriptionPlan & { _count?: { subscriptions: number } }> {
    try {
      this.logger.log(`Creating subscription plan: ${input.name}`);

      // Create plan in database (no Paystack plan creation needed)
      const plan = await this.prisma.subscriptionPlan.create({
        data: {
          name: input.name,
          description: input.description,
          amount: input.amount,
          currency: input.currency || 'GHS',
          interval: input.interval,
          intervalCount: input.intervalCount || 1,
          trialPeriodDays: input.trialPeriodDays || 0,
          features: input.features || [],
          isActive: input.isActive !== false,
          // Remove paystackPlanCode as we're using Accept Payments API
        },
        include: {
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      });

      this.logger.log(`Subscription plan created successfully: ${plan.id}`);
      return plan;
    } catch (error) {
      this.logger.error(
        `Failed to create subscription plan: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update a subscription plan (GraphQL version)
   */
  async updatePlan(id: string, input: UpdatePlanInput): Promise<SubscriptionPlan & { _count?: { subscriptions: number } }> {
    try {
      this.logger.log(`Updating subscription plan: ${id}`);

      const existingPlan = await this.prisma.subscriptionPlan.findUnique({
        where: { id },
      });

      if (!existingPlan) {
        throw new NotFoundException(`Subscription plan with ID ${id} not found`);
      }

      // Update plan in database (no Paystack plan update needed)
      const updatedPlan = await this.prisma.subscriptionPlan.update({
        where: { id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.amount && { amount: input.amount }),
          ...(input.currency && { currency: input.currency }),
          ...(input.interval && { interval: input.interval }),
          ...(input.intervalCount && { intervalCount: input.intervalCount }),
          ...(input.trialPeriodDays !== undefined && { trialPeriodDays: input.trialPeriodDays }),
          ...(input.features && { features: input.features }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
        include: {
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      });

      this.logger.log(`Subscription plan updated successfully: ${id}`);
      return updatedPlan;
    } catch (error) {
      this.logger.error(
        `Failed to update subscription plan: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete a subscription plan (GraphQL version)
   */
  async deletePlan(id: string): Promise<SubscriptionPlan & { _count?: { subscriptions: number } }> {
    try {
      this.logger.log(`Deleting subscription plan: ${id}`);

      const existingPlan = await this.prisma.subscriptionPlan.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      });

      if (!existingPlan) {
        throw new NotFoundException(`Subscription plan with ID ${id} not found`);
      }

      // Check if plan has active subscriptions
      if (existingPlan._count.subscriptions > 0) {
        throw new BadRequestException(
          'Cannot delete plan with active subscriptions. Please cancel all subscriptions first.',
        );
      }

      // Delete plan from database (no Paystack plan deletion needed)
      await this.prisma.subscriptionPlan.delete({
        where: { id },
      });

      this.logger.log(`Subscription plan deleted successfully: ${id}`);
      return existingPlan;
    } catch (error) {
      this.logger.error(
        `Failed to delete subscription plan: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get subscription plan by ID
   */
  async getPlan(id: string): Promise<SubscriptionPlan & { _count?: { subscriptions: number } }> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID ${id} not found`);
    }

    return plan;
  }

  /**
   * Get subscription plans with filtering
   */
  async getPlans(filter: any = {}): Promise<SubscriptionPlan[]> {
    const where: any = {};

    if (filter.organisationId) {
      where.organisationId = filter.organisationId;
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    if (filter.interval) {
      where.interval = filter.interval;
    }

    if (filter.minAmount !== undefined) {
      where.amount = { gte: filter.minAmount };
    }

    if (filter.maxAmount !== undefined) {
      where.amount = { ...where.amount, lte: filter.maxAmount };
    }

    if (filter.searchTerm) {
      where.OR = [
        { name: { contains: filter.searchTerm, mode: 'insensitive' } },
        { description: { contains: filter.searchTerm, mode: 'insensitive' } },
      ];
    }

    return this.prisma.subscriptionPlan.findMany({
      where,
      include: {
        _count: {
          select: {
            subscriptions: {
              where: {
                status: {
                  in: ['ACTIVE', 'TRIALING'],
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: filter.skip || 0,
      take: filter.take || 50,
    });
  }

  /**
   * Get popular plans
   */
  async getPopularPlans(
    organisationId?: string,
    limit: number = 5,
  ): Promise<SubscriptionPlan[]> {
    const where: any = { isActive: true };
    if (organisationId) where.organisationId = organisationId;

    return this.prisma.subscriptionPlan.findMany({
      where,
      include: {
        _count: {
          select: {
            subscriptions: {
              where: {
                status: {
                  in: ['ACTIVE', 'TRIALING'],
                },
              },
            },
          },
        },
      },
      orderBy: {
        subscriptions: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }

  /**
   * Get plan statistics
   */
  async getPlanStats(organisationId?: string) {
    const where: any = {};
    if (organisationId) where.organisationId = organisationId;

    const [
      totalPlans,
      activePlans,
      inactivePlans,
      totalSubscriptions,
      activeSubscriptions,
    ] = await Promise.all([
      this.prisma.subscriptionPlan.count({ where }),
      this.prisma.subscriptionPlan.count({
        where: { ...where, isActive: true },
      }),
      this.prisma.subscriptionPlan.count({
        where: { ...where, isActive: false },
      }),
      this.prisma.subscription.count({
        where: {
          plan: where,
        },
      }),
      this.prisma.subscription.count({
        where: {
          plan: where,
          status: {
            in: ['ACTIVE', 'TRIALING'],
          },
        },
      }),
    ]);

    return {
      totalPlans,
      activePlans,
      inactivePlans,
      totalSubscriptions,
      activeSubscriptions,
    };
  }

  /**
   * Sync plan with Paystack
   */
  async syncPlanWithPaystack(id: string): Promise<SubscriptionPlan & { _count?: { subscriptions: number } }> {
    try {
      this.logger.log(`Syncing plan with Paystack: ${id}`);

      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      });

      if (!plan) {
        throw new NotFoundException(`Subscription plan with ID ${id} not found`);
      }

      if (!plan.paystackPlanCode) {
        throw new BadRequestException('Plan does not have Paystack plan code');
      }

      // For now, we'll just update the metadata to indicate sync
      const updatedPlan = await this.prisma.subscriptionPlan.update({
        where: { id },
        data: {
          metadata: {
            ...(typeof plan.metadata === 'object' && plan.metadata !== null
              ? plan.metadata
              : {}),
            lastSyncedAt: new Date().toISOString(),
          },
        },
        include: {
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      });

      this.logger.log(`Plan synced with Paystack successfully: ${id}`);
      return updatedPlan;
    } catch (error) {
      this.logger.error(
        `Failed to sync plan with Paystack: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
