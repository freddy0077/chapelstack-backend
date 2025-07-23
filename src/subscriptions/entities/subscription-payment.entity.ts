import {
  ObjectType,
  Field,
  ID,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { PaymentStatus } from '@prisma/client';
import { Subscription } from './subscription.entity';

// Register PaymentStatus enum for GraphQL
registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Payment status (PENDING, SUCCESS, FAILED, etc.)',
});

@ObjectType()
export class SubscriptionPayment {
  @Field(() => ID)
  id: string;

  @Field()
  subscriptionId: string;

  @Field(() => Subscription, { nullable: true })
  subscription?: Subscription;

  @Field(() => Float)
  amount: number;

  @Field({ defaultValue: 'GHS' })
  currency: string;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field({ nullable: true })
  paystackReference?: string;

  @Field({ nullable: true })
  paystackTransactionId?: string;

  @Field({ nullable: true })
  authorizationCode?: string;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field({ nullable: true })
  failedAt?: Date;

  @Field()
  periodStart: Date;

  @Field()
  periodEnd: Date;

  @Field({ nullable: true })
  invoiceNumber?: string;

  @Field({ nullable: true })
  failureReason?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
