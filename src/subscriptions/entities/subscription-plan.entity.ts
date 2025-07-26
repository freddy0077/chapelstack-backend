import {
  ObjectType,
  Field,
  ID,
  Float,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { SubscriptionInterval } from '@prisma/client';
import { Organisation } from '../../organisation/dto/organisation.model';
import { Subscription } from './subscription.entity';

// Register SubscriptionInterval enum for GraphQL
registerEnumType(SubscriptionInterval, {
  name: 'SubscriptionInterval',
  description: 'Subscription billing interval (DAILY, WEEKLY, MONTHLY, etc.)',
});

@ObjectType()
export class SubscriptionPlan {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  amount: number;

  @Field({ defaultValue: 'NGN' })
  currency: string;

  @Field(() => SubscriptionInterval)
  interval: SubscriptionInterval;

  @Field(() => Int, { defaultValue: 1 })
  intervalCount: number;

  @Field(() => Int, { nullable: true })
  trialPeriodDays?: number;

  @Field({ defaultValue: true })
  isActive: boolean;

  @Field({ nullable: true })
  paystackPlanCode?: string;

  @Field(() => [String], { nullable: true })
  features?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field({ nullable: true })
  organisationId?: string;

  @Field(() => Organisation, { nullable: true })
  organisation?: Organisation;

  @Field(() => [Subscription], { nullable: true })
  subscriptions?: Subscription[];

  @Field(() => Int, { nullable: true })
  activeSubscriptionsCount?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
