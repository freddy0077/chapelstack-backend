import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export enum MemberReportType {
  SUMMARY = 'SUMMARY',
  DETAILED = 'DETAILED',
  DEMOGRAPHICS = 'DEMOGRAPHICS',
  GROWTH_TRENDS = 'GROWTH_TRENDS',
  ENGAGEMENT = 'ENGAGEMENT',
  RETENTION = 'RETENTION',
  GEOGRAPHIC = 'GEOGRAPHIC',
}

export enum MemberReportGroupBy {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
}

export enum MemberReportFormat {
  JSON = 'JSON',
  CSV = 'CSV',
  PDF = 'PDF',
  EXCEL = 'EXCEL',
}

registerEnumType(MemberReportType, {
  name: 'MemberReportType',
});

registerEnumType(MemberReportGroupBy, {
  name: 'MemberReportGroupBy',
});

registerEnumType(MemberReportFormat, {
  name: 'MemberReportFormat',
});

@InputType()
export class MemberReportInput {
  @Field(() => MemberReportType)
  @IsEnum(MemberReportType)
  type: MemberReportType;

  @Field()
  @IsDateString()
  startDate: string;

  @Field()
  @IsDateString()
  endDate: string;

  @Field(() => MemberReportGroupBy, { nullable: true })
  @IsOptional()
  @IsEnum(MemberReportGroupBy)
  groupBy?: MemberReportGroupBy;

  @Field(() => MemberReportFormat, { nullable: true })
  @IsOptional()
  @IsEnum(MemberReportFormat)
  format?: MemberReportFormat;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  organisationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  branchId?: string;

  // Include/exclude options
  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  includeVisitors?: boolean;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  includeDemographics?: boolean;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  includeEngagement?: boolean;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  includePersonalInfo?: boolean;
}
