import { ObjectType, Field, Float, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DateRangeInput } from '../../common/dto/date-range.input';

export enum BudgetPeriodType {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

@InputType()
export class BudgetVsActualInput {
  @Field(() => String)
  @IsString()
  organisationId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;

  @Field(() => DateRangeInput, { nullable: true })
  @IsOptional()
  dateRange?: DateRangeInput;

  @Field(() => BudgetPeriodType, { defaultValue: BudgetPeriodType.MONTHLY })
  @IsEnum(BudgetPeriodType)
  @IsOptional()
  periodType?: BudgetPeriodType;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  fundId?: string;
}

@ObjectType()
export class BudgetLineItem {
  @Field(() => String)
  category: string;

  @Field(() => String)
  description: string;

  @Field(() => Float)
  budgetedAmount: number;

  @Field(() => Float)
  actualAmount: number;

  @Field(() => Float)
  variance: number;

  @Field(() => Float)
  variancePercent: number;

  @Field(() => String)
  status: string; // 'over_budget', 'under_budget', 'on_target'

  @Field(() => String, { nullable: true })
  fundName?: string;

  @Field(() => String, { nullable: true })
  period?: string; // e.g., "2025-01", "Q1 2025"
}

@ObjectType()
export class BudgetSummary {
  @Field(() => Float)
  totalBudgeted: number;

  @Field(() => Float)
  totalActual: number;

  @Field(() => Float)
  totalVariance: number;

  @Field(() => Float)
  totalVariancePercent: number;

  @Field(() => Float)
  budgetUtilization: number; // Percentage of budget used

  @Field(() => String)
  overallStatus: string;
}

@ObjectType()
export class BudgetVsActual {
  @Field(() => String)
  organisationId: string;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => BudgetPeriodType)
  periodType: BudgetPeriodType;

  @Field(() => BudgetSummary)
  summary: BudgetSummary;

  @Field(() => [BudgetLineItem])
  revenueItems: BudgetLineItem[];

  @Field(() => [BudgetLineItem])
  expenseItems: BudgetLineItem[];

  @Field(() => Date)
  generatedAt: Date;

  @Field(() => String, { nullable: true })
  notes?: string;
}
