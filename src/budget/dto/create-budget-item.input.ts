import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber } from 'class-validator';

@InputType()
export class CreateBudgetItemInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Float)
  @IsNumber()
  amount: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  budgetId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  expenseCategoryId?: string;
}
