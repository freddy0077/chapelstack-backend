import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsUUID,
} from 'class-validator';
import { GraphQLISODateTime } from '@nestjs/graphql';

export enum CheckInMethod {
  MANUAL = 'MANUAL',
  MOBILE = 'MOBILE',
  RFID = 'RFID',
  NFC = 'NFC',
  QR_CODE = 'QR_CODE',
}

@InputType()
export class RecordAttendanceInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  sessionId: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  checkInTime?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(CheckInMethod)
  checkInMethod?: string = CheckInMethod.MANUAL;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  visitorName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  visitorEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  visitorPhone?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  recordedById?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
