import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum, IsEmail } from 'class-validator';
import { GraphQLISODateTime } from '@nestjs/graphql';

export enum CheckInMethod {
  MANUAL = 'MANUAL',
  MOBILE = 'MOBILE',
  RFID = 'RFID',
  NFC = 'NFC',
  QR_CODE = 'QR_CODE',
}

@InputType()
export class UpdateAttendanceRecordInput {
  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  checkInTime?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  checkOutTime?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(CheckInMethod)
  checkInMethod?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

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
}
