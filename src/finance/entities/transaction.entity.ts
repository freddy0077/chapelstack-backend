import {
  ObjectType,
  Field,
  Float,
  ID,
  registerEnumType,
} from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { TransactionType } from '@prisma/client';

// Register TransactionType enum for GraphQL
registerEnumType(TransactionType, {
  name: 'TransactionType',
  description: 'Type of transaction (INCOME, EXPENSE, etc.)',
});

@ObjectType()
export class Transaction {
  @Field(() => ID)
  id: string;

  @Field()
  organisationId: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field({ nullable: true })
  fundId?: string;

  @Field({ nullable: true })
  userId?: string;

  @Field(() => TransactionType)
  type: TransactionType;

  @Field(() => Float)
  amount: number;

  @Field()
  date: Date;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  reference?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
