import { ObjectType, Field, Float, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

export enum PeriodType {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

registerEnumType(PeriodType, {
  name: 'PeriodType',
  description: 'Period type for cash flow analysis',
});

@ObjectType()
export class CashFlowData {
  @Field(() => String)
  period: string; // "2024-01", "2024-Q1", etc.

  @Field(() => Float)
  income: number;

  @Field(() => Float)
  expenses: number;

  @Field(() => Float)
  netFlow: number;

  @Field(() => Float)
  cumulativeFlow: number;

  @Field(() => GraphQLJSON, { nullable: true })
  incomeBreakdown?: any; // By fund/type

  @Field(() => GraphQLJSON, { nullable: true })
  expenseBreakdown?: any; // By category
}

@ObjectType()
export class CashFlowAnalysis {
  @Field(() => String)
  branchId: string;

  @Field(() => String)
  organisationId: string;

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => PeriodType)
  periodType: PeriodType;

  @Field(() => [CashFlowData])
  data: CashFlowData[];

  @Field(() => Float)
  totalIncome: number;

  @Field(() => Float)
  totalExpenses: number;

  @Field(() => Float)
  totalNetFlow: number;

  @Field(() => Float)
  averageMonthlyIncome: number;

  @Field(() => Float)
  averageMonthlyExpenses: number;
}
