import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { TriggerWorkflowInput } from '../dto/workflow-template.input';
import { WorkflowExecution } from '../entities/workflow-template.entity';

@Injectable()
export class WorkflowExecutionService {
  private readonly logger = new Logger(WorkflowExecutionService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('workflow-execution') private workflowQueue: Queue,
  ) {}

  async triggerWorkflow(
    input: TriggerWorkflowInput,
    triggeredBy?: string,
  ): Promise<WorkflowExecution> {
    // Verify workflow exists and is active
    const workflow = await this.prisma.workflowTemplate.findFirst({
      where: {
        id: input.workflowId,
        status: 'ACTIVE',
      },
      include: {
        actions: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Active workflow template not found');
    }

    // Create workflow execution record
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId: input.workflowId,
        triggeredBy,
        triggerData: input.triggerData ? JSON.parse(input.triggerData) : null,
        targetMemberId: input.targetMemberId,
        targetEventId: input.targetEventId,
        targetData: input.targetData ? JSON.parse(input.targetData) : null,
        organisationId: workflow.organisationId,
        branchId: workflow.branchId,
        status: 'PENDING',
      },
    });

    // Queue the workflow execution
    await this.workflowQueue.add('execute-workflow', {
      executionId: execution.id,
      workflowId: input.workflowId,
      actions: workflow.actions,
    });

    this.logger.log(
      `Queued workflow execution ${execution.id} for workflow ${input.workflowId}`,
    );

    return this.mapToWorkflowExecution(execution);
  }

  async getWorkflowExecution(
    id: string,
    organisationId: string,
    branchId?: string,
  ): Promise<WorkflowExecution> {
    const execution = await this.prisma.workflowExecution.findFirst({
      where: {
        id,
        organisationId,
        ...(branchId && { branchId }),
      },
      include: {
        workflow: {
          include: {
            actions: {
              orderBy: { stepNumber: 'asc' },
            },
          },
        },
        actionExecutions: {
          include: {
            action: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!execution) {
      throw new NotFoundException('Workflow execution not found');
    }

    return this.mapToWorkflowExecution(execution);
  }

  async getWorkflowExecutions(
    workflowId?: string,
    organisationId?: string,
    branchId?: string,
    limit = 50,
  ): Promise<WorkflowExecution[]> {
    const where: any = {};

    if (workflowId) where.workflowId = workflowId;
    if (organisationId) where.organisationId = organisationId;
    if (branchId) where.branchId = branchId;

    const executions = await this.prisma.workflowExecution.findMany({
      where,
      include: {
        workflow: true,
        actionExecutions: {
          include: {
            action: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return executions.map((execution) =>
      this.mapToWorkflowExecution(execution),
    );
  }

  async updateExecutionStatus(
    executionId: string,
    status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED',
    errorMessage?: string,
  ): Promise<void> {
    const updateData: any = { status };

    if (
      status === 'RUNNING' &&
      !(await this.getExecutionStartTime(executionId))
    ) {
      updateData.startedAt = new Date();
    }

    if (
      status === 'COMPLETED' ||
      status === 'FAILED' ||
      status === 'CANCELLED'
    ) {
      updateData.completedAt = new Date();
    }

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    await this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: updateData,
    });

    this.logger.log(`Updated execution ${executionId} status to ${status}`);
  }

  async createActionExecution(
    executionId: string,
    actionId: string,
  ): Promise<string> {
    const actionExecution = await this.prisma.workflowActionExecution.create({
      data: {
        executionId,
        actionId,
        status: 'PENDING',
      },
    });

    return actionExecution.id;
  }

  async updateActionExecutionStatus(
    actionExecutionId: string,
    status: 'RUNNING' | 'COMPLETED' | 'FAILED',
    result?: any,
    errorMessage?: string,
  ): Promise<void> {
    const updateData: any = { status };

    if (status === 'RUNNING') {
      updateData.startedAt = new Date();
    }

    if (status === 'COMPLETED' || status === 'FAILED') {
      updateData.completedAt = new Date();
    }

    if (result) {
      updateData.result = result;
    }

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    await this.prisma.workflowActionExecution.update({
      where: { id: actionExecutionId },
      data: updateData,
    });
  }

  async cancelExecution(
    executionId: string,
    organisationId: string,
    branchId?: string,
  ): Promise<boolean> {
    const execution = await this.prisma.workflowExecution.findFirst({
      where: {
        id: executionId,
        organisationId,
        ...(branchId && { branchId }),
        status: { in: ['PENDING', 'RUNNING'] },
      },
    });

    if (!execution) {
      throw new NotFoundException('Active workflow execution not found');
    }

    // Update execution status
    await this.updateExecutionStatus(executionId, 'CANCELLED');

    // Cancel any pending action executions
    await this.prisma.workflowActionExecution.updateMany({
      where: {
        executionId,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    });

    // Remove from queue if still pending
    const jobs = await this.workflowQueue.getJobs([
      'waiting',
      'active',
      'delayed',
    ]);
    const job = jobs.find((j) => j.data.executionId === executionId);
    if (job) {
      await job.remove();
    }

    this.logger.log(`Cancelled workflow execution ${executionId}`);
    return true;
  }

  async retryExecution(
    executionId: string,
    organisationId: string,
    branchId?: string,
  ): Promise<WorkflowExecution> {
    const execution = await this.prisma.workflowExecution.findFirst({
      where: {
        id: executionId,
        organisationId,
        ...(branchId && { branchId }),
        status: 'FAILED',
      },
      include: {
        workflow: {
          include: {
            actions: {
              orderBy: { stepNumber: 'asc' },
            },
          },
        },
      },
    });

    if (!execution) {
      throw new NotFoundException('Failed workflow execution not found');
    }

    // Reset execution status
    await this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'PENDING',
        startedAt: null,
        completedAt: null,
        errorMessage: null,
      },
    });

    // Reset action executions
    await this.prisma.workflowActionExecution.deleteMany({
      where: { executionId },
    });

    // Queue the workflow execution again
    await this.workflowQueue.add('execute-workflow', {
      executionId: execution.id,
      workflowId: execution.workflowId,
      actions: execution.workflow.actions,
    });

    this.logger.log(`Retrying workflow execution ${executionId}`);

    return this.mapToWorkflowExecution(execution);
  }

  private async getExecutionStartTime(
    executionId: string,
  ): Promise<Date | null> {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      select: { startedAt: true },
    });

    return execution?.startedAt || null;
  }

  private mapToWorkflowExecution(execution: any): WorkflowExecution {
    return {
      id: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      triggeredBy: execution.triggeredBy,
      triggerData: execution.triggerData
        ? JSON.stringify(execution.triggerData)
        : undefined,
      targetMemberId: execution.targetMemberId,
      targetEventId: execution.targetEventId,
      targetData: execution.targetData
        ? JSON.stringify(execution.targetData)
        : undefined,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      errorMessage: execution.errorMessage,
      organisationId: execution.organisationId,
      branchId: execution.branchId,
      createdAt: execution.createdAt,
      updatedAt: execution.updatedAt,
      workflow: execution.workflow
        ? {
            id: execution.workflow.id,
            name: execution.workflow.name,
            description: execution.workflow.description,
            type: execution.workflow.type,
            status: execution.workflow.status,
            triggerType: execution.workflow.triggerType,
            triggerConfig: execution.workflow.triggerConfig
              ? JSON.stringify(execution.workflow.triggerConfig)
              : undefined,
            organisationId: execution.workflow.organisationId,
            branchId: execution.workflow.branchId,
            createdBy: execution.workflow.createdBy,
            createdAt: execution.workflow.createdAt,
            updatedAt: execution.workflow.updatedAt,
            actions:
              execution.workflow.actions?.map((action: any) => ({
                id: action.id,
                workflowId: action.workflowId,
                stepNumber: action.stepNumber,
                actionType: action.actionType,
                actionConfig: JSON.stringify(action.actionConfig),
                delayMinutes: action.delayMinutes,
                conditions: action.conditions
                  ? JSON.stringify(action.conditions)
                  : null,
                createdAt: action.createdAt,
                updatedAt: action.updatedAt,
              })) || [],
          }
        : undefined,
      actionExecutions:
        execution.actionExecutions?.map((actionExecution: any) => ({
          id: actionExecution.id,
          executionId: actionExecution.executionId,
          actionId: actionExecution.actionId,
          status: actionExecution.status,
          startedAt: actionExecution.startedAt,
          completedAt: actionExecution.completedAt,
          errorMessage: actionExecution.errorMessage,
          result: actionExecution.result
            ? JSON.stringify(actionExecution.result)
            : null,
          createdAt: actionExecution.createdAt,
          updatedAt: actionExecution.updatedAt,
          action: actionExecution.action
            ? {
                id: actionExecution.action.id,
                workflowId: actionExecution.action.workflowId,
                stepNumber: actionExecution.action.stepNumber,
                actionType: actionExecution.action.actionType,
                actionConfig: JSON.stringify(
                  actionExecution.action.actionConfig,
                ),
                delayMinutes: actionExecution.action.delayMinutes,
                conditions: actionExecution.action.conditions
                  ? JSON.stringify(actionExecution.action.conditions)
                  : null,
                createdAt: actionExecution.action.createdAt,
                updatedAt: actionExecution.action.updatedAt,
              }
            : undefined,
        })) || [],
      duration:
        execution.startedAt && execution.completedAt
          ? execution.completedAt.getTime() - execution.startedAt.getTime()
          : undefined,
    };
  }
}
