import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { OutputFormat } from '../dto/report-filter.input';

registerEnumType(OutputFormat, {
  name: 'OutputFormat',
  description: 'Available output formats for reports',
});

@ObjectType()
export class ReportOutput {
  @Field(() => String)
  reportType: string;

  @Field(() => String, { nullable: true })
  downloadUrl?: string;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => Date)
  generatedAt: Date;

  @Field(() => OutputFormat)
  format: OutputFormat;

  @Field(() => GraphQLJSON, { nullable: true })
  data?: any;
}
