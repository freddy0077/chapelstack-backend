import { InputType, Field, Float, Int } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBudgetItemInput } from './create-budget-item.input';

@InputType()
export class CreateBudgetInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Int)
  @IsNumber()
  fiscalYear: number;

  @Field(() => String)
  @IsDateString()
  startDate: string;

  @Field(() => String)
  @IsDateString()
  endDate: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @Field(() => String)
  @IsString()
  fundId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  ministryId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;

  @Field(() => String)
  @IsString()
  organisationId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  createdById?: string;

  @Field(() => [CreateBudgetItemInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetItemInput)
  @IsOptional()
  budgetItems?: CreateBudgetItemInput[];
}
