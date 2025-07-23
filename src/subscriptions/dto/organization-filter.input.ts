import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { OrganisationStatus, SubscriptionStatus } from '@prisma/client';

@InputType()
export class OrganizationFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(OrganisationStatus)
  status?: OrganisationStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Int, { nullable: true, defaultValue: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
