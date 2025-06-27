import { InputType, Field, Float } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateContributionInput {
  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @Field(() => Date)
  @IsNotEmpty()
  date: Date;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  contributionTypeId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  paymentMethodId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  fundId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  pledgeId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;
}
