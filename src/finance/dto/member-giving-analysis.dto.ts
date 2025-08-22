import {
  ObjectType,
  Field,
  Float,
  Int,
  registerEnumType,
} from '@nestjs/graphql';

export enum TrendDirection {
  INCREASING = 'INCREASING',
  DECREASING = 'DECREASING',
  STABLE = 'STABLE',
}

registerEnumType(TrendDirection, {
  name: 'TrendDirection',
  description: 'Direction of giving trend',
});

@ObjectType()
export class GivingTrend {
  @Field(() => TrendDirection)
  direction: TrendDirection;

  @Field(() => Float)
  changePercent: number; // Percentage change

  @Field(() => Float)
  consistency: number; // Regularity score 0-100
}

@ObjectType()
export class MonthlyGiving {
  @Field(() => String)
  month: string; // "2024-01"

  @Field(() => Float)
  amount: number;

  @Field(() => Int)
  contributionCount: number;

  @Field(() => Float)
  averageGift: number;
}

@ObjectType()
export class FundGiving {
  @Field(() => String)
  fundId: string;

  @Field(() => String)
  fundName: string;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Int)
  contributionCount: number;

  @Field(() => Float)
  percentage: number; // Percentage of total giving
}

@ObjectType()
export class ContributionDetail {
  @Field(() => String)
  id: string;

  @Field(() => Date)
  date: Date;

  @Field(() => Float)
  amount: number;

  @Field(() => String, { nullable: true })
  fundName?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  reference?: string;
}

@ObjectType()
export class MemberGivingAnalysis {
  @Field(() => String)
  memberId: string;

  @Field(() => String)
  memberName: string;

  @Field(() => String, { nullable: true })
  memberEmail?: string;

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => Float)
  totalGiving: number;

  @Field(() => Int)
  contributionCount: number;

  @Field(() => Float)
  averageGift: number;

  @Field(() => Date, { nullable: true })
  firstGift?: Date;

  @Field(() => Date, { nullable: true })
  lastGift?: Date;

  @Field(() => GivingTrend)
  givingTrend: GivingTrend;

  @Field(() => [MonthlyGiving])
  monthlyBreakdown: MonthlyGiving[];

  @Field(() => [FundGiving])
  fundBreakdown: FundGiving[];

  @Field(() => [ContributionDetail])
  recentContributions: ContributionDetail[];

  @Field(() => Float)
  yearOverYearChange: number; // Percentage change from previous year

  @Field(() => Int)
  givingRank: number; // Rank among all members (1 = highest giver)

  @Field(() => Float)
  percentileRank: number; // Percentile rank (0-100)
}
