import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { CheckInMethod } from './record-attendance.input';

@InputType()
export class CardScanInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  sessionId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  cardId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(CheckInMethod)
  scanMethod: CheckInMethod = CheckInMethod.RFID;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  scanTime?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  recordedById?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
