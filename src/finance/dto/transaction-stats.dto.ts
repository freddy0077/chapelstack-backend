import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TransactionStats {
  @Field(() => Float)
  totalIncome: number;

  @Field(() => Float)
  totalExpenses: number;

  @Field(() => Float)
  totalTithes: number;

  @Field(() => Float)
  totalPledges: number;

  @Field(() => Float)
  totalOfferings: number;

  @Field(() => Float)
  netBalance: number;
}
