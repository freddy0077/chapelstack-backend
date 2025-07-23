import {
  ObjectType,
  Field,
  ID,
  Float,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { SubscriptionStatus } from '@prisma/client';
import { Organisation } from '../../organisation/dto/organisation.model';
import { SubscriptionPlan } from './subscription-plan.entity';
import { SubscriptionPayment } from './subscription-payment.entity';

// Register SubscriptionStatus enum for GraphQL
registerEnumType(SubscriptionStatus, {
  name: 'SubscriptionStatus',
  description: 'Subscription status (ACTIVE, INACTIVE, CANCELLED, etc.)',
});

@ObjectType()
export class Subscription {
  @Field(() => ID)
  id: string;

  @Field()
  customerId: string;

  @Field(() => Organisation, { nullable: true })
  customer?: Organisation;

  @Field()
  planId: string;

  @Field(() => SubscriptionPlan, { nullable: true })
  plan?: SubscriptionPlan;

  @Field(() => SubscriptionStatus)
  status: SubscriptionStatus;

  @Field({ nullable: true })
  paystackSubscriptionCode?: string;

  @Field({ nullable: true })
  paystackCustomerCode?: string;

  @Field()
  currentPeriodStart: Date;

  @Field()
  currentPeriodEnd: Date;

  @Field({ nullable: true })
  trialStart?: Date;

  @Field({ nullable: true })
  trialEnd?: Date;

  @Field({ nullable: true })
  cancelledAt?: Date;

  @Field({ defaultValue: false })
  cancelAtPeriodEnd: boolean;

  @Field({ nullable: true })
  cancelReason?: string;

  @Field({ nullable: true })
  nextBillingDate?: Date;

  @Field({ nullable: true })
  lastPaymentDate?: Date;

  @Field(() => Int, { defaultValue: 0 })
  failedPaymentCount: number;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field()
  organisationId: string;

  @Field(() => Organisation, { nullable: true })
  organisation?: Organisation;

  @Field(() => [SubscriptionPayment], { nullable: true })
  payments?: SubscriptionPayment[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
