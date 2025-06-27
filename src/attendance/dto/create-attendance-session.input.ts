import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { GraphQLISODateTime } from '@nestjs/graphql';

export enum SessionType {
  REGULAR_SERVICE = 'REGULAR_SERVICE',
  SPECIAL_EVENT = 'SPECIAL_EVENT',
  BIBLE_STUDY = 'BIBLE_STUDY',
  PRAYER_MEETING = 'PRAYER_MEETING',
  OTHER = 'OTHER',
}

export enum SessionStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@InputType()
export class CreateAttendanceSessionInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => GraphQLISODateTime)
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @Field(() => GraphQLISODateTime)
  @IsNotEmpty()
  @IsDate()
  startTime: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  endTime?: Date;

  @Field()
  @IsNotEmpty()
  @IsEnum(SessionType)
  type: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: string = SessionStatus.PLANNED;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  branchId?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  organisationId: string;
}
