import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class VoidTransactionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  reason: string;

  @Field({ nullable: true, defaultValue: true })
  @IsBoolean()
  @IsOptional()
  createReversal?: boolean;
}
