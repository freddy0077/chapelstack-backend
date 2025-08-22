import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsDate } from 'class-validator';
import { DateRangeInput } from '../../common/dto/date-range.input';
import { PeriodType } from './cash-flow-analysis.dto';
import { ComparisonType } from './comparative-period-analysis.dto';

@InputType()
export class CashFlowAnalysisInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;

  @Field(() => DateRangeInput)
  dateRange: DateRangeInput;

  @Field(() => PeriodType)
  periodType: PeriodType;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  fundId?: string;
}

@InputType()
export class ComparativePeriodAnalysisInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;

  @Field(() => ComparisonType)
  comparisonType: ComparisonType;

  @Field(() => Int, { defaultValue: 12 })
  periods: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  fundId?: string;
}

@InputType()
export class MemberGivingAnalysisInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;

  @Field(() => DateRangeInput)
  dateRange: DateRangeInput;

  @Field(() => Boolean, { defaultValue: true })
  includeRecentContributions: boolean;

  @Field(() => Int, { defaultValue: 10 })
  recentContributionsLimit: number;
}
