import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateFormFieldValueInput } from './create-form-field-value.input';

@InputType()
export class CreateFormSubmissionInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  formId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  submittedById?: string;

  @Field(() => [CreateFormFieldValueInput])
  @IsNotEmpty()
  fieldValues: CreateFormFieldValueInput[];
}
