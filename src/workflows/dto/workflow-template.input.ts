import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum WorkflowType {
  FOLLOW_UP = 'FOLLOW_UP',
  EVENT_REMINDER = 'EVENT_REMINDER',
  MEMBERSHIP_RENEWAL = 'MEMBERSHIP_RENEWAL',
  DONATION_ACKNOWLEDGMENT = 'DONATION_ACKNOWLEDGMENT',
}

export enum WorkflowStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PAUSED = 'PAUSED',
  DELETED = 'DELETED',
}

export enum WorkflowTriggerType {
  MEMBER_CREATED = 'MEMBER_CREATED',
  MEMBER_UPDATED = 'MEMBER_UPDATED',
  EVENT_CREATED = 'EVENT_CREATED',
  EVENT_APPROACHING = 'EVENT_APPROACHING',
  DONATION_RECEIVED = 'DONATION_RECEIVED',
  MEMBERSHIP_EXPIRING = 'MEMBERSHIP_EXPIRING',
  ATTENDANCE_RECORDED = 'ATTENDANCE_RECORDED',
  CUSTOM_DATE = 'CUSTOM_DATE',
}

export enum WorkflowActionType {
  SEND_EMAIL = 'SEND_EMAIL',
  SEND_SMS = 'SEND_SMS',
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  UPDATE_MEMBER_STATUS = 'UPDATE_MEMBER_STATUS',
  CREATE_TASK = 'CREATE_TASK',
  WAIT_DELAY = 'WAIT_DELAY',
}

// Register enums with GraphQL
registerEnumType(WorkflowType, { name: 'WorkflowType' });
registerEnumType(WorkflowStatus, { name: 'WorkflowStatus' });
registerEnumType(WorkflowTriggerType, { name: 'WorkflowTriggerType' });
registerEnumType(WorkflowActionType, { name: 'WorkflowActionType' });

@InputType()
export class WorkflowActionInput {
  @Field()
  @IsString()
  actionType: WorkflowActionType;

  @Field()
  @IsString()
  actionConfig: string; // JSON string

  @Field({ nullable: true })
  @IsOptional()
  delayMinutes?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  conditions?: string; // JSON string
}

@InputType()
export class CreateWorkflowTemplateInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => WorkflowType)
  @IsEnum(WorkflowType)
  type: WorkflowType;

  @Field(() => WorkflowTriggerType)
  @IsEnum(WorkflowTriggerType)
  triggerType: WorkflowTriggerType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  triggerConfig?: string; // JSON string

  @Field(() => [WorkflowActionInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowActionInput)
  actions: WorkflowActionInput[];

  @Field()
  @IsUUID()
  organisationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

@InputType()
export class UpdateWorkflowTemplateInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => WorkflowStatus, { nullable: true })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  triggerConfig?: string; // JSON string

  @Field(() => [WorkflowActionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowActionInput)
  actions?: WorkflowActionInput[];
}

@InputType()
export class WorkflowFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => WorkflowType, { nullable: true })
  @IsOptional()
  @IsEnum(WorkflowType)
  type?: WorkflowType;

  @Field(() => WorkflowStatus, { nullable: true })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}

@InputType()
export class TriggerWorkflowInput {
  @Field()
  @IsUUID()
  workflowId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  targetMemberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  targetEventId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  triggerData?: string; // JSON string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  targetData?: string; // JSON string
}
