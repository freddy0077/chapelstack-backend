import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min,
} from 'class-validator';
import { InputType, Field, Float, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { SubscriptionInterval } from '@prisma/client';

@InputType()
export class CreatePlanDto {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field({ defaultValue: 'NGN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @Field(() => SubscriptionInterval, {
    defaultValue: SubscriptionInterval.MONTHLY,
  })
  @IsEnum(SubscriptionInterval)
  interval: SubscriptionInterval;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  intervalCount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  trialPeriodDays?: number;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  invoiceLimit?: number;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  sendInvoices?: boolean;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  sendSms?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  features?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field()
  @IsString()
  organisationId: string;
}
