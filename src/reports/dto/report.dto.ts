import { InputType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsBoolean, IsArray, Allow } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

export enum ReportCategory {
  ATTENDANCE = 'ATTENDANCE',
  MEMBERSHIP = 'MEMBERSHIP',
  FINANCE = 'FINANCE',
  BIRTH_REGISTER = 'BIRTH_REGISTER',
  DEATH_REGISTER = 'DEATH_REGISTER',
  SACRAMENTS = 'SACRAMENTS',
  CONTRIBUTIONS = 'CONTRIBUTIONS',
  EVENTS = 'EVENTS',
  GROUPS = 'GROUPS',
  ZONES = 'ZONES',
}

export enum ReportFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum ExportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
}

registerEnumType(ReportCategory, { name: 'ReportCategory' });
registerEnumType(ReportFrequency, { name: 'ReportFrequency' });
registerEnumType(ExportFormat, { name: 'ExportFormat' });

// Report Template DTOs
@InputType()
export class CreateReportTemplateInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ReportCategory)
  @IsEnum(ReportCategory)
  category: ReportCategory;

  @Field(() => GraphQLJSON)
  @IsOptional()
  @Allow()
  filters: any;

  @Field(() => GraphQLJSON)
  metrics: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  columns?: any;

  @Field()
  @IsString()
  organisationId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

@InputType()
export class UpdateReportTemplateInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  filters?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metrics?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  columns?: any;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

@ObjectType()
export class ReportTemplate {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => ReportCategory)
  category: ReportCategory;

  @Field(() => GraphQLJSON)
  filters: any;

  @Field(() => GraphQLJSON)
  metrics: any;

  @Field(() => GraphQLJSON, { nullable: true })
  columns?: any | null;

  @Field()
  createdBy: string;

  @Field()
  organisationId: string;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field()
  isPublic: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// Report Execution DTOs
@InputType()
export class ExecuteReportInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  templateId?: string;

  @Field(() => ReportCategory)
  @IsEnum(ReportCategory)
  category: ReportCategory;

  @Field(() => GraphQLJSON)
  filters: any;

  @Field()
  @IsString()
  organisationId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;
}

@ObjectType()
export class ReportSummary {
  @Field()
  totalRecords: number;

  @Field(() => GraphQLJSON)
  metrics: any;
}

@ObjectType()
export class ReportExecution {
  @Field()
  id: string;

  @Field(() => String, { nullable: true })
  templateId?: string | null;

  @Field(() => ReportCategory)
  category: ReportCategory;

  @Field(() => GraphQLJSON)
  filters: any;

  @Field(() => GraphQLJSON)
  results: any;

  @Field(() => GraphQLJSON, { nullable: true })
  summary?: any | null;

  @Field()
  executedBy: string;

  @Field()
  organisationId: string;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field()
  executedAt: Date;
}

@ObjectType()
export class ReportResult {
  @Field(() => ReportSummary)
  summary: ReportSummary;

  @Field(() => GraphQLJSON)
  data: any;

  @Field(() => ReportExecution, { nullable: true })
  execution?: ReportExecution;

  @Field(() => GraphQLJSON, { nullable: true })
  charts?: any;
}

// Export DTOs
@InputType()
export class ExportReportInput {
  @Field()
  @IsString()
  reportExecutionId: string;

  @Field(() => ExportFormat)
  @IsEnum(ExportFormat)
  format: ExportFormat;
}

@ObjectType()
export class ExportResult {
  @Field()
  url: string;

  @Field()
  expiresAt: Date;
}

// Scheduled Report DTOs
@InputType()
export class CreateScheduledReportInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  templateId?: string;

  @Field(() => ReportCategory)
  @IsEnum(ReportCategory)
  category: ReportCategory;

  @Field(() => GraphQLJSON)
  filters: any;

  @Field(() => ReportFrequency)
  @IsEnum(ReportFrequency)
  frequency: ReportFrequency;

  @Field(() => [String])
  @IsArray()
  recipients: string[];

  @Field()
  @IsString()
  organisationId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;
}

@ObjectType()
export class ScheduledReport {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  templateId?: string | null;

  @Field(() => ReportCategory, { nullable: true })
  category?: ReportCategory | null;

  @Field(() => GraphQLJSON, { nullable: true })
  filters?: any | null;

  @Field(() => ReportFrequency)
  frequency: ReportFrequency;

  @Field(() => [String])
  recipients: string[];

  @Field(() => Date, { nullable: true })
  nextRunDate?: Date | null;

  @Field(() => Date, { nullable: true })
  lastRunDate?: Date | null;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean | null;

  @Field(() => String, { nullable: true })
  organisationId?: string | null;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field()
  createdBy: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | null;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | null;
}
