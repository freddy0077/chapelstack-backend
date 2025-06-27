import { Field, ID, InputType, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export enum SmallGroupType {
  BIBLE_STUDY = 'BIBLE_STUDY',
  PRAYER = 'PRAYER',
  INTEREST_BASED = 'INTEREST_BASED',
  DISCIPLESHIP = 'DISCIPLESHIP',
  SUPPORT = 'SUPPORT',
  FELLOWSHIP = 'FELLOWSHIP',
  OTHER = 'OTHER',
}

export enum SmallGroupStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FULL = 'FULL',
}

@InputType()
export class CreateSmallGroupInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsEnum(SmallGroupType)
  @IsNotEmpty()
  type: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  meetingSchedule?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  maximumCapacity?: number;

  @Field()
  @IsEnum(SmallGroupStatus)
  @IsNotEmpty()
  status: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  ministryId?: string;
}

@InputType()
export class UpdateSmallGroupInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsEnum(SmallGroupType)
  @IsOptional()
  type?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  meetingSchedule?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  maximumCapacity?: number;

  @Field({ nullable: true })
  @IsEnum(SmallGroupStatus)
  @IsOptional()
  status?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  ministryId?: string;
}

@InputType()
export class SmallGroupFilterInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsEnum(SmallGroupType)
  @IsOptional()
  type?: string;

  @Field({ nullable: true })
  @IsEnum(SmallGroupStatus)
  @IsOptional()
  status?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  organisationId?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  ministryId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  search?: string;
}
