import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateSubscriptionInput {
  @Field()
  @IsUUID()
  customerId: string; // Member ID

  @Field()
  @IsUUID()
  planId: string; // Subscription Plan ID

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  authorizationCode?: string; // Paystack authorization code for card

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}
