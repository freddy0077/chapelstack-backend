import { Field, InputType } from '@nestjs/graphql';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { FormStatus } from '@prisma/client';
import { FormStatusEnum } from '../entities/form.entity';

// Define valid form status values as an array of strings for validation
const VALID_FORM_STATUSES = Object.values(FormStatusEnum);

@InputType()
export class FormFilterInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => FormStatusEnum, { nullable: true })
  @IsIn(VALID_FORM_STATUSES, {
    message: 'status must be a valid FormStatus enum value',
  })
  @IsOptional()
  status?: FormStatus;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  branchId?: string;
}
