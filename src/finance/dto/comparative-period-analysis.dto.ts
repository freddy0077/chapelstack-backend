import { ObjectType, Field, Float, registerEnumType } from '@nestjs/graphql';

export enum ComparisonType {
  YEAR_OVER_YEAR = 'YEAR_OVER_YEAR',
  MONTH_OVER_MONTH = 'MONTH_OVER_MONTH',
  QUARTER_OVER_QUARTER = 'QUARTER_OVER_QUARTER',
}

registerEnumType(ComparisonType, {
  name: 'ComparisonType',
  description: 'Comparison type for period analysis',
});

@ObjectType()
export class ComparativePeriodData {
  @Field(() => String)
  period: string; // "2024-01", "2024-Q1", etc.

  @Field(() => Float)
  currentIncome: number;

  @Field(() => Float)
  previousIncome: number;

  @Field(() => Float)
  currentExpenses: number;

  @Field(() => Float)
  previousExpenses: number;

  @Field(() => Float)
  currentNet: number;

  @Field(() => Float)
  previousNet: number;

  @Field(() => Float)
  incomeGrowthRate: number; // Percentage

  @Field(() => Float)
  expenseGrowthRate: number; // Percentage

  @Field(() => Float)
  netGrowthRate: number; // Percentage

  @Field(() => Float)
  incomeVariance: number; // Absolute difference

  @Field(() => Float)
  expenseVariance: number; // Absolute difference

  @Field(() => Float)
  netVariance: number; // Absolute difference
}

@ObjectType()
export class ComparativePeriodAnalysis {
  @Field(() => String)
  branchId: string;

  @Field(() => String)
  organisationId: string;

  @Field(() => ComparisonType)
  comparisonType: ComparisonType;

  @Field(() => [ComparativePeriodData])
  data: ComparativePeriodData[];

  @Field(() => Float)
  averageIncomeGrowthRate: number;

  @Field(() => Float)
  averageExpenseGrowthRate: number;

  @Field(() => Float)
  averageNetGrowthRate: number;

  @Field(() => String, { nullable: true })
  trend: string; // "IMPROVING", "DECLINING", "STABLE"

  @Field(() => String, { nullable: true })
  insights: string; // Generated insights about the trends
}
