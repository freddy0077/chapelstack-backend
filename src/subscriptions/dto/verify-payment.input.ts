import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class VerifyPaymentInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  reference: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  planId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactEmail?: string;
}
