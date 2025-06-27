import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateBudgetInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  fiscalYear: number;

  @Field(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @Field(() => Date)
  @IsNotEmpty()
  endDate: Date;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  status: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  fundId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  ministryId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;
}
