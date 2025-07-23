import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsEnum, IsArray, Min } from 'class-validator';
import { SubscriptionInterval } from '@prisma/client';

@InputType()
export class CreatePlanInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field({ defaultValue: 'GHS' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @Field(() => SubscriptionInterval, { defaultValue: SubscriptionInterval.MONTHLY })
  @IsEnum(SubscriptionInterval)
  interval: SubscriptionInterval;

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  @Min(1)
  intervalCount: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  trialPeriodDays?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
