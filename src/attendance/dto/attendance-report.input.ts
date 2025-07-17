import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsArray,
  IsString,
} from 'class-validator';

export enum AttendanceReportType {
  SUMMARY = 'SUMMARY',
  DETAILED = 'DETAILED',
  COMPARATIVE = 'COMPARATIVE',
  TRENDS = 'TRENDS',
  MEMBER_ANALYSIS = 'MEMBER_ANALYSIS',
  SESSION_ANALYSIS = 'SESSION_ANALYSIS',
  EVENT_ANALYSIS = 'EVENT_ANALYSIS',
}

registerEnumType(AttendanceReportType, {
  name: 'AttendanceReportType',
});

export enum AttendanceReportFormat {
  JSON = 'JSON',
  CSV = 'CSV',
  PDF = 'PDF',
  EXCEL = 'EXCEL',
}

registerEnumType(AttendanceReportFormat, {
  name: 'AttendanceReportFormat',
});

export enum AttendanceReportGroupBy {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  SESSION_TYPE = 'SESSION_TYPE',
  EVENT_TYPE = 'EVENT_TYPE',
  BRANCH = 'BRANCH',
  AGE_GROUP = 'AGE_GROUP',
  GENDER = 'GENDER',
}

registerEnumType(AttendanceReportGroupBy, {
  name: 'AttendanceReportGroupBy',
});

@InputType()
export class AttendanceReportInput {
  @Field(() => AttendanceReportType)
  @IsEnum(AttendanceReportType)
  reportType: AttendanceReportType;

  @Field(() => String)
  @IsDateString()
  startDate: string;

  @Field(() => String)
  @IsDateString()
  endDate: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  sessionIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  eventIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  memberIds?: string[];

  @Field(() => AttendanceReportGroupBy, { nullable: true })
  @IsOptional()
  @IsEnum(AttendanceReportGroupBy)
  groupBy?: AttendanceReportGroupBy;

  @Field(() => AttendanceReportFormat, {
    defaultValue: AttendanceReportFormat.JSON,
  })
  @IsOptional()
  @IsEnum(AttendanceReportFormat)
  format?: AttendanceReportFormat;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  includeVisitors?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  includeMemberDetails?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  includeSessionDetails?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  includeEventDetails?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  includeStatistics?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  includeCharts?: boolean;
}
