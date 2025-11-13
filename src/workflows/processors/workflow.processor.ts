import { Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowExecutionService } from '../services/workflow-execution.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { NotificationService } from '../../communications/services/notification.service';

@Injectable()
@Processor('workflow-execution')
export class WorkflowProcessor {
  private readonly logger = new Logger(WorkflowProcessor.name);

  constructor(
    private prisma: PrismaService,
    private workflowExecutionService: WorkflowExecutionService,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    private notificationService: NotificationService,
  ) {}

  @Process('execute-workflow')
  async executeWorkflow(job: Job) {
    const { executionId, workflowId, actions } = job.data;

    this.logger.log(`Starting workflow execution ${executionId}`);

    try {
      // Update execution status to running
      await this.workflowExecutionService.updateExecutionStatus(
        executionId,
        'RUNNING',
      );

      // Get execution details
      const execution = await this.prisma.workflowExecution.findUnique({
        where: { id: executionId },
        include: {
          targetMember: true,
          targetEvent: true,
          workflow: true,
        },
      });

      if (!execution) {
        throw new Error(`Execution ${executionId} not found`);
      }

      // Execute each action in sequence
      for (const action of actions) {
        await this.executeAction(execution, action);
      }

      // Mark execution as completed
      await this.workflowExecutionService.updateExecutionStatus(
        executionId,
        'COMPLETED',
      );

      this.logger.log(`Completed workflow execution ${executionId}`);
    } catch (error) {
      this.logger.error(`Failed workflow execution ${executionId}:`, error);
      await this.workflowExecutionService.updateExecutionStatus(
        executionId,
        'FAILED',
        error.message,
      );
    }
  }

  private async executeAction(execution: any, action: any) {
    const actionExecutionId =
      await this.workflowExecutionService.createActionExecution(
        execution.id,
        action.id,
      );

    try {
      // Apply delay if specified
      if (action.delayMinutes && action.delayMinutes > 0) {
        this.logger.log(
          `Delaying action ${action.id} for ${action.delayMinutes} minutes`,
        );
        await this.delay(action.delayMinutes * 60 * 1000);
      }

      // Check conditions if specified
      if (
        action.conditions &&
        !(await this.evaluateConditions(execution, action.conditions))
      ) {
        this.logger.log(`Skipping action ${action.id} - conditions not met`);
        await this.workflowExecutionService.updateActionExecutionStatus(
          actionExecutionId,
          'COMPLETED',
          { skipped: true, reason: 'Conditions not met' },
        );
        return;
      }

      // Update action execution status to running
      await this.workflowExecutionService.updateActionExecutionStatus(
        actionExecutionId,
        'RUNNING',
      );

      // Execute the action based on type
      const result = await this.performAction(execution, action);

      // Mark action as completed
      await this.workflowExecutionService.updateActionExecutionStatus(
        actionExecutionId,
        'COMPLETED',
        result,
      );

      this.logger.log(
        `Completed action ${action.id} for execution ${execution.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed action ${action.id} for execution ${execution.id}:`,
        error,
      );
      await this.workflowExecutionService.updateActionExecutionStatus(
        actionExecutionId,
        'FAILED',
        null,
        error.message,
      );
      throw error; // Re-throw to fail the entire workflow
    }
  }

  private async performAction(execution: any, action: any): Promise<any> {
    const config = action.actionConfig;

    switch (action.actionType) {
      case 'SEND_EMAIL':
        return await this.sendEmail(execution, config);

      case 'SEND_SMS':
        return await this.sendSms(execution, config);

      case 'SEND_NOTIFICATION':
        return await this.sendNotification(execution, config);

      case 'UPDATE_MEMBER_STATUS':
        return await this.updateMemberStatus(execution, config);

      case 'CREATE_TASK':
        return await this.createTask(execution, config);

      case 'WAIT_DELAY':
        return await this.waitDelay(config);

      default:
        throw new Error(`Unknown action type: ${action.actionType}`);
    }
  }

  private async sendEmail(execution: any, config: any): Promise<any> {
    const { subject, template, recipients } = config;

    // Personalize the email content
    const personalizedSubject = await this.personalizeContent(
      subject,
      execution,
    );
    const personalizedBody = await this.personalizeContent(template, execution);

    // Generate beautiful HTML email from the template
    const htmlBody = await this.generateHtmlEmail(personalizedBody, execution);

    // Determine recipients
    const recipientList = await this.resolveRecipients(recipients, execution);

    // Enqueue email via notifications queue (processed by Engagement NotificationsProcessor)
    const result = await this.notificationsQueue.add('send', {
      channel: 'EMAIL',
      recipients: recipientList.map((id: string) => ({ id })),
      variables: {
        subject: personalizedSubject,
        html: htmlBody,
        text: personalizedBody,
      },
      branchId: execution.branchId,
      organisationId: execution.organisationId,
    });

    return {
      type: 'email',
      subject: personalizedSubject,
      recipients: recipientList,
      sent: result,
    };
  }

  private async sendSms(execution: any, config: any): Promise<any> {
    const { message, recipients } = config;

    // Personalize the SMS content
    const personalizedMessage = await this.personalizeContent(
      message,
      execution,
    );

    // Determine recipients
    const recipientList = await this.resolveRecipients(recipients, execution);

    // Enqueue SMS via notifications queue (processed by Engagement NotificationsProcessor)
    const result = await this.notificationsQueue.add('send', {
      channel: 'SMS',
      recipients: recipientList.map((id: string) => ({ id })),
      variables: {
        message: personalizedMessage,
      },
      branchId: execution.branchId,
      organisationId: execution.organisationId,
    });

    return {
      type: 'sms',
      message: personalizedMessage,
      recipients: recipientList,
      sent: result,
    };
  }

  private async sendNotification(execution: any, config: any): Promise<any> {
    const { title, message, recipients } = config;

    // Personalize the notification content
    const personalizedTitle = await this.personalizeContent(title, execution);
    const personalizedMessage = await this.personalizeContent(
      message,
      execution,
    );

    // Determine recipients
    const recipientList = await this.resolveRecipients(recipients, execution);

    // Send notifications to recipients
    const results: any[] = [];
    for (const recipientId of recipientList) {
      const result = await this.notificationService.createNotification({
        title: personalizedTitle,
        message: personalizedMessage,
        type: 'INFO' as any,
        userId: recipientId,
        organisationId: execution.organisationId,
      });
      results.push(result);
    }

    return {
      type: 'notification',
      title: personalizedTitle,
      message: personalizedMessage,
      recipients: recipientList,
      notifications: results,
    };
  }

  private async updateMemberStatus(execution: any, config: any): Promise<any> {
    const { status, reason } = config;

    if (!execution.targetMemberId) {
      throw new Error('No target member for status update');
    }

    await this.prisma.member.update({
      where: { id: execution.targetMemberId },
      data: {
        status,
        statusChangeDate: new Date(),
        statusChangeReason: reason,
      },
    });

    return {
      type: 'member_status_update',
      memberId: execution.targetMemberId,
      status,
      reason,
    };
  }

  private async createTask(execution: any, config: any): Promise<any> {
    const { title, description, assignedTo, dueDate } = config;

    // This would integrate with a task management system
    // For now, we'll just log the task creation
    this.logger.log(`Creating task: ${title} for ${assignedTo}`);

    return {
      type: 'task_creation',
      title,
      description,
      assignedTo,
      dueDate,
      created: true,
    };
  }

  private async waitDelay(config: any): Promise<any> {
    const { delayMinutes } = config;
    await this.delay(delayMinutes * 60 * 1000);

    return {
      type: 'delay',
      delayMinutes,
      completed: true,
    };
  }

  private async personalizeContent(
    content: string,
    execution: any,
  ): Promise<string> {
    let personalizedContent = content;

    // Replace member placeholders
    if (execution.targetMember) {
      personalizedContent = personalizedContent
        .replace(
          /\{\{member\.firstName\}\}/g,
          execution.targetMember.firstName || '',
        )
        .replace(
          /\{\{member\.lastName\}\}/g,
          execution.targetMember.lastName || '',
        )
        .replace(
          /\{\{member\.fullName\}\}/g,
          `${execution.targetMember.firstName || ''} ${execution.targetMember.lastName || ''}`.trim(),
        )
        .replace(/\{\{member\.email\}\}/g, execution.targetMember.email || '');
    }

    // Replace event placeholders
    if (execution.targetEvent) {
      personalizedContent = personalizedContent
        .replace(/\{\{event\.title\}\}/g, execution.targetEvent.title || '')
        .replace(
          /\{\{event\.description\}\}/g,
          execution.targetEvent.description || '',
        )
        .replace(
          /\{\{event\.location\}\}/g,
          execution.targetEvent.location || '',
        )
        .replace(
          /\{\{event\.startDate\}\}/g,
          execution.targetEvent.startDate
            ? execution.targetEvent.startDate.toLocaleDateString()
            : '',
        );
    }

    // Replace workflow placeholders
    if (execution.workflow) {
      personalizedContent = personalizedContent.replace(
        /\{\{workflow\.name\}\}/g,
        execution.workflow.name || '',
      );
    }

    // Replace organization placeholders
    if (execution.organisationId) {
      const organisation = await this.prisma.organisation.findUnique({
        where: { id: execution.organisationId },
      });

      if (organisation) {
        personalizedContent = personalizedContent.replace(
          /\{\{organisation\.name\}\}/g,
          organisation.name || '',
        );
      }
    }

    return personalizedContent;
  }

  private async resolveRecipients(
    recipients: any,
    execution: any,
  ): Promise<string[]> {
    const recipientList: string[] = [];

    if (recipients.type === 'member' && execution.targetMemberId) {
      recipientList.push(execution.targetMemberId);
    } else if (recipients.type === 'specific') {
      recipientList.push(...recipients.ids);
    } else if (recipients.type === 'group') {
      // Get group members
      const groupMembers = await this.prisma.groupMember.findMany({
        where: { smallGroupId: recipients.groupId },
        select: { memberId: true },
      });
      recipientList.push(...groupMembers.map((gm) => gm.memberId));
    } else if (recipients.type === 'all_members') {
      // Get all active members in the organization/branch
      const members = await this.prisma.member.findMany({
        where: {
          organisationId: execution.organisationId,
          ...(execution.branchId && { branchId: execution.branchId }),
          status: 'ACTIVE',
        },
        select: { id: true },
      });
      recipientList.push(...members.map((m) => m.id));
    }

    return recipientList;
  }

  private async evaluateConditions(
    execution: any,
    conditions: any,
  ): Promise<boolean> {
    // Simple condition evaluation
    // In a real implementation, this would be more sophisticated

    if (conditions.memberStatus && execution.targetMember) {
      return execution.targetMember.status === conditions.memberStatus;
    }

    if (conditions.eventCategory && execution.targetEvent) {
      return execution.targetEvent.category === conditions.eventCategory;
    }

    // Default to true if no conditions or conditions are met
    return true;
  }

  private async generateHtmlEmail(
    content: string,
    execution: any,
  ): Promise<string> {
    // Get organization/branch info for branding
    const organization = await this.prisma.organisation.findUnique({
      where: { id: execution.organisationId },
    });

    const branch = execution.branchId
      ? await this.prisma.branch.findUnique({
          where: { id: execution.branchId },
        })
      : null;

    const organizationName = organization?.name || 'Chapel Stack';
    const branchName = branch?.name || '';
    const fullName = branchName
      ? `${organizationName} - ${branchName}`
      : organizationName;

    // Generate beautiful HTML email template
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${organizationName} Notification</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 8px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 40px;
            color: #374151;
        }
        .content h2 {
            color: #1f2937;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 20px;
            font-weight: 600;
        }
        .content p {
            margin-bottom: 16px;
            font-size: 16px;
        }
        .highlight-box {
            background-color: #f3f4f6;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 24px 0;
            border-radius: 0 8px 8px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-1px);
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
            }
            .header, .content, .footer {
                padding: 20px !important;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>${fullName}</h1>
            <p>Stay connected with your church community</p>
        </div>
        
        <div class="content">
            ${this.formatEmailContent(content, execution)}
        </div>
        
        <div class="footer">
            <p>This message was sent by ${fullName}</p>
            <p>You're receiving this because you're part of our church community.</p>
            <div class="social-links">
                <a href="#">📧 Contact Us</a>
                <a href="#">🌐 Website</a>
                <a href="#">📱 Mobile App</a>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  private formatEmailContent(content: string, execution: any): string {
    // Convert plain text content to formatted HTML
    let formattedContent = content;

    // Convert line breaks to paragraphs
    formattedContent = formattedContent
      .split('\n\n')
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0)
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('');

    // Add special formatting for event reminders
    if (execution.targetEvent) {
      const event = execution.targetEvent;
      const eventDate = event.startDate
        ? new Date(event.startDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';

      // Add event highlight box if this is an event-related email
      if (
        formattedContent.includes(event.title) ||
        formattedContent.includes('event')
      ) {
        formattedContent += `
        <div class="highlight-box">
            <h3 style="margin-top: 0; color: #667eea;">📅 Event Details</h3>
            <p><strong>Event:</strong> ${event.title}</p>
            ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
            ${eventDate ? `<p><strong>Date & Time:</strong> ${eventDate}</p>` : ''}
            ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
        </div>`;
      }
    }

    // Add member personalization if available
    if (execution.targetMember) {
      const member = execution.targetMember;
      const greeting = `<h2>Hello ${member.firstName || 'Friend'}! 👋</h2>`;
      formattedContent = greeting + formattedContent;
    }

    return formattedContent;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
