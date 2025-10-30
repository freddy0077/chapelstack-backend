import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateBankAccountInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  glAccountId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  accountType: string;

  @Field({ defaultValue: 'GHS' })
  @IsString()
  @IsOptional()
  currency?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  organisationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;
}
