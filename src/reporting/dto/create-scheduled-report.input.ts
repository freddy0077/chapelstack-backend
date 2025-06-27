import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ReportFrequency } from '../enums/report-frequency.enum';
import { OutputFormat } from './report-filter.input';

@InputType()
export class CreateScheduledReportInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  reportType: string;

  @Field(() => ReportFrequency)
  @IsEnum(ReportFrequency)
  frequency: ReportFrequency;

  @Field(() => [String])
  @IsArray()
  @IsEmail({}, { each: true })
  recipientEmails: string[];

  @Field(() => OutputFormat)
  @IsEnum(OutputFormat)
  outputFormat: OutputFormat;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  filterJson?: string;
}
