import { IsOptional, IsBoolean, IsString, IsEnum } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { SubscriptionStatus } from '@prisma/client';

@InputType()
export class UpdateSubscriptionInput {
  @Field(() => SubscriptionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  cancelAtPeriodEnd?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cancelReason?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}
