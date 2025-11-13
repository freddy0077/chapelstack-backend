import {
  ObjectType,
  Field,
  Float,
  ID,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { TransactionType, TransactionStatus } from '@prisma/client';
import { Fund } from '../../funds/entities/fund.entity';
import { Event } from '../../events/entities/event.entity';

// Register enums for GraphQL
registerEnumType(TransactionType, {
  name: 'TransactionType',
  description: 'Type of transaction (CONTRIBUTION, EXPENSE, etc.)',
});

registerEnumType(TransactionStatus, {
  name: 'TransactionStatus',
  description: 'Status of transaction (ACTIVE, VOIDED, etc.)',
});

@ObjectType()
export class Transaction {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  organisationId: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field({ nullable: true })
  fundId?: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  memberId?: string;

  @Field({ nullable: true })
  eventId?: string;

  @Field(() => TransactionType)
  type: TransactionType;

  @Field(() => Float)
  amount: number;

  @Field(() => Date)
  date: Date;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  reference?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  // Audit and Status Fields
  @Field(() => TransactionStatus)
  status: TransactionStatus;

  @Field({ nullable: true })
  createdBy?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field({ nullable: true })
  lastModifiedBy?: string;

  @Field({ nullable: true })
  lastModifiedAt?: Date;

  @Field({ nullable: true })
  voidedBy?: string;

  @Field({ nullable: true })
  voidedAt?: Date;

  @Field({ nullable: true })
  voidReason?: string;

  @Field(() => Int)
  version: number;

  @Field({ nullable: true })
  originalTransactionId?: string;

  // Reconciliation Fields
  @Field(() => Boolean)
  isReconciled: boolean;

  @Field({ nullable: true })
  reconciledAt?: Date;

  @Field({ nullable: true })
  reconciledBy?: string;

  @Field({ nullable: true })
  accountingPeriodId?: string;

  @Field(() => Boolean)
  periodClosed: boolean;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => Fund, { nullable: true })
  fund?: Fund;

  @Field(() => Event, { nullable: true })
  event?: Event;
}
