import { InputType, Field, Float, Int, registerEnumType } from '@nestjs/graphql';
import { JournalEntryType, JournalEntryStatus } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

// Register enums for GraphQL
registerEnumType(JournalEntryType, { name: 'JournalEntryType' });
registerEnumType(JournalEntryStatus, { name: 'JournalEntryStatus' });

@InputType()
export class JournalEntryLineInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  lineNumber?: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Float)
  @IsNumber()
  @IsNotEmpty()
  debitAmount: number;

  @Field(() => Float)
  @IsNumber()
  @IsNotEmpty()
  creditAmount: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  currency?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fundId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ministryId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  memberId?: string;
}

@InputType()
export class CreateJournalEntryInput {
  @Field()
  @IsDateString()
  @IsNotEmpty()
  entryDate: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  postingDate?: string;

  @Field(() => JournalEntryType)
  @IsEnum(JournalEntryType)
  @IsNotEmpty()
  entryType: JournalEntryType;

  @Field()
  @IsString()
  @IsNotEmpty()
  sourceModule: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  sourceTransactionId?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  reference?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  memo?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  fiscalYear?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  fiscalPeriod?: number;

  @Field(() => JournalEntryStatus, { nullable: true })
  @IsEnum(JournalEntryStatus)
  @IsOptional()
  status?: JournalEntryStatus;

  @Field(() => [JournalEntryLineInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineInput)
  lines: JournalEntryLineInput[];

  @Field()
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  createdBy?: string;
}

@InputType()
export class ListJournalEntriesInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @Field(() => JournalEntryStatus, { nullable: true })
  @IsEnum(JournalEntryStatus)
  @IsOptional()
  status?: JournalEntryStatus;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  fiscalYear?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  fiscalPeriod?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  sourceModule?: string;

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

@InputType()
export class VoidJournalEntryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  reason: string;
}

@InputType()
export class ReverseJournalEntryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  originalEntryId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  reason: string;
}
