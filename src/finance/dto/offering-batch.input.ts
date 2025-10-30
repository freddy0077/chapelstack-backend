import { InputType, Field, Float, Int, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { OfferingBatchStatus, OfferingTypeEnum } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  IsObject,
  IsInt,
} from 'class-validator';

// Register enums for GraphQL
registerEnumType(OfferingBatchStatus, { name: 'OfferingBatchStatus' });
registerEnumType(OfferingTypeEnum, { name: 'OfferingTypeEnum' });

@InputType()
export class CreateOfferingBatchInput {
  @Field()
  @IsDateString()
  @IsNotEmpty()
  batchDate: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  serviceId?: string;

  @Field(() => OfferingTypeEnum, { nullable: true, defaultValue: OfferingTypeEnum.GENERAL })
  @IsEnum(OfferingTypeEnum)
  @IsOptional()
  offeringType?: OfferingTypeEnum;

  @Field(() => Float)
  @IsNumber()
  @IsNotEmpty()
  cashAmount: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  mobileMoneyAmount?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  chequeAmount?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  foreignCurrencyAmount?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  cashDenominations?: any;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  counters?: string[];

  @Field(() => [String])
  @IsArray()
  @IsNotEmpty()
  countedBy: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  verifierId?: string;

  @Field(() => OfferingBatchStatus, { nullable: true, defaultValue: OfferingBatchStatus.COUNTING })
  @IsEnum(OfferingBatchStatus)
  @IsOptional()
  status?: OfferingBatchStatus;

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
export class VerifyOfferingBatchInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  discrepancyAmount?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  discrepancyNotes?: string;

  // Optional deposit information
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  depositBankAccountId?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  depositDate?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  depositSlipNumber?: string;
}

@InputType()
export class PostOfferingToGLInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cashAccountId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  mobileMoneyAccountId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  chequeAccountId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  revenueAccountId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;
}

@InputType()
export class ListOfferingBatchesInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @Field(() => OfferingBatchStatus, { nullable: true })
  @IsEnum(OfferingBatchStatus)
  @IsOptional()
  status?: OfferingBatchStatus;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  skip?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  take?: number;
}
