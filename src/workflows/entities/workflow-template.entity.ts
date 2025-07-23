import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  WorkflowType,
  WorkflowStatus,
  WorkflowTriggerType,
  WorkflowActionType,
} from '../dto/workflow-template.input';

export enum WorkflowExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(WorkflowExecutionStatus, { name: 'WorkflowExecutionStatus' });

@ObjectType()
export class WorkflowAction {
  @Field(() => ID)
  id: string;

  @Field()
  workflowId: string;

  @Field()
  stepNumber: number;

  @Field(() => WorkflowActionType)
  actionType: WorkflowActionType;

  @Field()
  actionConfig: string; // JSON string

  @Field({ nullable: true })
  delayMinutes?: number;

  @Field({ nullable: true })
  conditions?: string; // JSON string

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class WorkflowTemplate {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => WorkflowType)
  type: WorkflowType;

  @Field(() => WorkflowStatus)
  status: WorkflowStatus;

  @Field(() => WorkflowTriggerType)
  triggerType: WorkflowTriggerType;

  @Field({ nullable: true })
  triggerConfig?: string; // JSON string

  @Field()
  organisationId: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field(() => [WorkflowAction])
  actions: WorkflowAction[];

  @Field()
  createdBy: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Optional resolved fields
  @Field(() => [WorkflowExecution], { nullable: true })
  executions?: WorkflowExecution[];

  @Field({ nullable: true })
  executionCount?: number;

  @Field({ nullable: true })
  successRate?: number;
}

@ObjectType()
export class WorkflowExecution {
  @Field(() => ID)
  id: string;

  @Field()
  workflowId: string;

  @Field(() => WorkflowExecutionStatus)
  status: WorkflowExecutionStatus;

  @Field({ nullable: true })
  triggeredBy?: string;

  @Field({ nullable: true })
  triggerData?: string; // JSON string

  @Field({ nullable: true })
  targetMemberId?: string;

  @Field({ nullable: true })
  targetEventId?: string;

  @Field({ nullable: true })
  targetData?: string; // JSON string

  @Field({ nullable: true })
  startedAt?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field({ nullable: true })
  errorMessage?: string;

  @Field()
  organisationId: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Optional resolved fields
  @Field(() => WorkflowTemplate, { nullable: true })
  workflow?: WorkflowTemplate;

  @Field(() => [WorkflowActionExecution], { nullable: true })
  actionExecutions?: WorkflowActionExecution[];

  @Field({ nullable: true })
  duration?: number; // Duration in milliseconds
}

@ObjectType()
export class WorkflowActionExecution {
  @Field(() => ID)
  id: string;

  @Field()
  executionId: string;

  @Field()
  actionId: string;

  @Field(() => WorkflowExecutionStatus)
  status: WorkflowExecutionStatus;

  @Field({ nullable: true })
  startedAt?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field({ nullable: true })
  errorMessage?: string;

  @Field({ nullable: true })
  result?: string; // JSON string

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Optional resolved fields
  @Field(() => WorkflowAction, { nullable: true })
  action?: WorkflowAction;
}

@ObjectType()
export class WorkflowTrigger {
  @Field(() => ID)
  id: string;

  @Field()
  workflowId: string;

  @Field(() => WorkflowTriggerType)
  triggerType: WorkflowTriggerType;

  @Field()
  triggerConfig: string; // JSON string

  @Field({ nullable: true })
  cronExpression?: string;

  @Field({ nullable: true })
  nextRunAt?: Date;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  lastTriggeredAt?: Date;

  @Field()
  organisationId: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Optional resolved fields
  @Field(() => WorkflowTemplate, { nullable: true })
  workflow?: WorkflowTemplate;
}

@ObjectType()
export class WorkflowStats {
  @Field()
  totalWorkflows: number;

  @Field()
  activeWorkflows: number;

  @Field()
  totalExecutions: number;

  @Field()
  successfulExecutions: number;

  @Field()
  failedExecutions: number;

  @Field()
  averageExecutionTime: number;

  @Field()
  executionsToday: number;

  @Field()
  executionsThisWeek: number;

  @Field()
  executionsThisMonth: number;
}
