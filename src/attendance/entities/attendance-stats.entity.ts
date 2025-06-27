import {
  Field,
  ObjectType,
  Int,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import { IsISO8601 } from 'class-validator';
import {
  AttendanceStatsPeriod,
  AttendanceStatsType,
} from '../dto/attendance-stats.input';

@ObjectType()
export class PeriodStat {
  @Field(() => String)
  period: string;

  @Field(() => Number)
  value: number;
}

@ObjectType()
export class TotalAttendanceStat {
  @Field(() => String)
  period: string;

  @Field(() => Float)
  total: number;
}

@ObjectType()
export class UniqueMembersStat {
  @Field(() => String)
  period: string;

  @Field(() => Float)
  unique_members: number;
}

@ObjectType()
export class VisitorsStat {
  @Field(() => String)
  period: string;

  @Field(() => Float)
  visitors: number;
}

@ObjectType()
export class FirstTimeVisitorsStat {
  @Field(() => String)
  period: string;

  @Field(() => Float)
  first_time_visitors: number;
}

@ObjectType()
export class GrowthRateStat {
  @Field(() => String)
  period: string;

  @Field(() => Float)
  growth_rate: number;
}

@ObjectType()
export class RetentionRateStat {
  @Field(() => String)
  period: string;

  @Field(() => Float)
  retention_rate: number;
}

@ObjectType()
export class AttendanceByDemographicsStat {
  @Field(() => String)
  group: string; // e.g., '18-25', 'Male', 'Branch A'

  @Field(() => Float)
  count: number;
}

@ObjectType()
export class AttendanceByEventStat {
  @Field(() => String)
  eventType: string;

  @Field(() => Float)
  count: number;
}

@ObjectType()
export class AttendanceFrequencyStat {
  @Field(() => String)
  label: string; // e.g., 'Weekly', 'Monthly', 'Rarely'

  @Field(() => Float)
  count: number;
}

@ObjectType()
export class AttendanceStats {
  @Field(() => [TotalAttendanceStat], { nullable: true })
  TOTAL_ATTENDANCE?: TotalAttendanceStat[];

  @Field(() => [UniqueMembersStat], { nullable: true })
  UNIQUE_MEMBERS?: UniqueMembersStat[];

  @Field(() => [VisitorsStat], { nullable: true })
  VISITORS?: VisitorsStat[];

  @Field(() => [FirstTimeVisitorsStat], { nullable: true })
  FIRST_TIME_VISITORS?: FirstTimeVisitorsStat[];

  @Field(() => [GrowthRateStat], { nullable: true })
  GROWTH_RATE?: GrowthRateStat[];

  @Field(() => [RetentionRateStat], { nullable: true })
  RETENTION_RATE?: RetentionRateStat[];

  @Field(() => [AttendanceByDemographicsStat], { nullable: true })
  BY_AGE_GROUP?: AttendanceByDemographicsStat[];

  @Field(() => [AttendanceByDemographicsStat], { nullable: true })
  BY_GENDER?: AttendanceByDemographicsStat[];

  @Field(() => [AttendanceByDemographicsStat], { nullable: true })
  BY_BRANCH?: AttendanceByDemographicsStat[];

  @Field(() => [AttendanceByEventStat], { nullable: true })
  BY_EVENT_TYPE?: AttendanceByEventStat[];

  @Field(() => [AttendanceFrequencyStat], { nullable: true })
  FREQUENCY?: AttendanceFrequencyStat[];

  @Field(() => String)
  branchId: string;

  @IsISO8601()
  @Field(() => String)
  startDate: string;

  @IsISO8601()
  @Field(() => String)
  endDate: string;

  @Field(() => AttendanceStatsPeriod)
  period: AttendanceStatsPeriod;
}
