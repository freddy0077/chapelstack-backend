import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class BranchFinancialSummary {
  @Field(() => Number)
  totalIncome: number;

  @Field(() => Number)
  totalExpenses: number;

  @Field(() => Number)
  balance: number;

  @Field(() => Number)
  incomeChange: number;

  @Field(() => Number)
  expensesChange: number;

  @Field(() => Number)
  balanceChange: number;
}
