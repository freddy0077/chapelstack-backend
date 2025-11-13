import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  ID,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import { SubscriptionsService } from '../../subscriptions/services/subscriptions.service';
import { SubscriptionPlansService } from '../../subscriptions/services/subscription-plans.service';
import { SubscriptionLifecycleService } from '../../subscriptions/services/subscription-lifecycle.service';
import { SubscriptionDashboardService } from '../../subscriptions/services/subscription-dashboard.service';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { SubscriptionPlan } from '../../subscriptions/entities/subscription-plan.entity';
import { SubscriptionPayment } from '../../subscriptions/entities/subscription-payment.entity';
import { SubscriptionFilterInput } from '../../subscriptions/dto/subscription-filter.input';
import { PaymentFilterInput } from '../../subscriptions/dto/payment-filter.input';
import { PlanFilterInput } from '../../subscriptions/dto/plan-filter.input';
import { CreateSubscriptionInput } from '../../subscriptions/dto/create-subscription.input';
import { CreateOrganizationSubscriptionInput } from '../../subscriptions/dto/create-organization-subscription.input';
import { UpdateSubscriptionInput } from '../../subscriptions/dto/update-subscription.input';
import { CreatePlanInput } from '../../subscriptions/dto/create-plan.input';
import { UpdatePlanInput } from '../../subscriptions/dto/update-plan.input';
import { OrganizationSubscriptionStatus } from '../../subscriptions/entities/organization-subscription-status.entity';
import { SubscriptionLifecycleStats } from '../../subscriptions/entities/subscription-lifecycle-stats.entity';
import { SubscriptionLifecycleResult } from '../../subscriptions/entities/subscription-lifecycle-result.entity';
import {
  SubscriptionDashboardStats,
  SubscriptionActivityItem,
  SubscriptionTabCounts,
} from '../../subscriptions/entities/subscription-dashboard-stats.entity';

@ObjectType()
export class SubscriptionPlanType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  price: number;

  @Field()
  currency: string;

  @Field()
  billingCycle: string;

  @Field(() => [String], { nullable: true })
  features?: string[];

  @Field(() => Int, { nullable: true })
  maxUsers?: number;

  @Field(() => Int, { nullable: true })
  maxOrganisations?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class GodModeSubscriptionType {
  @Field()
  id: string;

  @Field()
  organisationId: string;

  @Field()
  planId: string;

  @Field()
  status: string;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field()
  autoRenew: boolean;

  @Field()
  amount: number;

  @Field()
  currency: string;

  @Field()
  billingCycle: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class SubscriptionsResponseType {
  @Field(() => [GodModeSubscriptionType])
  subscriptions: GodModeSubscriptionType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
export class SubscriptionStatsType {
  @Field(() => Int)
  totalSubscriptions: number;

  @Field(() => Int)
  activeSubscriptions: number;

  @Field(() => Int)
  expiredSubscriptions: number;

  @Field()
  totalRevenue: number;

  @Field()
  monthlyRecurringRevenue: number;
}

@InputType()
export class CreateSubscriptionInputType {
  @Field()
  organisationId: string;

  @Field()
  planId: string;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field({ nullable: true, defaultValue: true })
  autoRenew?: boolean;
}

@InputType()
export class UpdateSubscriptionInputType {
  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  autoRenew?: boolean;

  @Field({ nullable: true })
  status?: string;
}

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('GOD_MODE', 'SYSTEM_ADMIN')
export class SubscriptionsResolver {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly subscriptionPlansService: SubscriptionPlansService,
    private readonly subscriptionLifecycleService: SubscriptionLifecycleService,
    private readonly subscriptionDashboardService: SubscriptionDashboardService,
  ) {}

  // ============ SUBSCRIPTION QUERIES ============

  @Query(() => [Subscription], { name: 'godModeSubscriptions' })
  async getSubscriptions(
    @Args('filter', { type: () => SubscriptionFilterInput, nullable: true })
    filter?: SubscriptionFilterInput,
  ): Promise<Subscription[]> {
    const subs = await this.subscriptionsService.getSubscriptions(filter);
    return subs.map(sub => ({
      ...sub,
      paystackSubscriptionCode: sub.paystackSubscriptionCode || undefined,
      paystackCustomerCode: sub.paystackCustomerCode || undefined,
      trialStart: sub.trialStart || undefined,
      trialEnd: sub.trialEnd || undefined,
      cancelledAt: sub.cancelledAt || undefined,
      cancelReason: sub.cancelReason || undefined,
      nextBillingDate: sub.nextBillingDate || undefined,
      lastPaymentDate: sub.lastPaymentDate || undefined,
    }));
  }

  @Query(() => Subscription, { name: 'godModeSubscription' })
  async getSubscription(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Subscription> {
    const sub = await this.subscriptionsService.getSubscription(id);
    return {
      ...sub,
      paystackSubscriptionCode: sub.paystackSubscriptionCode || undefined,
      paystackCustomerCode: sub.paystackCustomerCode || undefined,
      trialStart: sub.trialStart || undefined,
      trialEnd: sub.trialEnd || undefined,
      cancelledAt: sub.cancelledAt || undefined,
      cancelReason: sub.cancelReason || undefined,
      nextBillingDate: sub.nextBillingDate || undefined,
      lastPaymentDate: sub.lastPaymentDate || undefined,
    };
  }

  @Query(() => OrganizationSubscriptionStatus, { name: 'godModeOrganizationSubscriptionStatus' })
  async organizationSubscriptionStatus(
    @Args('organizationId', { type: () => String }) organizationId: string,
  ): Promise<OrganizationSubscriptionStatus> {
    const status = await this.subscriptionsService.getOrganizationSubscriptionStatus(organizationId);
    return {
      hasActiveSubscription: status.hasActiveSubscription,
      subscription: status.subscription ? {
        ...status.subscription,
        paystackSubscriptionCode: status.subscription.paystackSubscriptionCode || undefined,
        paystackCustomerCode: status.subscription.paystackCustomerCode || undefined,
        trialStart: status.subscription.trialStart || undefined,
        trialEnd: status.subscription.trialEnd || undefined,
        cancelledAt: status.subscription.cancelledAt || undefined,
        cancelReason: status.subscription.cancelReason || undefined,
        nextBillingDate: status.subscription.nextBillingDate || undefined,
        lastPaymentDate: status.subscription.lastPaymentDate || undefined,
      } : undefined,
      daysUntilExpiry: status.daysUntilExpiry,
      isInGracePeriod: status.isInGracePeriod,
    };
  }

  @Query(() => SubscriptionLifecycleStats, { name: 'godModeSubscriptionLifecycleStats' })
  async subscriptionLifecycleStats(): Promise<SubscriptionLifecycleStats> {
    return this.subscriptionLifecycleService.getLifecycleStats();
  }

  @Query(() => [SubscriptionPayment], { name: 'godModeSubscriptionPayments' })
  async subscriptionPayments(
    @Args('filter', { type: () => PaymentFilterInput, nullable: true })
    filter?: PaymentFilterInput,
  ): Promise<SubscriptionPayment[]> {
    return this.subscriptionsService.getSubscriptionPayments(filter);
  }

  @Query(() => SubscriptionDashboardStats, { name: 'godModeSubscriptionDashboardStats' })
  async subscriptionDashboardStats(): Promise<SubscriptionDashboardStats> {
    return this.subscriptionDashboardService.getDashboardStats();
  }

  @Query(() => [SubscriptionActivityItem], { name: 'godModeSubscriptionRecentActivity' })
  async subscriptionRecentActivity(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 })
    limit?: number,
  ): Promise<SubscriptionActivityItem[]> {
    return this.subscriptionDashboardService.getRecentActivity(limit);
  }

  @Query(() => SubscriptionTabCounts, { name: 'godModeSubscriptionTabCounts' })
  async subscriptionTabCounts(): Promise<SubscriptionTabCounts> {
    return this.subscriptionDashboardService.getTabCounts();
  }

  // ============ SUBSCRIPTION MUTATIONS ============

  @Mutation(() => Subscription, { name: 'godModeCreateSubscription' })
  async createSubscription(
    @Args('input', { type: () => CreateSubscriptionInput })
    input: CreateSubscriptionInput,
  ): Promise<Subscription> {
    const sub = await this.subscriptionsService.createSubscription(input);
    return {
      ...sub,
      paystackSubscriptionCode: sub.paystackSubscriptionCode || undefined,
      paystackCustomerCode: sub.paystackCustomerCode || undefined,
      trialStart: sub.trialStart || undefined,
      trialEnd: sub.trialEnd || undefined,
      cancelledAt: sub.cancelledAt || undefined,
      cancelReason: sub.cancelReason || undefined,
      nextBillingDate: sub.nextBillingDate || undefined,
      lastPaymentDate: sub.lastPaymentDate || undefined,
    };
  }

  @Mutation(() => Subscription, { name: 'godModeUpdateSubscription' })
  async updateSubscription(
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdateSubscriptionInput })
    input: UpdateSubscriptionInput,
  ): Promise<Subscription> {
    const sub = await this.subscriptionsService.updateSubscription(id, input);
    return {
      ...sub,
      paystackSubscriptionCode: sub.paystackSubscriptionCode || undefined,
      paystackCustomerCode: sub.paystackCustomerCode || undefined,
      trialStart: sub.trialStart || undefined,
      trialEnd: sub.trialEnd || undefined,
      cancelledAt: sub.cancelledAt || undefined,
      cancelReason: sub.cancelReason || undefined,
      nextBillingDate: sub.nextBillingDate || undefined,
      lastPaymentDate: sub.lastPaymentDate || undefined,
    };
  }

  @Mutation(() => Subscription, { name: 'godModeCancelSubscription' })
  async cancelSubscription(
    @Args('id', { type: () => ID }) id: string,
    @Args('reason', { type: () => String, nullable: true }) reason?: string,
  ): Promise<Subscription> {
    const sub = await this.subscriptionsService.cancelSubscription(id, reason);
    return {
      ...sub,
      paystackSubscriptionCode: sub.paystackSubscriptionCode || undefined,
      paystackCustomerCode: sub.paystackCustomerCode || undefined,
      trialStart: sub.trialStart || undefined,
      trialEnd: sub.trialEnd || undefined,
      cancelledAt: sub.cancelledAt || undefined,
      cancelReason: sub.cancelReason || undefined,
      nextBillingDate: sub.nextBillingDate || undefined,
      lastPaymentDate: sub.lastPaymentDate || undefined,
    };
  }

  @Mutation(() => Subscription, { name: 'godModeCreateOrganizationSubscription' })
  async createOrganizationSubscription(
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @Args('planId', { type: () => ID }) planId: string,
    @Args('input', { type: () => CreateOrganizationSubscriptionInput })
    input: CreateOrganizationSubscriptionInput,
  ): Promise<Subscription> {
    const sub = await this.subscriptionsService.createOrganizationSubscription(
      organizationId,
      planId,
      input,
    );
    return {
      ...sub,
      paystackSubscriptionCode: sub.paystackSubscriptionCode || undefined,
      paystackCustomerCode: sub.paystackCustomerCode || undefined,
      trialStart: sub.trialStart || undefined,
      trialEnd: sub.trialEnd || undefined,
      cancelledAt: sub.cancelledAt || undefined,
      cancelReason: sub.cancelReason || undefined,
      nextBillingDate: sub.nextBillingDate || undefined,
      lastPaymentDate: sub.lastPaymentDate || undefined,
    };
  }

  @Mutation(() => SubscriptionLifecycleResult, { name: 'godModeTriggerSubscriptionLifecycleCheck' })
  async triggerSubscriptionLifecycleCheck(): Promise<SubscriptionLifecycleResult> {
    return this.subscriptionLifecycleService.triggerLifecycleCheck();
  }

  // ============ PLAN QUERIES ============

  @Query(() => [SubscriptionPlan], { name: 'godModeSubscriptionPlans' })
  async getSubscriptionPlans(
    @Args('filter', { type: () => PlanFilterInput, nullable: true })
    filter?: PlanFilterInput,
  ): Promise<SubscriptionPlan[]> {
    const plans = await this.subscriptionPlansService.getPlans(filter);
    return plans.map(plan => ({
      ...plan,
      description: plan.description || undefined,
      paystackPlanCode: plan.paystackPlanCode || undefined,
      trialPeriodDays: plan.trialPeriodDays || undefined,
      features: Array.isArray(plan.features) ? (plan.features as string[]) : undefined,
    }));
  }

  @Query(() => SubscriptionPlan, { name: 'godModeSubscriptionPlan' })
  async getSubscriptionPlan(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlansService.getPlan(id);
    return {
      ...plan,
      description: plan.description || undefined,
      paystackPlanCode: plan.paystackPlanCode || undefined,
      trialPeriodDays: plan.trialPeriodDays || undefined,
      features: Array.isArray(plan.features) ? (plan.features as string[]) : undefined,
    };
  }

  @Query(() => [SubscriptionPlan], { name: 'godModePopularSubscriptionPlans' })
  async getPopularSubscriptionPlans(
    @Args('organisationId', { type: () => ID, nullable: true })
    organisationId?: string,
    @Args('limit', { type: () => Int, defaultValue: 5 }) limit?: number,
  ): Promise<SubscriptionPlan[]> {
    const plans = await this.subscriptionPlansService.getPopularPlans(organisationId, limit);
    return plans.map(plan => ({
      ...plan,
      description: plan.description || undefined,
      paystackPlanCode: plan.paystackPlanCode || undefined,
      trialPeriodDays: plan.trialPeriodDays || undefined,
      features: Array.isArray(plan.features) ? (plan.features as string[]) : undefined,
    }));
  }

  // ============ PLAN MUTATIONS ============

  @Mutation(() => SubscriptionPlan, { name: 'godModeCreateSubscriptionPlan' })
  async createSubscriptionPlan(
    @Args('input', { type: () => CreatePlanInput })
    input: CreatePlanInput,
  ): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlansService.createPlan(input);
    return {
      ...plan,
      description: plan.description ?? undefined,
      trialPeriodDays: plan.trialPeriodDays ?? undefined,
      paystackPlanCode: plan.paystackPlanCode ?? undefined,
      features: Array.isArray(plan.features) ? (plan.features as string[]) : undefined,
    };
  }

  @Mutation(() => SubscriptionPlan, { name: 'godModeUpdateSubscriptionPlan' })
  async updateSubscriptionPlan(
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdatePlanInput })
    input: UpdatePlanInput,
  ): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlansService.updatePlan(id, input);
    return {
      ...plan,
      description: plan.description ?? undefined,
      trialPeriodDays: plan.trialPeriodDays ?? undefined,
      paystackPlanCode: plan.paystackPlanCode ?? undefined,
      features: Array.isArray(plan.features) ? (plan.features as string[]) : undefined,
    };
  }

  @Mutation(() => SubscriptionPlan, { name: 'godModeDeleteSubscriptionPlan' })
  async deleteSubscriptionPlan(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlansService.deletePlan(id);
    return {
      ...plan,
      description: plan.description ?? undefined,
      trialPeriodDays: plan.trialPeriodDays ?? undefined,
      paystackPlanCode: plan.paystackPlanCode ?? undefined,
      features: Array.isArray(plan.features) ? (plan.features as string[]) : undefined,
    };
  }

  @Mutation(() => SubscriptionPlan, { name: 'godModeSyncSubscriptionPlanWithPaystack' })
  async syncSubscriptionPlanWithPaystack(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlansService.syncPlanWithPaystack(id);
    return {
      ...plan,
      description: plan.description || undefined,
      paystackPlanCode: plan.paystackPlanCode || undefined,
      trialPeriodDays: plan.trialPeriodDays || undefined,
      features: Array.isArray(plan.features) ? (plan.features as string[]) : undefined,
    };
  }
}
