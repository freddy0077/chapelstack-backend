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
import { SubscriptionsService } from '../services/subscriptions.service';
import { SubscriptionLifecycleService } from '../services/subscription-lifecycle.service';
import { Subscription } from '../entities/subscription.entity';
import { SubscriptionPayment } from '../entities/subscription-payment.entity';
import { CreateSubscriptionInput } from '../dto/create-subscription.input';
import { UpdateSubscriptionInput } from '../dto/update-subscription.input';
import { SubscriptionFilterInput } from '../dto/subscription-filter.input';
import { PaymentFilterInput } from '../dto/payment-filter.input';
import { CreateOrganizationSubscriptionInput } from '../dto/create-organization-subscription.input';
import { OrganizationSubscriptionStatus } from '../entities/organization-subscription-status.entity';
import { SubscriptionLifecycleStats } from '../entities/subscription-lifecycle-stats.entity';
import { SubscriptionLifecycleResult } from '../entities/subscription-lifecycle-result.entity';
import { VerifyPaymentInput } from '../dto/verify-payment.input';

@Resolver(() => Subscription)
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class SubscriptionsResolver {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly subscriptionLifecycleService: SubscriptionLifecycleService,
  ) {}

  @Query(() => [Subscription])
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  // @RequirePermissions({ action: 'read', subject: 'Subscription' })
  async getSubscriptions(
    @Args('filter', { type: () => SubscriptionFilterInput, nullable: true })
    filter?: SubscriptionFilterInput,
  ): Promise<Subscription[]> {
    const subscriptions =
      await this.subscriptionsService.getSubscriptions(filter);
    return subscriptions.map((sub) => ({
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

  @Query(() => Subscription, { name: 'subscription' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'read', subject: 'Subscription' })
  async getSubscription(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionsService.getSubscription(id);
    return {
      ...subscription,
      paystackSubscriptionCode:
        subscription.paystackSubscriptionCode || undefined,
      paystackCustomerCode: subscription.paystackCustomerCode || undefined,
      trialStart: subscription.trialStart || undefined,
      trialEnd: subscription.trialEnd || undefined,
      cancelledAt: subscription.cancelledAt || undefined,
      cancelReason: subscription.cancelReason || undefined,
      nextBillingDate: subscription.nextBillingDate || undefined,
      lastPaymentDate: subscription.lastPaymentDate || undefined,
    };
  }

  @Mutation(() => Subscription, { name: 'createSubscription' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'create', subject: 'Subscription' })
  async createSubscription(
    @Args('input', { type: () => CreateSubscriptionInput })
    input: CreateSubscriptionInput,
  ): Promise<Subscription> {
    const subscription =
      await this.subscriptionsService.createSubscription(input);
    return {
      ...subscription,
      paystackSubscriptionCode:
        subscription.paystackSubscriptionCode || undefined,
      paystackCustomerCode: subscription.paystackCustomerCode || undefined,
      trialStart: subscription.trialStart || undefined,
      trialEnd: subscription.trialEnd || undefined,
      cancelledAt: subscription.cancelledAt || undefined,
      cancelReason: subscription.cancelReason || undefined,
      nextBillingDate: subscription.nextBillingDate || undefined,
      lastPaymentDate: subscription.lastPaymentDate || undefined,
    };
  }

  @Mutation(() => Subscription, { name: 'updateSubscription' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'update', subject: 'Subscription' })
  async updateSubscription(
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdateSubscriptionInput })
    input: UpdateSubscriptionInput,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionsService.updateSubscription(
      id,
      input,
    );
    return {
      ...subscription,
      paystackSubscriptionCode:
        subscription.paystackSubscriptionCode || undefined,
      paystackCustomerCode: subscription.paystackCustomerCode || undefined,
      trialStart: subscription.trialStart || undefined,
      trialEnd: subscription.trialEnd || undefined,
      cancelledAt: subscription.cancelledAt || undefined,
      cancelReason: subscription.cancelReason || undefined,
      nextBillingDate: subscription.nextBillingDate || undefined,
      lastPaymentDate: subscription.lastPaymentDate || undefined,
    };
  }

  @Mutation(() => Subscription, { name: 'cancelSubscription' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'update', subject: 'Subscription' })
  async cancelSubscription(
    @Args('id', { type: () => ID }) id: string,
    @Args('reason', { type: () => String, nullable: true }) reason?: string,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionsService.cancelSubscription(
      id,
      reason,
    );
    return {
      ...subscription,
      paystackSubscriptionCode:
        subscription.paystackSubscriptionCode || undefined,
      paystackCustomerCode: subscription.paystackCustomerCode || undefined,
      trialStart: subscription.trialStart || undefined,
      trialEnd: subscription.trialEnd || undefined,
      cancelledAt: subscription.cancelledAt || undefined,
      cancelReason: subscription.cancelReason || undefined,
      nextBillingDate: subscription.nextBillingDate || undefined,
      lastPaymentDate: subscription.lastPaymentDate || undefined,
    };
  }

  @Mutation(() => Subscription, { name: 'createOrganizationSubscription' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  // @RequirePermissions({ action: 'create', subject: 'Subscription' })
  async createOrganizationSubscription(
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @Args('planId', { type: () => ID }) planId: string,
    @Args('input', { type: () => CreateOrganizationSubscriptionInput })
    input: CreateOrganizationSubscriptionInput,
  ): Promise<Subscription> {
    const subscription =
      await this.subscriptionsService.createOrganizationSubscription(
        organizationId,
        planId,
        input,
      );
    return {
      ...subscription,
      paystackSubscriptionCode:
        subscription.paystackSubscriptionCode || undefined,
      paystackCustomerCode: subscription.paystackCustomerCode || undefined,
      trialStart: subscription.trialStart || undefined,
      trialEnd: subscription.trialEnd || undefined,
      cancelledAt: subscription.cancelledAt || undefined,
      cancelReason: subscription.cancelReason || undefined,
      nextBillingDate: subscription.nextBillingDate || undefined,
      lastPaymentDate: subscription.lastPaymentDate || undefined,
    };
  }

  @Query(() => OrganizationSubscriptionStatus)
  @UseGuards(GqlAuthGuard)
  async organizationSubscriptionStatus(
    @Args('organizationId', { type: () => String })
    organizationId: string,
  ): Promise<OrganizationSubscriptionStatus> {
    const status =
      await this.subscriptionsService.getOrganizationSubscriptionStatus(
        organizationId,
      );

    return {
      hasActiveSubscription: status.hasActiveSubscription,
      subscription: status.subscription
        ? {
            ...status.subscription,
            paystackSubscriptionCode:
              status.subscription.paystackSubscriptionCode || undefined,
            paystackCustomerCode:
              status.subscription.paystackCustomerCode || undefined,
            trialStart: status.subscription.trialStart || undefined,
            trialEnd: status.subscription.trialEnd || undefined,
            cancelledAt: status.subscription.cancelledAt || undefined,
            cancelReason: status.subscription.cancelReason || undefined,
            nextBillingDate: status.subscription.nextBillingDate || undefined,
            lastPaymentDate: status.subscription.lastPaymentDate || undefined,
          }
        : undefined,
      daysUntilExpiry: status.daysUntilExpiry,
      isInGracePeriod: status.isInGracePeriod,
    };
  }

  @Query(() => SubscriptionLifecycleStats, {
    name: 'subscriptionLifecycleStats',
  })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  // @RequirePermissions({ action: 'read', subject: 'Subscription' })
  async getSubscriptionLifecycleStats(): Promise<SubscriptionLifecycleStats> {
    return this.subscriptionLifecycleService.getLifecycleStats();
  }

  @Mutation(() => SubscriptionLifecycleResult, {
    name: 'triggerSubscriptionLifecycleCheck',
  })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  // @RequirePermissions({ action: 'update', subject: 'Subscription' })
  async triggerSubscriptionLifecycleCheck(): Promise<SubscriptionLifecycleResult> {
    return this.subscriptionLifecycleService.triggerLifecycleCheck();
  }

  @Query(() => [SubscriptionPayment], { name: 'subscriptionPayments' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'read', subject: 'SubscriptionPayment' })
  async subscriptionPayments(
    @Args('filter', { type: () => PaymentFilterInput, nullable: true })
    filter?: PaymentFilterInput,
  ): Promise<SubscriptionPayment[]> {
    return this.subscriptionsService.getSubscriptionPayments(filter);
  }

  @Mutation(() => Subscription, { name: 'verifyPaymentAndCreateSubscription' })
  async verifyPaymentAndCreateSubscription(
    @Args('input', { type: () => VerifyPaymentInput })
    input: VerifyPaymentInput,
  ): Promise<Subscription> {
    const subscription =
      await this.subscriptionsService.verifyPaymentAndCreateSubscription(input);

    return {
      ...subscription,
      paystackSubscriptionCode:
        subscription.paystackSubscriptionCode || undefined,
      paystackCustomerCode: subscription.paystackCustomerCode || undefined,
      trialStart: subscription.trialStart || undefined,
      trialEnd: subscription.trialEnd || undefined,
      cancelledAt: subscription.cancelledAt || undefined,
      cancelReason: subscription.cancelReason || undefined,
      nextBillingDate: subscription.nextBillingDate || undefined,
      lastPaymentDate: subscription.lastPaymentDate || undefined,
    };
  }

  @ResolveField('payments', () => [SubscriptionPayment])
  async payments(
    @Parent() subscription: Subscription,
  ): Promise<SubscriptionPayment[]> {
    // This would be populated by the service include
    return subscription.payments || [];
  }
}
