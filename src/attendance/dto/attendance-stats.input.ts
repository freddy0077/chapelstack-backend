import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import {
  IsDateString,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsUUID,
} from 'class-validator';

export enum AttendanceStatsPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

registerEnumType(AttendanceStatsPeriod, {
  name: 'AttendanceStatsPeriod',
});

export enum AttendanceStatsType {
  TOTAL_ATTENDANCE = 'TOTAL_ATTENDANCE',
  UNIQUE_MEMBERS = 'UNIQUE_MEMBERS',
  VISITORS = 'VISITORS',
  FIRST_TIME_VISITORS = 'FIRST_TIME_VISITORS',
  GROWTH_RATE = 'GROWTH_RATE',
  RETENTION_RATE = 'RETENTION_RATE',
}

registerEnumType(AttendanceStatsType, {
  name: 'AttendanceStatsType',
});

@InputType()
export class AttendanceStatsInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  sessionTypeId?: string;

  @Field(() => String)
  @IsISO8601()
  startDate: string;

  @Field(() => String)
  @IsISO8601()
  endDate: string;

  @Field(() => AttendanceStatsPeriod, {
    defaultValue: AttendanceStatsPeriod.WEEKLY,
  })
  @IsEnum(AttendanceStatsPeriod)
  @IsOptional()
  period?: AttendanceStatsPeriod;

  @Field(() => [AttendanceStatsType], {
    defaultValue: [AttendanceStatsType.TOTAL_ATTENDANCE],
  })
  @IsEnum(AttendanceStatsType, { each: true })
  @IsOptional()
  statsTypes?: AttendanceStatsType[];
}
