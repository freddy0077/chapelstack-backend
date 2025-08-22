import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

@InputType()
export class UpdateBudgetInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  fiscalYear?: number;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @Field(() => String, { nullable: true })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  status?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  fundId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  ministryId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  updatedById?: string;
}
