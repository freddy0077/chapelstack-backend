import { InputType, Field, Float, ID, PartialType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { CreateTransactionInput } from './create-transaction.input';
import { TransactionType } from '@prisma/client';

@InputType()
export class UpdateTransactionInput extends PartialType(
  CreateTransactionInput,
) {
  @Field(() => ID)
  id: string;

  @Field(() => TransactionType, { nullable: true })
  type?: TransactionType;
}
