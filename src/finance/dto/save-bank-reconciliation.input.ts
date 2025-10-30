import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class SaveBankReconciliationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  reconciliationDate: string;

  @Field(() => Float)
  @IsNumber()
  bankStatementBalance: number;

  @Field(() => Float)
  @IsNumber()
  bookBalance: number;

  @Field(() => Float)
  @IsNumber()
  adjustedBalance: number;

  @Field(() => Float)
  @IsNumber()
  difference: number;

  @Field(() => [String])
  @IsArray()
  clearedTransactions: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  reconciledBy: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  status: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bankStatementFileUrl?: string;
}
