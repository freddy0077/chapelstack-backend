import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { SubscriptionPlansService } from '../services/subscription-plans.service';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { PlanFilterInput } from '../dto/plan-filter.input';
import { CreatePlanInput } from '../dto/create-plan.input';
import { UpdatePlanInput } from '../dto/update-plan.input';

@Resolver(() => SubscriptionPlan)
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class SubscriptionPlansResolver {
  constructor(
    private readonly subscriptionPlansService: SubscriptionPlansService,
  ) {}

  @Query(() => [SubscriptionPlan], { name: 'subscriptionPlans' })
  // @RequirePermissions({ action: 'read', subject: 'SubscriptionPlan' })
  async getSubscriptionPlans(
    @Args('filter', { type: () => PlanFilterInput, nullable: true })
    filter?: PlanFilterInput,
  ): Promise<SubscriptionPlan[]> {
    const plans = await this.subscriptionPlansService.getPlans(filter);
    return plans.map((plan) => ({
      ...plan,
      description: plan.description || undefined,
      paystackPlanCode: plan.paystackPlanCode || undefined,
      trialPeriodDays: plan.trialPeriodDays || undefined,
      organisationId: plan.organisationId || undefined,
      features: Array.isArray(plan.features)
        ? (plan.features as string[])
        : undefined,
    }));
  }

  @Query(() => SubscriptionPlan, { name: 'subscriptionPlan' })
  @RequirePermissions({ action: 'read', subject: 'SubscriptionPlan' })
  async getSubscriptionPlan(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlansService.getPlan(id);
    return {
      ...plan,
      description: plan.description || undefined,
      paystackPlanCode: plan.paystackPlanCode || undefined,
      trialPeriodDays: plan.trialPeriodDays || undefined,
      organisationId: plan.organisationId || undefined,
      features: Array.isArray(plan.features)
        ? (plan.features as string[])
        : undefined,
    };
  }

  @Query(() => [SubscriptionPlan], { name: 'popularSubscriptionPlans' })
  @RequirePermissions({ action: 'read', subject: 'SubscriptionPlan' })
  async getPopularSubscriptionPlans(
    @Args('organisationId', { type: () => ID, nullable: true })
    organisationId?: string,
    @Args('limit', { type: () => Number, defaultValue: 5 }) limit?: number,
  ): Promise<SubscriptionPlan[]> {
    const plans = await this.subscriptionPlansService.getPopularPlans(
      organisationId,
      limit,
    );
    return plans.map((plan) => ({
      ...plan,
      description: plan.description || undefined,
      paystackPlanCode: plan.paystackPlanCode || undefined,
      trialPeriodDays: plan.trialPeriodDays || undefined,
      organisationId: plan.organisationId || undefined,
      features: Array.isArray(plan.features)
        ? (plan.features as string[])
        : undefined,
    }));
  }

  @Mutation(() => SubscriptionPlan, { name: 'createSubscriptionPlan' })
  // @RequirePermissions({ action: 'create', subject: 'SubscriptionPlan' })
  async createSubscriptionPlan(
    @Args('input', { type: () => CreatePlanInput }) input: CreatePlanInput,
  ): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlansService.createPlan(input);
    return {
      ...plan,
      description: plan.description ?? undefined,
      trialPeriodDays: plan.trialPeriodDays ?? undefined,
      paystackPlanCode: plan.paystackPlanCode ?? undefined,
      organisationId: plan.organisationId ?? undefined,
      features: Array.isArray(plan.features) ? plan.features as string[] : undefined,
      activeSubscriptionsCount: plan._count?.subscriptions || 0,
    };
  }

  @Mutation(() => SubscriptionPlan, { name: 'updateSubscriptionPlan' })
  @RequirePermissions({ action: 'update', subject: 'SubscriptionPlan' })
  async updateSubscriptionPlan(
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdatePlanInput }) input: UpdatePlanInput,
  ): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlansService.updatePlan(id, input);
    return {
      ...plan,
      description: plan.description ?? undefined,
      trialPeriodDays: plan.trialPeriodDays ?? undefined,
      paystackPlanCode: plan.paystackPlanCode ?? undefined,
      organisationId: plan.organisationId ?? undefined,
      features: Array.isArray(plan.features) ? plan.features as string[] : undefined,
      activeSubscriptionsCount: plan._count?.subscriptions || 0,
    };
  }

  @Mutation(() => SubscriptionPlan, { name: 'deleteSubscriptionPlan' })
  @RequirePermissions({ action: 'delete', subject: 'SubscriptionPlan' })
  async deleteSubscriptionPlan(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlansService.deletePlan(id);
    return {
      ...plan,
      description: plan.description ?? undefined,
      trialPeriodDays: plan.trialPeriodDays ?? undefined,
      paystackPlanCode: plan.paystackPlanCode ?? undefined,
      organisationId: plan.organisationId ?? undefined,
      features: Array.isArray(plan.features) ? plan.features as string[] : undefined,
      activeSubscriptionsCount: plan._count?.subscriptions || 0,
    };
  }

  @Mutation(() => SubscriptionPlan, {
    name: 'syncSubscriptionPlanWithPaystack',
  })
  @RequirePermissions({ action: 'update', subject: 'SubscriptionPlan' })
  async syncSubscriptionPlanWithPaystack(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlansService.syncPlanWithPaystack(id);
    return {
      ...plan,
      description: plan.description || undefined,
      paystackPlanCode: plan.paystackPlanCode || undefined,
      trialPeriodDays: plan.trialPeriodDays || undefined,
      organisationId: plan.organisationId || undefined,
      features: Array.isArray(plan.features)
        ? (plan.features as string[])
        : undefined,
    };
  }

  @ResolveField('activeSubscriptionsCount', () => Number)
  async activeSubscriptionsCount(
    @Parent() plan: SubscriptionPlan,
  ): Promise<number> {
    // This would be populated by the service if needed
    return plan.activeSubscriptionsCount || 0;
  }
}
