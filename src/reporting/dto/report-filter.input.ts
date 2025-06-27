import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsDate, IsEnum, IsString } from 'class-validator';

@InputType()
export class DateRangeInput {
  @Field(() => Date)
  @IsDate()
  startDate: Date;

  @Field(() => Date)
  @IsDate()
  endDate: Date;
}

@InputType()
export class ReportFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @Field(() => DateRangeInput, { nullable: true })
  @IsOptional()
  dateRange?: DateRangeInput;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  eventTypeId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  fundId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}

export enum OutputFormat {
  JSON = 'JSON',
  CSV = 'CSV',
  PDF = 'PDF',
  EXCEL = 'EXCEL',
}

@InputType()
export class ReportRequestInput {
  @Field(() => String)
  @IsEnum([
    'MEMBER_LIST',
    'ATTENDANCE_SUMMARY',
    'FINANCIAL_CONTRIBUTIONS',
    'MEMBER_DEMOGRAPHICS',
    'ATTENDANCE_TREND',
  ])
  reportType: string;

  @Field(() => ReportFilterInput)
  filter: ReportFilterInput;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(OutputFormat)
  outputFormat?: OutputFormat;
}
