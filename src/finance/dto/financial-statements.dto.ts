import {
  ObjectType,
  Field,
  Float,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { DateRangeInput } from '../../common/dto/date-range.input';

export enum StatementType {
  INCOME_STATEMENT = 'INCOME_STATEMENT',
  BALANCE_SHEET = 'BALANCE_SHEET',
  CASH_FLOW_STATEMENT = 'CASH_FLOW_STATEMENT',
  STATEMENT_OF_NET_ASSETS = 'STATEMENT_OF_NET_ASSETS',
}

registerEnumType(StatementType, {
  name: 'StatementType',
  description: 'Type of financial statement',
});

@InputType()
export class FinancialStatementsInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;

  @Field(() => DateRangeInput, { nullable: true })
  @IsOptional()
  dateRange?: DateRangeInput;

  @Field(() => StatementType)
  @IsEnum(StatementType)
  statementType: StatementType;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  fundId?: string;

  @Field(() => Boolean, { defaultValue: false })
  includeComparative?: boolean;
}

@ObjectType()
export class FinancialLineItem {
  @Field(() => String)
  category: string;

  @Field(() => String)
  description: string;

  @Field(() => Float)
  currentPeriod: number;

  @Field(() => Float, { nullable: true })
  previousPeriod?: number;

  @Field(() => Float, { nullable: true })
  variance?: number;

  @Field(() => Float, { nullable: true })
  variancePercent?: number;

  @Field(() => [FinancialLineItem], { nullable: true })
  subItems?: FinancialLineItem[];
}

@ObjectType()
export class IncomeStatement {
  @Field(() => String)
  branchId: string;

  @Field(() => String)
  organisationId: string;

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => [FinancialLineItem])
  revenue: FinancialLineItem[];

  @Field(() => [FinancialLineItem])
  expenses: FinancialLineItem[];

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float)
  totalExpenses: number;

  @Field(() => Float)
  netIncome: number;

  @Field(() => Float, { nullable: true })
  previousTotalRevenue?: number;

  @Field(() => Float, { nullable: true })
  previousTotalExpenses?: number;

  @Field(() => Float, { nullable: true })
  previousNetIncome?: number;
}

@ObjectType()
export class BalanceSheet {
  @Field(() => String)
  branchId: string;

  @Field(() => String)
  organisationId: string;

  @Field(() => Date)
  asOfDate: Date;

  @Field(() => [FinancialLineItem])
  assets: FinancialLineItem[];

  @Field(() => [FinancialLineItem])
  liabilities: FinancialLineItem[];

  @Field(() => [FinancialLineItem])
  netAssets: FinancialLineItem[];

  @Field(() => Float)
  totalAssets: number;

  @Field(() => Float)
  totalLiabilities: number;

  @Field(() => Float)
  totalNetAssets: number;
}

@ObjectType()
export class CashFlowStatement {
  @Field(() => String)
  branchId: string;

  @Field(() => String)
  organisationId: string;

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => [FinancialLineItem])
  operatingActivities: FinancialLineItem[];

  @Field(() => [FinancialLineItem])
  investingActivities: FinancialLineItem[];

  @Field(() => [FinancialLineItem])
  financingActivities: FinancialLineItem[];

  @Field(() => Float)
  netCashFromOperating: number;

  @Field(() => Float)
  netCashFromInvesting: number;

  @Field(() => Float)
  netCashFromFinancing: number;

  @Field(() => Float)
  netChangeInCash: number;

  @Field(() => Float)
  beginningCashBalance: number;

  @Field(() => Float)
  endingCashBalance: number;
}

@ObjectType()
export class StatementOfNetAssets {
  @Field(() => String)
  branchId: string;

  @Field(() => String)
  organisationId: string;

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => [FinancialLineItem])
  unrestricted: FinancialLineItem[];

  @Field(() => [FinancialLineItem])
  temporarilyRestricted: FinancialLineItem[];

  @Field(() => [FinancialLineItem])
  permanentlyRestricted: FinancialLineItem[];

  @Field(() => Float)
  totalUnrestricted: number;

  @Field(() => Float)
  totalTemporarilyRestricted: number;

  @Field(() => Float)
  totalPermanentlyRestricted: number;

  @Field(() => Float)
  totalNetAssets: number;
}

@ObjectType()
export class FinancialStatements {
  @Field(() => String)
  branchId: string;

  @Field(() => String)
  organisationId: string;

  @Field(() => StatementType)
  statementType: StatementType;

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => IncomeStatement, { nullable: true })
  incomeStatement?: IncomeStatement;

  @Field(() => BalanceSheet, { nullable: true })
  balanceSheet?: BalanceSheet;

  @Field(() => CashFlowStatement, { nullable: true })
  cashFlowStatement?: CashFlowStatement;

  @Field(() => StatementOfNetAssets, { nullable: true })
  statementOfNetAssets?: StatementOfNetAssets;

  @Field(() => Date)
  generatedAt: Date;

  @Field(() => String, { nullable: true })
  notes?: string;
}
