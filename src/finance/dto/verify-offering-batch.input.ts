import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class VerifyOfferingBatchInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  status: string; // VERIFIED or REJECTED

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;
}
