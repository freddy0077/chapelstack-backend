import { InputType, Field, Float } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { TransactionType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  IsObject,
} from 'class-validator';

@InputType()
export class CreateTransactionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fundId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;

  @Field(() => TransactionType)
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @Field(() => Float)
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  date?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  reference?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  metadata?: any;
}
