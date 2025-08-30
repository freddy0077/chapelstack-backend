import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class SubscriptionDashboardStats {
  @Field(() => Int)
  totalOrganizations: number;

  @Field(() => Int)
  activeSubscriptions: number;

  @Field(() => Int)
  expiredSubscriptions: number;

  @Field(() => Int)
  expiringSoon: number; // Expiring within 30 days

  @Field(() => Float)
  monthlyRevenue: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float)
  organizationGrowthRate: number; // Percentage

  @Field(() => Float)
  subscriptionGrowthRate: number; // Percentage

  @Field(() => Float)
  revenueGrowthRate: number; // Percentage

  @Field(() => Int)
  trialSubscriptions: number;

  @Field(() => Int)
  gracePeriodSubscriptions: number;
}

@ObjectType()
export class SubscriptionActivityItem {
  @Field()
  id: string;

  @Field()
  type: string; // 'ORGANIZATION_CREATED', 'SUBSCRIPTION_RENEWED', 'PAYMENT_FAILED', etc.

  @Field()
  description: string;

  @Field()
  organizationName?: string;

  @Field()
  organizationId?: string;

  @Field()
  subscriptionId?: string;

  @Field()
  timestamp: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field()
  severity: string; // 'INFO', 'WARNING', 'ERROR', 'SUCCESS'
}

@ObjectType()
export class SubscriptionTabCounts {
  @Field(() => Int)
  activeSubscriptions: number;

  @Field(() => Int)
  expiredSubscriptions: number;

  @Field(() => Int)
  trialSubscriptions: number;

  @Field(() => Int)
  gracePeriodSubscriptions: number;

  @Field(() => Int)
  pendingRenewals: number;

  @Field(() => Int)
  cancelledSubscriptions: number;
}
