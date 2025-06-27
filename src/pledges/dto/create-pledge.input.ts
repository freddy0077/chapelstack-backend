import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreatePledgeInput {
  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @Field(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  endDate?: Date;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  frequency: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  status: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  memberId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  fundId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;
}
