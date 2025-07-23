import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';
import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { SubscriptionInterval } from '@prisma/client';

@InputType()
export class PlanFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => SubscriptionInterval, { nullable: true })
  @IsOptional()
  @IsEnum(SubscriptionInterval)
  interval?: SubscriptionInterval;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;

  @Field(() => Int, { nullable: true, defaultValue: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  take?: number;
}
