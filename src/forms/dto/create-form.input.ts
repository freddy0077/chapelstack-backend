import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { FormStatusEnum } from '../entities/form.entity';

// Define valid form status values as an array of strings for validation
const VALID_FORM_STATUSES = Object.values(FormStatusEnum);

@InputType()
export class CreateFormInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @Field(() => FormStatusEnum, { nullable: true })
  @IsIn(VALID_FORM_STATUSES, {
    message: 'status must be a valid FormStatus enum value',
  })
  @IsOptional()
  status?: FormStatusEnum = FormStatusEnum.DRAFT;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = false;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  successMessage?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  redirectUrl?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  enableCaptcha?: boolean = false;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notifyEmails?: string[] = [];

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsDate()
  @IsOptional()
  expiresAt?: Date;
}
