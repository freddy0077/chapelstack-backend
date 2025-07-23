import { IsString, IsOptional, IsDateString } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateSubscriptionDto {
  @Field()
  @IsString()
  customer: string; // Paystack customer code

  @Field()
  @IsString()
  plan: string; // Paystack plan code

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  authorization?: string; // Authorization code for card

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}
