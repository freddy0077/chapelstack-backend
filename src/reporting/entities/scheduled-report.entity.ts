import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { ReportFrequency } from '../enums/report-frequency.enum';
import { OutputFormat } from '../dto/report-filter.input';

@ObjectType()
export class ScheduledReport {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  reportType: string;

  @Field(() => ReportFrequency)
  frequency: ReportFrequency;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastRunAt: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  nextRunAt: Date | null;

  @Field(() => [String])
  recipientEmails: string[];

  @Field(() => OutputFormat)
  outputFormat: OutputFormat;

  @Field(() => String, { nullable: true })
  branchId: string | null;

  @Field(() => String)
  createdById: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => String, { nullable: true })
  filterJson: string | null;
}
