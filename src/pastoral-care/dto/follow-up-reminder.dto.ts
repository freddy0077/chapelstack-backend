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
  IsBoolean,
} from 'class-validator';
import { FollowUpType, FollowUpStatus } from '@prisma/client';

// Register enums for GraphQL
registerEnumType(FollowUpType, {
  name: 'FollowUpType',
});

registerEnumType(FollowUpStatus, {
  name: 'FollowUpStatus',
});

@InputType()
export class CreateFollowUpReminderInput {
  @Field()
  @IsUUID()
  memberId: string;

  @Field(() => FollowUpType)
  @IsEnum(FollowUpType)
  followUpType: FollowUpType;

  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsDateString()
  dueDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  reminderDate?: string;

  @Field()
  @IsUUID()
  assignedToId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => FollowUpStatus, { defaultValue: FollowUpStatus.PENDING })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;

  @Field()
  @IsUUID()
  organisationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

@InputType()
export class UpdateFollowUpReminderInput {
  @Field()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field(() => FollowUpType, { nullable: true })
  @IsOptional()
  @IsEnum(FollowUpType)
  followUpType?: FollowUpType;

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
  @IsDateString()
  dueDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  reminderDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => FollowUpStatus, { nullable: true })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;
}

@InputType()
export class FollowUpReminderFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @Field(() => FollowUpType, { nullable: true })
  @IsOptional()
  @IsEnum(FollowUpType)
  followUpType?: FollowUpType;

  @Field(() => FollowUpStatus, { nullable: true })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;

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
export class FollowUpReminder {
  @Field()
  id: string;

  @Field({ nullable: true })
  memberId?: string;

  @Field(() => FollowUpType)
  followUpType: FollowUpType;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  dueDate: Date;

  @Field({ nullable: true })
  reminderDate?: Date;

  @Field({ nullable: true })
  assignedToId?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => FollowUpStatus)
  status: FollowUpStatus;

  @Field({ nullable: true })
  completedDate?: Date;

  @Field({ nullable: true })
  actionRequired?: string;

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
}
