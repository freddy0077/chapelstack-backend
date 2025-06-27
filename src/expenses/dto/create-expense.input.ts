import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateExpenseInput {
  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @Field(() => Date)
  @IsNotEmpty()
  date: Date;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  expenseCategoryId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  fundId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  paymentMethodId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  vendorName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  vendorContact?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  budgetId?: string;
}
