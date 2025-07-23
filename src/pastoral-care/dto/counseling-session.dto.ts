import {
  InputType,
  Field,
  ObjectType,
  registerEnumType,
  Int,
} from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { CounselingSessionType, CounselingSessionStatus } from '@prisma/client';

// Register enums for GraphQL
registerEnumType(CounselingSessionType, {
  name: 'CounselingSessionType',
});

registerEnumType(CounselingSessionStatus, {
  name: 'CounselingSessionStatus',
});

@InputType()
export class CreateCounselingSessionInput {
  @Field()
  @IsUUID()
  memberId: string;

  @Field()
  @IsUUID()
  counselorId: string;

  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => CounselingSessionType)
  @IsEnum(CounselingSessionType)
  sessionType: CounselingSessionType;

  @Field()
  @IsDateString()
  scheduledDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  recurringPattern?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sessionNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  privateNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  homework?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nextSteps?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  sessionNumber?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  totalSessions?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  progressNotes?: string;

  @Field(() => CounselingSessionStatus, {
    defaultValue: CounselingSessionStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(CounselingSessionStatus)
  status?: CounselingSessionStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  topic?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field()
  @IsBoolean()
  isConfidential: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @Field()
  @IsUUID()
  organisationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

@InputType()
export class UpdateCounselingSessionInput {
  @Field()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  counselorId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  topic?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => CounselingSessionType, { nullable: true })
  @IsOptional()
  @IsEnum(CounselingSessionType)
  sessionType?: CounselingSessionType;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  recurringPattern?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sessionNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  privateNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  homework?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nextSteps?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  sessionNumber?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  totalSessions?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  progressNotes?: string;

  @Field(() => CounselingSessionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CounselingSessionStatus)
  status?: CounselingSessionStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

@InputType()
export class CounselingSessionFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  counselorId?: string;

  @Field(() => CounselingSessionType, { nullable: true })
  @IsOptional()
  @IsEnum(CounselingSessionType)
  sessionType?: CounselingSessionType;

  @Field(() => CounselingSessionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CounselingSessionStatus)
  status?: CounselingSessionStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;

  @Field()
  @IsUUID()
  organisationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

@ObjectType()
export class CounselingSession {
  @Field()
  id: string;

  @Field()
  memberId: string;

  @Field()
  primaryMemberId: string;

  @Field()
  counselorId: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Date)
  scheduledDate: Date;

  @Field(() => Date, { nullable: true })
  actualDate?: Date | null;

  @Field(() => Int)
  duration: number;

  @Field(() => CounselingSessionType)
  sessionType: CounselingSessionType;

  @Field(() => CounselingSessionStatus)
  status: CounselingSessionStatus;

  @Field(() => Boolean)
  isConfidential: boolean;

  @Field(() => Date, { nullable: true })
  followUpDate?: Date;

  @Field(() => String)
  organisationId: string;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => String)
  createdBy: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
