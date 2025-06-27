import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { FormFieldType } from '@prisma/client';
import { FormFieldTypeEnum } from '../entities/form-field.entity';
import GraphQLJSON from 'graphql-type-json';

// Define valid form field types as an array of strings for validation
const VALID_FORM_FIELD_TYPES = Object.values(FormFieldTypeEnum);

@InputType()
export class CreateFormFieldInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  formId: string;

  @Field(() => FormFieldTypeEnum)
  @IsIn(VALID_FORM_FIELD_TYPES, {
    message: 'type must be a valid FormFieldType enum value',
  })
  @IsNotEmpty()
  type: FormFieldType;

  @Field()
  @IsString()
  @IsNotEmpty()
  label: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  placeholder?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  helpText?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  defaultValue?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  options?: any;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean = false;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isUnique?: boolean = false;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  validations?: any;

  @Field()
  @IsInt()
  @IsNotEmpty()
  order: number;

  @Field({ nullable: true })
  @IsInt()
  @Min(10)
  @Max(100)
  @IsOptional()
  width?: number = 100;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  conditionalLogic?: any;
}
