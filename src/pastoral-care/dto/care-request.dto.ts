import {
  InputType,
  Field,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import {
  CareRequestType,
  CareRequestPriority,
  CareRequestStatus,
} from '@prisma/client';
import { Member } from '../../members/entities/member.entity';
import { User } from '../../auth/entities/user.entity';

// Register enums for GraphQL
registerEnumType(CareRequestType, {
  name: 'CareRequestType',
});

registerEnumType(CareRequestPriority, {
  name: 'CareRequestPriority',
});

registerEnumType(CareRequestStatus, {
  name: 'CareRequestStatus',
});

@InputType()
export class CreateCareRequestInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => CareRequestType)
  @IsEnum(CareRequestType)
  requestType: CareRequestType;

  @Field(() => CareRequestPriority, {
    defaultValue: CareRequestPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(CareRequestPriority)
  priority?: CareRequestPriority;

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field()
  @IsDateString()
  requestDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedPastorId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assistantId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => CareRequestStatus, { defaultValue: CareRequestStatus.SUBMITTED })
  @IsOptional()
  @IsEnum(CareRequestStatus)
  status?: CareRequestStatus;

  @Field()
  @IsUUID()
  organisationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

@InputType()
export class UpdateCareRequestInput {
  @Field()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field(() => CareRequestType, { nullable: true })
  @IsOptional()
  @IsEnum(CareRequestType)
  requestType?: CareRequestType;

  @Field(() => CareRequestPriority, { nullable: true })
  @IsOptional()
  @IsEnum(CareRequestPriority)
  priority?: CareRequestPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedPastorId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assistantId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => CareRequestStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CareRequestStatus)
  status?: CareRequestStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  completionDate?: string;
}

@InputType()
export class CareRequestFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedPastorId?: string;

  @Field(() => CareRequestType, { nullable: true })
  @IsOptional()
  @IsEnum(CareRequestType)
  requestType?: CareRequestType;

  @Field(() => CareRequestPriority, { nullable: true })
  @IsOptional()
  @IsEnum(CareRequestPriority)
  priority?: CareRequestPriority;

  @Field(() => CareRequestStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CareRequestStatus)
  status?: CareRequestStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field()
  @IsUUID()
  organisationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

@ObjectType()
export class CareRequest {
  @Field()
  id: string;

  @Field()
  memberId: string;

  @Field()
  requesterId: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => CareRequestType)
  requestType: CareRequestType;

  @Field(() => CareRequestPriority)
  priority: CareRequestPriority;

  @Field()
  requestDate: Date;

  @Field({ nullable: true })
  assignedPastorId?: string;

  @Field({ nullable: true })
  assistantId?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => CareRequestStatus)
  status: CareRequestStatus;

  @Field({ nullable: true })
  completionDate?: Date;

  @Field()
  organisationId: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field()
  createdBy: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relation fields
  @Field(() => Member, { nullable: true })
  requester?: Member;

  @Field(() => User, { nullable: true })
  assignedPastor?: User;

  @Field(() => User, { nullable: true })
  creator?: User;
}
