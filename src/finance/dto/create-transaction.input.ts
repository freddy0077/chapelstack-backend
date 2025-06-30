import { InputType, Field, Float } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { TransactionType } from '@prisma/client';

@InputType()
export class CreateTransactionInput {
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

  @Field({ nullable: true })
  date?: Date;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  reference?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;
}
