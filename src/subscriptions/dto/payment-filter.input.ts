import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { PaymentStatus } from '@prisma/client';

@InputType()
export class PaymentFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @Field(() => PaymentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;

  @Field(() => Int, { nullable: true, defaultValue: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  take?: number;
}
