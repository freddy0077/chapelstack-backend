import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { FiscalPeriodStatus } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
} from 'class-validator';

// Register enum for GraphQL
registerEnumType(FiscalPeriodStatus, { name: 'FiscalPeriodStatus' });

@InputType()
export class GetFiscalPeriodInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  fiscalYear: number;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  periodNumber: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;
}

@InputType()
export class ListFiscalPeriodsInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  fiscalYear?: number;
}

@InputType()
export class CloseFiscalPeriodInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  fiscalYear: number;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  periodNumber: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;
}

@InputType()
export class CreateFiscalYearInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  fiscalYear: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;
}
