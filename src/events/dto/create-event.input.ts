import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsDate,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

// Register RecurrenceType enum for GraphQL
export enum RecurrenceType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

registerEnumType(RecurrenceType, {
  name: 'RecurrenceType',
  description: 'Type of event recurrence',
});

@InputType()
export class CreateEventInput {
  @Field()
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => GraphQLISODateTime)
  @IsNotEmpty({ message: 'Start date is required' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  // Recurring event fields
  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @Field(() => RecurrenceType, { nullable: true })
  @IsOptional()
  @IsEnum(RecurrenceType)
  recurrenceType?: RecurrenceType;

  @Field({ nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  recurrenceInterval?: number;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  recurrenceEndDate?: Date;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  recurrenceDaysOfWeek?: string[];
}
