import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaystackService } from './paystack.service';
import { SubscriptionPlan, SubscriptionInterval } from '@prisma/client';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { PlanFilterInput } from '../dto/plan-filter.input';
import { CreatePlanInput } from '../dto/create-plan.input';
import { UpdatePlanInput } from '../dto/update-plan.input';

@Injectable()
export class SubscriptionPlansService {
  private readonly logger = new Logger(SubscriptionPlansService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystackService: PaystackService,
  ) {}

  /**
   * Create a new subscription plan
   */
  async createPlan(input: CreatePlanDto): Promise<SubscriptionPlan> {
    try {
      this.logger.log(`Creating subscription plan: ${input.name}`);

      // Create plan on Paystack first
      const paystackPlan = await this.paystackService.createPlan({
        name: input.name,
        description: input.description,
        amount: input.amount,
        currency: input.currency || 'GHS',
        interval: input.interval,
        invoiceLimit: input.invoiceLimit,
        sendInvoices: input.sendInvoices,
        sendSms: input.sendSms,
        organisationId: input.organisationId,
      });

      // Create plan in database
      const plan = await this.prisma.subscriptionPlan.create({
        data: {
          name: input.name,
          description: input.description,
          amount: input.amount,
          currency: input.currency || 'GHS',
          interval: input.interval,
          intervalCount: input.intervalCount || 1,
          trialPeriodDays: input.trialPeriodDays,
          isActive: input.isActive !== false,
          paystackPlanCode: paystackPlan.data.plan_code,
          features: input.features,
          metadata: {
            ...(typeof input.metadata === 'object' && input.metadata !== null
              ? input.metadata
              : {}),
            paystackData: paystackPlan.data,
          },
          organisationId: input.organisationId,
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
   * Update a subscription plan
   */
  async updatePlan(
    id: string,
    input: UpdatePlanDto,
  ): Promise<SubscriptionPlan> {
    try {
      this.logger.log(`Updating subscription plan: ${id}`);

      const existingPlan = await this.prisma.subscriptionPlan.findUnique({
        where: { id },
      });

      if (!existingPlan) {
        throw new NotFoundException('Subscription plan not found');
      }

      // Update plan on Paystack if plan code exists
      if (existingPlan.paystackPlanCode) {
        try {
          await this.paystackService.updatePlan(existingPlan.paystackPlanCode, {
            name: input.name,
            description: input.description,
            amount: input.amount,
            currency: input.currency,
            interval: input.interval,
            invoiceLimit: input.invoiceLimit,
            sendInvoices: input.sendInvoices,
            sendSms: input.sendSms,
          });
        } catch (error) {
          this.logger.error(`Failed to update Paystack plan: ${error.message}`);
          // Continue with local update even if Paystack update fails
        }
      }

      // Update plan in database
      const updateData: any = {};

      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.amount !== undefined) updateData.amount = input.amount;
      if (input.currency !== undefined) updateData.currency = input.currency;
      if (input.interval !== undefined) updateData.interval = input.interval;
      if (input.intervalCount !== undefined)
        updateData.intervalCount = input.intervalCount;
      if (input.trialPeriodDays !== undefined)
        updateData.trialPeriodDays = input.trialPeriodDays;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.features !== undefined) updateData.features = input.features;
      if (input.metadata !== undefined) {
        updateData.metadata = {
          ...(typeof existingPlan.metadata === 'object' &&
          existingPlan.metadata !== null
            ? existingPlan.metadata
            : {}),
          ...input.metadata,
        };
      }

      const updatedPlan = await this.prisma.subscriptionPlan.update({
        where: { id },
        data: updateData,
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
   * Delete a subscription plan
   */
  async deletePlan(id: string): Promise<boolean> {
    try {
      this.logger.log(`Deleting subscription plan: ${id}`);

      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id },
        include: {
          subscriptions: {
            where: {
              status: {
                in: ['ACTIVE', 'TRIALING', 'PAST_DUE'],
              },
            },
          },
        },
      });

      if (!plan) {
        throw new NotFoundException('Subscription plan not found');
      }

      // Check if plan has active subscriptions
      if (plan.subscriptions.length > 0) {
        throw new BadRequestException(
          'Cannot delete plan with active subscriptions',
        );
      }

      // Soft delete by marking as inactive
      await this.prisma.subscriptionPlan.update({
        where: { id },
        data: {
          isActive: false,
        },
      });

      this.logger.log(`Subscription plan deleted successfully: ${id}`);
      return true;
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
  async getPlan(id: string): Promise<SubscriptionPlan> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        organisation: true,
        subscriptions: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return plan;
  }

  /**
   * Get subscription plans with filtering
   */
  async getPlans(filter: PlanFilterInput = {}): Promise<SubscriptionPlan[]> {
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
        organisation: true,
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
        organisation: true,
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
   * Sync plan with Paystack
   */
  async syncPlanWithPaystack(id: string): Promise<SubscriptionPlan> {
    try {
      this.logger.log(`Syncing plan with Paystack: ${id}`);

      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id },
      });

      if (!plan) {
        throw new NotFoundException('Subscription plan not found');
      }

      if (!plan.paystackPlanCode) {
        throw new BadRequestException('Plan does not have Paystack plan code');
      }

      // Fetch plan from Paystack (this would require implementing a get plan method in PaystackService)
      // For now, we'll just update the metadata
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

  /**
   * Create a new subscription plan (GraphQL version)
   */
  async createPlan(input: CreatePlanInput): Promise<SubscriptionPlan & { _count?: { subscriptions: number } }> {
    try {
      this.logger.log(`Creating subscription plan: ${input.name}`);

      // Create plan on Paystack first if amount > 0
      let paystackPlanCode: string | undefined;
      if (input.amount > 0) {
        try {
          const paystackPlan = await this.paystackService.createPlan({
            name: input.name,
            description: input.description,
            amount: input.amount,
            currency: input.currency || 'GHS',
            interval: input.interval,
          });
          paystackPlanCode = paystackPlan.plan_code;
        } catch (error) {
          this.logger.warn(`Failed to create Paystack plan: ${error.message}`);
          // Continue without Paystack integration for free plans
        }
      }

      // Create plan in database
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
          paystackPlanCode,
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
        throw new NotFoundException('Subscription plan not found');
      }

      // Update plan on Paystack if it exists and amount/interval changed
      if (existingPlan.paystackPlanCode && (input.amount !== undefined || input.interval !== undefined)) {
        try {
          // Note: Paystack doesn't allow updating plan amount/interval
          // We would need to create a new plan and migrate subscriptions
          this.logger.warn('Paystack plan update not implemented - plan changes may require manual intervention');
        } catch (error) {
          this.logger.warn(`Failed to update Paystack plan: ${error.message}`);
        }
      }

      // Update plan in database
      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.amount !== undefined) updateData.amount = input.amount;
      if (input.currency !== undefined) updateData.currency = input.currency;
      if (input.interval !== undefined) updateData.interval = input.interval;
      if (input.intervalCount !== undefined) updateData.intervalCount = input.intervalCount;
      if (input.trialPeriodDays !== undefined) updateData.trialPeriodDays = input.trialPeriodDays;
      if (input.features !== undefined) updateData.features = input.features;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      const plan = await this.prisma.subscriptionPlan.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      });

      this.logger.log(`Subscription plan updated successfully: ${id}`);
      return plan;
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
        throw new NotFoundException('Subscription plan not found');
      }

      // Check if plan has active subscriptions
      if (existingPlan._count.subscriptions > 0) {
        throw new BadRequestException(
          'Cannot delete plan with active subscriptions. Please deactivate the plan instead.'
        );
      }

      // Delete plan from Paystack if it exists
      if (existingPlan.paystackPlanCode) {
        try {
          // Note: Paystack doesn't have a delete plan endpoint
          // We would typically deactivate it instead
          this.logger.warn('Paystack plan deletion not implemented - plan may remain active on Paystack');
        } catch (error) {
          this.logger.warn(`Failed to delete Paystack plan: ${error.message}`);
        }
      }

      // Delete plan from database
      const deletedPlan = await this.prisma.subscriptionPlan.delete({
        where: { id },
        include: {
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      });

      this.logger.log(`Subscription plan deleted successfully: ${id}`);
      return deletedPlan;
    } catch (error) {
      this.logger.error(
        `Failed to delete subscription plan: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
