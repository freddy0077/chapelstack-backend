import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateWorkflowTemplateInput,
  UpdateWorkflowTemplateInput,
  WorkflowFilterInput,
} from '../dto/workflow-template.input';
import { WorkflowTemplate } from '../entities/workflow-template.entity';

@Injectable()
export class WorkflowTemplateService {
  constructor(private prisma: PrismaService) {}

  async createWorkflowTemplate(
    input: CreateWorkflowTemplateInput,
    createdBy: string,
  ): Promise<WorkflowTemplate> {
    try {
      // Validate that actions are properly ordered
      const sortedActions = input.actions.sort(
        (a, b) => (a.delayMinutes || 0) - (b.delayMinutes || 0),
      );

      // Prepare the data object with proper Prisma relationships
      const data: any = {
        name: input.name,
        description: input.description,
        type: input.type,
        triggerType: input.triggerType,
        triggerConfig: input.triggerConfig
          ? JSON.parse(input.triggerConfig)
          : null,
        creator: { connect: { id: createdBy } },
        actions: {
          create: sortedActions.map((action, index) => ({
            stepNumber: index + 1,
            actionType: action.actionType,
            actionConfig: JSON.parse(action.actionConfig),
            delayMinutes: action.delayMinutes,
            conditions: action.conditions
              ? JSON.parse(action.conditions)
              : null,
          })),
        },
      };

      // Add organisation relationship if provided
      if (input.organisationId) {
        data.organisation = { connect: { id: input.organisationId } };
      }

      // Add branch relationship if provided
      if (input.branchId) {
        data.branch = { connect: { id: input.branchId } };
      }

      const workflow = await this.prisma.workflowTemplate.create({
        data,
        include: {
          actions: {
            orderBy: { stepNumber: 'asc' },
          },
        },
      });

      return this.mapToWorkflowTemplate(workflow);
    } catch (error) {
      if (error.message.includes('JSON')) {
        throw new BadRequestException('Invalid JSON in configuration fields');
      }
      throw error;
    }
  }

  async updateWorkflowTemplate(
    id: string,
    input: UpdateWorkflowTemplateInput,
    organisationId: string,
    branchId?: string,
  ): Promise<WorkflowTemplate> {
    // Verify workflow exists and user has access
    const existingWorkflow = await this.prisma.workflowTemplate.findFirst({
      where: {
        id,
        organisationId,
        ...(branchId && { branchId }),
      },
    });

    if (!existingWorkflow) {
      throw new NotFoundException('Workflow template not found');
    }

    try {
      const updateData: any = {};

      if (input.name) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.status) updateData.status = input.status;
      if (input.triggerConfig) {
        updateData.triggerConfig = JSON.parse(input.triggerConfig);
      }

      // Handle actions update
      if (input.actions) {
        // Delete existing actions and create new ones
        await this.prisma.workflowAction.deleteMany({
          where: { workflowId: id },
        });

        const sortedActions = input.actions.sort(
          (a, b) => (a.delayMinutes || 0) - (b.delayMinutes || 0),
        );

        updateData.actions = {
          create: sortedActions.map((action, index) => ({
            stepNumber: index + 1,
            actionType: action.actionType,
            actionConfig: JSON.parse(action.actionConfig),
            delayMinutes: action.delayMinutes,
            conditions: action.conditions
              ? JSON.parse(action.conditions)
              : null,
          })),
        };
      }

      const workflow = await this.prisma.workflowTemplate.update({
        where: { id },
        data: updateData,
        include: {
          actions: {
            orderBy: { stepNumber: 'asc' },
          },
        },
      });

      return this.mapToWorkflowTemplate(workflow);
    } catch (error) {
      if (error.message.includes('JSON')) {
        throw new BadRequestException('Invalid JSON in configuration fields');
      }
      throw error;
    }
  }

  async getWorkflowTemplate(
    id: string,
    organisationId: string,
    branchId?: string,
  ): Promise<WorkflowTemplate> {
    const workflow = await this.prisma.workflowTemplate.findFirst({
      where: {
        id,
        organisationId,
        ...(branchId && { branchId }),
      },
      include: {
        actions: {
          orderBy: { stepNumber: 'asc' },
        },
        executions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow template not found');
    }

    return this.mapToWorkflowTemplate(workflow);
  }

  async getWorkflowTemplates(
    filter: WorkflowFilterInput,
    organisationId: string,
    branchId?: string,
  ): Promise<WorkflowTemplate[]> {
    const where: any = {
      organisationId,
      ...(branchId && { branchId }),
      ...(filter.type && { type: filter.type }),
      ...(filter.status && { status: filter.status }),
    };

    if (filter.searchTerm) {
      where.OR = [
        { name: { contains: filter.searchTerm, mode: 'insensitive' } },
        { description: { contains: filter.searchTerm, mode: 'insensitive' } },
      ];
    }

    const workflows = await this.prisma.workflowTemplate.findMany({
      where,
      include: {
        actions: {
          orderBy: { stepNumber: 'asc' },
        },
        _count: {
          select: { executions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return workflows.map((workflow) => this.mapToWorkflowTemplate(workflow));
  }

  async deleteWorkflowTemplate(
    id: string,
    organisationId: string,
    branchId?: string,
  ): Promise<boolean> {
    const workflow = await this.prisma.workflowTemplate.findFirst({
      where: {
        id,
        organisationId,
        ...(branchId && { branchId }),
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow template not found');
    }

    // Soft delete by setting status to DELETED
    await this.prisma.workflowTemplate.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    return true;
  }

  async getWorkflowStats(
    organisationId: string,
    branchId?: string,
  ): Promise<any> {
    const where: any = {
      organisationId,
      ...(branchId && { branchId }),
    };

    const [
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      executionsToday,
      executionsThisWeek,
      executionsThisMonth,
    ] = await Promise.all([
      this.prisma.workflowTemplate.count({
        where: { ...where, status: { not: 'DELETED' } },
      }),
      this.prisma.workflowTemplate.count({
        where: { ...where, status: 'ACTIVE' },
      }),
      this.prisma.workflowExecution.count({ where }),
      this.prisma.workflowExecution.count({
        where: { ...where, status: 'COMPLETED' },
      }),
      this.prisma.workflowExecution.count({
        where: { ...where, status: 'FAILED' },
      }),
      this.prisma.workflowExecution.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.workflowExecution.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.workflowExecution.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Calculate average execution time
    const executions = await this.prisma.workflowExecution.findMany({
      where: {
        ...where,
        status: 'COMPLETED',
        startedAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
      take: 100,
    });

    const averageExecutionTime =
      executions.length > 0
        ? executions.reduce((sum, execution) => {
            const duration =
              execution.completedAt!.getTime() - execution.startedAt!.getTime();
            return sum + duration;
          }, 0) / executions.length
        : 0;

    return {
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
      executionsToday,
      executionsThisWeek,
      executionsThisMonth,
    };
  }

  private mapToWorkflowTemplate(workflow: any): WorkflowTemplate {
    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      type: workflow.type,
      status: workflow.status,
      triggerType: workflow.triggerType,
      triggerConfig: workflow.triggerConfig
        ? JSON.stringify(workflow.triggerConfig)
        : undefined,
      organisationId: workflow.organisationId,
      branchId: workflow.branchId,
      createdBy: workflow.createdBy,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      actions:
        workflow.actions?.map((action: any) => ({
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
      executions:
        workflow.executions?.map((execution: any) => ({
          id: execution.id,
          workflowId: execution.workflowId,
          status: execution.status,
          triggeredBy: execution.triggeredBy,
          triggerData: execution.triggerData
            ? JSON.stringify(execution.triggerData)
            : null,
          targetMemberId: execution.targetMemberId,
          targetEventId: execution.targetEventId,
          targetData: execution.targetData
            ? JSON.stringify(execution.targetData)
            : null,
          startedAt: execution.startedAt,
          completedAt: execution.completedAt,
          errorMessage: execution.errorMessage,
          organisationId: execution.organisationId,
          branchId: execution.branchId,
          createdAt: execution.createdAt,
          updatedAt: execution.updatedAt,
        })) || [],
      executionCount: workflow._count?.executions || 0,
      successRate:
        workflow._count?.executions > 0
          ? ((workflow.executions?.filter((e: any) => e.status === 'COMPLETED')
              .length || 0) /
              workflow._count.executions) *
            100
          : 0,
    };
  }
}
