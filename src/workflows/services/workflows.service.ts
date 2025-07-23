import { Injectable } from '@nestjs/common';
import { WorkflowTemplateService } from './workflow-template.service';
import { WorkflowExecutionService } from './workflow-execution.service';
import { WorkflowTriggerService } from './workflow-trigger.service';
import {
  CreateWorkflowTemplateInput,
  UpdateWorkflowTemplateInput,
  WorkflowFilterInput,
  TriggerWorkflowInput,
} from '../dto/workflow-template.input';
import {
  WorkflowTemplate,
  WorkflowExecution,
  WorkflowStats,
} from '../entities/workflow-template.entity';

@Injectable()
export class WorkflowsService {
  constructor(
    private workflowTemplateService: WorkflowTemplateService,
    private workflowExecutionService: WorkflowExecutionService,
    private workflowTriggerService: WorkflowTriggerService,
  ) {}

  // Workflow Template Methods
  async createWorkflowTemplate(
    input: CreateWorkflowTemplateInput,
    createdBy: string,
  ): Promise<WorkflowTemplate> {
    const workflow = await this.workflowTemplateService.createWorkflowTemplate(
      input,
      createdBy,
    );

    // Create triggers for the workflow if needed
    await this.setupWorkflowTriggers(workflow);

    return workflow;
  }

  async updateWorkflowTemplate(
    id: string,
    input: UpdateWorkflowTemplateInput,
    organisationId: string,
    branchId?: string,
  ): Promise<WorkflowTemplate> {
    return this.workflowTemplateService.updateWorkflowTemplate(
      id,
      input,
      organisationId,
      branchId,
    );
  }

  async getWorkflowTemplate(
    id: string,
    organisationId: string,
    branchId?: string,
  ): Promise<WorkflowTemplate> {
    return this.workflowTemplateService.getWorkflowTemplate(
      id,
      organisationId,
      branchId,
    );
  }

  async getWorkflowTemplates(
    filter: WorkflowFilterInput,
    organisationId: string,
    branchId?: string,
  ): Promise<WorkflowTemplate[]> {
    return this.workflowTemplateService.getWorkflowTemplates(
      filter,
      organisationId,
      branchId,
    );
  }

  async deleteWorkflowTemplate(
    id: string,
    organisationId: string,
    branchId?: string,
  ): Promise<boolean> {
    return this.workflowTemplateService.deleteWorkflowTemplate(
      id,
      organisationId,
      branchId,
    );
  }

  // Workflow Execution Methods
  async triggerWorkflow(
    input: TriggerWorkflowInput,
    triggeredBy?: string,
  ): Promise<WorkflowExecution> {
    return this.workflowExecutionService.triggerWorkflow(input, triggeredBy);
  }

  async getWorkflowExecution(
    id: string,
    organisationId: string,
    branchId?: string,
  ): Promise<WorkflowExecution> {
    return this.workflowExecutionService.getWorkflowExecution(
      id,
      organisationId,
      branchId,
    );
  }

  async getWorkflowExecutions(
    workflowId?: string,
    organisationId?: string,
    branchId?: string,
    limit = 50,
  ): Promise<WorkflowExecution[]> {
    return this.workflowExecutionService.getWorkflowExecutions(
      workflowId,
      organisationId,
      branchId,
      limit,
    );
  }

  async cancelExecution(
    executionId: string,
    organisationId: string,
    branchId?: string,
  ): Promise<boolean> {
    return this.workflowExecutionService.cancelExecution(
      executionId,
      organisationId,
      branchId,
    );
  }

  async retryExecution(
    executionId: string,
    organisationId: string,
    branchId?: string,
  ): Promise<WorkflowExecution> {
    return this.workflowExecutionService.retryExecution(
      executionId,
      organisationId,
      branchId,
    );
  }

  // Statistics and Analytics
  async getWorkflowStats(
    organisationId: string,
    branchId?: string,
  ): Promise<WorkflowStats> {
    return this.workflowTemplateService.getWorkflowStats(
      organisationId,
      branchId,
    );
  }

  // Trigger Integration Methods
  async handleMemberCreated(
    memberId: string,
    organisationId: string,
    branchId?: string,
  ) {
    return this.workflowTriggerService.handleMemberCreated(
      memberId,
      organisationId,
      branchId,
    );
  }

  async handleMemberUpdated(
    memberId: string,
    organisationId: string,
    branchId?: string,
    changes?: any,
  ) {
    return this.workflowTriggerService.handleMemberUpdated(
      memberId,
      organisationId,
      branchId,
      changes,
    );
  }

  async handleEventCreated(
    eventId: string,
    organisationId: string,
    branchId?: string,
  ) {
    return this.workflowTriggerService.handleEventCreated(
      eventId,
      organisationId,
      branchId,
    );
  }

  async handleDonationReceived(
    transactionId: string,
    organisationId: string,
    branchId?: string,
  ): Promise<void> {
    return this.workflowTriggerService.handleDonationReceived(
      transactionId,
      organisationId,
      branchId,
    );
  }

  async handleAttendanceRecorded(
    attendanceId: string,
    memberId: string,
    organisationId: string,
    branchId?: string,
  ) {
    return this.workflowTriggerService.handleAttendanceRecorded(
      attendanceId,
      memberId,
      organisationId,
      branchId,
    );
  }

  // Predefined Workflow Templates
  async createPredefinedWorkflows(
    organisationId: string,
    branchId?: string,
    createdBy?: string,
  ): Promise<WorkflowTemplate[]> {
    const predefinedWorkflows = [
      // New Member Welcome Workflow
      {
        name: 'New Member Welcome',
        description: 'Welcome new members with a series of follow-up messages',
        type: 'FOLLOW_UP',
        triggerType: 'MEMBER_CREATED',
        actions: [
          {
            actionType: 'SEND_EMAIL',
            actionConfig: JSON.stringify({
              subject: 'Welcome to {{organisation.name}}!',
              template:
                'Dear {{member.firstName}},\n\nWelcome to our church family! We are excited to have you join us.',
              recipients: { type: 'member' },
            }),
            delayMinutes: 0,
          },
          {
            actionType: 'SEND_EMAIL',
            actionConfig: JSON.stringify({
              subject: 'Getting Started at {{organisation.name}}',
              template:
                'Hi {{member.firstName}},\n\nHere are some resources to help you get started...',
              recipients: { type: 'member' },
            }),
            delayMinutes: 1440, // 24 hours
          },
        ],
      },
      // Event Reminder Workflow
      {
        name: 'Event Reminder',
        description: 'Send reminders for upcoming events',
        type: 'EVENT_REMINDER',
        triggerType: 'EVENT_APPROACHING',
        actions: [
          {
            actionType: 'SEND_EMAIL',
            actionConfig: JSON.stringify({
              subject: 'Reminder: {{event.title}} Tomorrow',
              template:
                "Don't forget about {{event.title}} tomorrow at {{event.startDate}}!",
              recipients: { type: 'all_members' },
            }),
            delayMinutes: 0,
          },
        ],
      },
      // Donation Thank You Workflow
      {
        name: 'Donation Thank You',
        description: 'Thank members for their donations',
        type: 'DONATION_ACKNOWLEDGMENT',
        triggerType: 'DONATION_RECEIVED',
        actions: [
          {
            actionType: 'SEND_EMAIL',
            actionConfig: JSON.stringify({
              subject: 'Thank you for your generous donation',
              template:
                'Dear {{member.firstName}},\n\nThank you for your generous donation. Your support makes a difference!',
              recipients: { type: 'member' },
            }),
            delayMinutes: 0,
          },
        ],
      },
      // Membership Renewal Workflow
      {
        name: 'Membership Renewal Reminder',
        description: 'Remind members about upcoming membership renewal',
        type: 'MEMBERSHIP_RENEWAL',
        triggerType: 'MEMBERSHIP_EXPIRING',
        actions: [
          {
            actionType: 'SEND_EMAIL',
            actionConfig: JSON.stringify({
              subject: 'Membership Renewal Reminder',
              template:
                'Dear {{member.firstName}},\n\nYour membership is expiring soon. Please renew to continue enjoying our services.',
              recipients: { type: 'member' },
            }),
            delayMinutes: 0,
          },
          {
            actionType: 'SEND_EMAIL',
            actionConfig: JSON.stringify({
              subject: 'Final Reminder: Membership Renewal',
              template:
                'This is a final reminder about your membership renewal.',
              recipients: { type: 'member' },
            }),
            delayMinutes: 10080, // 7 days
          },
        ],
      },
    ];

    const createdWorkflows: WorkflowTemplate[] = [];
    for (const workflowData of predefinedWorkflows) {
      try {
        const workflow = await this.createWorkflowTemplate(
          {
            ...workflowData,
            organisationId,
            branchId,
          } as CreateWorkflowTemplateInput,
          createdBy || 'system',
        );
        createdWorkflows.push(workflow);
      } catch (error) {
        console.error(
          `Failed to create predefined workflow ${workflowData.name}:`,
          error,
        );
      }
    }

    return createdWorkflows;
  }

  private async setupWorkflowTriggers(workflow: WorkflowTemplate) {
    // Set up automatic triggers based on workflow type
    let cronExpression: string | undefined;

    switch (workflow.triggerType) {
      case 'MEMBERSHIP_EXPIRING':
        cronExpression = '0 0 * * *'; // Daily at midnight
        break;
      case 'EVENT_APPROACHING':
        cronExpression = '0 0 * * *'; // Daily at midnight
        break;
      default:
        // Event-based triggers don't need cron expressions
        break;
    }

    if (cronExpression) {
      await this.workflowTriggerService.createTrigger(
        workflow.id,
        workflow.triggerType,
        workflow.triggerConfig ? JSON.parse(workflow.triggerConfig) : {},
        cronExpression,
        workflow.organisationId,
        workflow.branchId,
      );
    }
  }
}
