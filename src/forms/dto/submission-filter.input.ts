import { Field, InputType } from '@nestjs/graphql';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class SubmissionFilterInput {
  @Field()
  @IsUUID()
  formId: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  status?: string;
}
