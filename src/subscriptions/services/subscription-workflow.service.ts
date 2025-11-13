import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowsService } from '../../workflows/services/workflows.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { SubscriptionStatus } from '@prisma/client';
import {
  WorkflowActionType,
  WorkflowType,
  WorkflowTriggerType,
} from '../../workflows/dto/workflow-template.input';

interface WorkflowTriggerData {
  organizationId: string;
  organizationName?: string;
  subscriptionId?: string;
  amount?: number;
  daysOverdue?: number;
  reason?: string;
  metadata?: any;
}

@Injectable()
export class SubscriptionWorkflowService {
  private readonly logger = new Logger(SubscriptionWorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowsService: WorkflowsService,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  // Trigger workflow when payment fails
  async triggerPaymentFailedWorkflow(data: WorkflowTriggerData): Promise<void> {
    try {
      // Create workflow execution record
      await this.workflowsService.createWorkflowTemplate(
        {
          name: 'Payment Failed',
          description: 'Handle failed payment workflow',
          type: WorkflowType.FOLLOW_UP,
          triggerType: WorkflowTriggerType.CUSTOM_DATE,
          triggerConfig: JSON.stringify({ event: 'payment_failed' }),
          actions: [
            {
              actionType: WorkflowActionType.SEND_EMAIL,
              actionConfig: JSON.stringify({
                template: 'payment_failed',
                recipients: ['organization_admins'],
              }),
            },
          ],
          organisationId: data.organizationId,
        },
        'SYSTEM',
      );

      // Send immediate notification
      await this.sendPaymentFailedNotification(data);

      this.logger.log(
        `Payment failed workflow triggered for organization: ${data.organizationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to trigger payment failed workflow: ${error.message}`,
      );
      throw error;
    }
  }

  // Trigger workflow when subscription is about to expire
  async triggerSubscriptionExpiringWorkflow(
    data: WorkflowTriggerData,
  ): Promise<void> {
    try {
      await this.workflowsService.createWorkflowTemplate(
        {
          name: 'Subscription Expiring',
          description: 'Handle subscription expiring workflow',
          type: WorkflowType.MEMBERSHIP_RENEWAL,
          triggerType: WorkflowTriggerType.CUSTOM_DATE,
          triggerConfig: JSON.stringify({ event: 'subscription_expiring' }),
          actions: [
            {
              actionType: WorkflowActionType.SEND_EMAIL,
              actionConfig: JSON.stringify({
                template: 'subscription_expiring',
                recipients: ['organization_admins'],
              }),
            },
          ],
          organisationId: data.organizationId,
        },
        'SYSTEM',
      );

      await this.sendSubscriptionExpiringNotification(data);

      this.logger.log(
        `Subscription expiring workflow triggered for organization: ${data.organizationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to trigger subscription expiring workflow: ${error.message}`,
      );
      throw error;
    }
  }

  // Trigger workflow when organization is suspended
  async triggerOrganizationSuspendedWorkflow(
    data: WorkflowTriggerData,
  ): Promise<void> {
    try {
      await this.workflowsService.createWorkflowTemplate(
        {
          name: 'Organization Suspended',
          description: 'Handle organization suspension workflow',
          type: WorkflowType.FOLLOW_UP,
          triggerType: WorkflowTriggerType.CUSTOM_DATE,
          triggerConfig: JSON.stringify({ event: 'organization_suspended' }),
          actions: [
            {
              actionType: WorkflowActionType.SEND_EMAIL,
              actionConfig: JSON.stringify({
                template: 'organization_suspended',
                recipients: ['organization_admins'],
              }),
            },
          ],
          organisationId: data.organizationId,
        },
        'SYSTEM',
      );

      // Send suspension notification
      await this.sendSuspensionNotification(data);

      // Disable API access
      await this.suspendOrganization(
        data.organizationId,
        data.reason || 'Payment overdue',
        'SYSTEM',
      );

      // Send reactivation instructions
      await this.sendReactivationInstructions(data);

      this.logger.log(
        `Organization suspended workflow triggered for: ${data.organizationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to trigger organization suspended workflow: ${error.message}`,
      );
      throw error;
    }
  }

  // Trigger workflow when subscription is renewed
  async triggerSubscriptionRenewedWorkflow(
    data: WorkflowTriggerData,
  ): Promise<void> {
    try {
      await this.workflowsService.createWorkflowTemplate(
        {
          name: 'Subscription Renewed',
          description: 'Handle subscription renewal workflow',
          type: WorkflowType.DONATION_ACKNOWLEDGMENT,
          triggerType: WorkflowTriggerType.CUSTOM_DATE,
          triggerConfig: JSON.stringify({ event: 'subscription_renewed' }),
          actions: [
            {
              actionType: WorkflowActionType.SEND_EMAIL,
              actionConfig: JSON.stringify({
                template: 'subscription_renewed',
                recipients: ['organization_admins'],
              }),
            },
          ],
          organisationId: data.organizationId,
        },
        'SYSTEM',
      );

      await this.sendSubscriptionRenewedNotification(data);

      this.logger.log(
        `Subscription renewed workflow triggered for organization: ${data.organizationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to trigger subscription renewed workflow: ${error.message}`,
      );
      throw error;
    }
  }

  // Trigger workflow for overdue payments
  async triggerPaymentOverdueWorkflow(
    data: WorkflowTriggerData,
  ): Promise<void> {
    try {
      await this.workflowsService.createWorkflowTemplate(
        {
          name: 'Payment Overdue',
          description: 'Handle overdue payment workflow',
          type: WorkflowType.FOLLOW_UP,
          triggerType: WorkflowTriggerType.CUSTOM_DATE,
          triggerConfig: JSON.stringify({ event: 'payment_overdue' }),
          actions: [
            {
              actionType: WorkflowActionType.SEND_EMAIL,
              actionConfig: JSON.stringify({
                template: 'payment_overdue',
                recipients: ['organization_admins'],
              }),
            },
          ],
          organisationId: data.organizationId,
        },
        'SYSTEM',
      );

      await this.sendOverduePaymentNotification(data);

      this.logger.log(
        `Payment overdue workflow triggered for organization: ${data.organizationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to trigger payment overdue workflow: ${error.message}`,
      );
      throw error;
    }
  }

  // Private helper methods for sending notifications
  private async sendPaymentFailedNotification(
    data: WorkflowTriggerData,
  ): Promise<void> {
    const organization = await this.prisma.organisation.findUnique({
      where: { id: data.organizationId },
      include: {
        users: {
          where: {
            roles: {
              some: {
                name: { in: ['ADMIN', 'ADMIN'] },
              },
            },
          },
        },
      },
    });

    if (organization && organization.users.length > 0) {
      const recipients = organization.users.map((user) => ({ id: user.id, email: user.email }));

      await this.notificationsQueue.add('send', {
        channel: 'EMAIL',
        recipients,
        templateId: 'payment_failed_template_id',
        variables: {
          subject: 'Payment Failed - Action Required',
          organizationName: organization.name,
          amount: data.amount,
          subscriptionId: data.subscriptionId,
        },
        organisationId: data.organizationId,
      });
    }
  }

  private async sendSubscriptionExpiringNotification(
    data: WorkflowTriggerData,
  ): Promise<void> {
    const organization = await this.prisma.organisation.findUnique({
      where: { id: data.organizationId },
      include: {
        users: {
          where: {
            roles: {
              some: {
                name: { in: ['ADMIN', 'ADMIN'] },
              },
            },
          },
        },
      },
    });

    if (organization && organization.users.length > 0) {
      const recipients = organization.users.map((user) => ({ id: user.id, email: user.email }));

      await this.notificationsQueue.add('send', {
        channel: 'EMAIL',
        recipients,
        templateId: 'subscription_expiring_template_id',
        variables: {
          subject: 'Subscription Renewal Reminder',
          organizationName: organization.name,
          subscriptionId: data.subscriptionId,
        },
        organisationId: data.organizationId,
      });
    }
  }

  private async sendSuspensionNotification(
    data: WorkflowTriggerData,
  ): Promise<void> {
    const organization = await this.prisma.organisation.findUnique({
      where: { id: data.organizationId },
      include: {
        users: {
          where: {
            roles: {
              some: {
                name: { in: ['ADMIN', 'ADMIN'] },
              },
            },
          },
        },
      },
    });

    if (organization && organization.users.length > 0) {
      const recipients = organization.users.map((user) => ({ id: user.id, email: user.email }));

      await this.notificationsQueue.add('send', {
        channel: 'EMAIL',
        recipients,
        templateId: 'organization_suspended_template_id',
        variables: {
          subject: 'Organization Access Suspended',
          organizationName: organization.name,
          reason: data.reason,
        },
        organisationId: data.organizationId,
      });
    }
  }

  private async sendSubscriptionRenewedNotification(
    data: WorkflowTriggerData,
  ): Promise<void> {
    const organization = await this.prisma.organisation.findUnique({
      where: { id: data.organizationId },
      include: {
        users: {
          where: {
            roles: {
              some: {
                name: { in: ['ADMIN', 'ADMIN'] },
              },
            },
          },
        },
      },
    });

    if (organization && organization.users.length > 0) {
      const recipients = organization.users.map((user) => ({ id: user.id, email: user.email }));

      await this.notificationsQueue.add('send', {
        channel: 'EMAIL',
        recipients,
        templateId: 'subscription_renewed_template_id',
        variables: {
          subject: 'Subscription Renewed Successfully',
          organizationName: organization.name,
          subscriptionId: data.subscriptionId,
        },
        organisationId: data.organizationId,
      });
    }
  }

  // Schedule recurring workflows
  async scheduleRecurringWorkflows(): Promise<void> {
    try {
      // This would integrate with a job scheduler like Bull or Agenda
      // For now, we'll create a simple workflow template
      await this.workflowsService.createWorkflowTemplate(
        {
          name: 'Recurring Payment Checks',
          description: 'Check for overdue payments and expiring subscriptions',
          type: WorkflowType.FOLLOW_UP,
          triggerType: WorkflowTriggerType.CUSTOM_DATE,
          triggerConfig: JSON.stringify({ event: 'scheduled' }),
          actions: [
            {
              actionType: WorkflowActionType.CREATE_TASK,
              actionConfig: JSON.stringify({
                function: 'checkOverduePayments',
              }),
            },
          ],
          organisationId: 'SYSTEM',
        },
        'SYSTEM',
      );

      this.logger.log('Recurring workflows scheduled successfully');
    } catch (error) {
      this.logger.error(
        `Failed to schedule recurring workflows: ${error.message}`,
      );
    }
  }

  private async suspendOrganization(
    organizationId: string,
    reason: string,
    suspendedBy: string,
  ): Promise<void> {
    try {
      // Update organization status
      await this.prisma.organisation.update({
        where: { id: organizationId },
        data: {
          status: 'SUSPENDED',
          suspensionReason: reason,
          suspendedAt: new Date(),
          suspendedBy: suspendedBy,
        },
      });
    } catch (error) {
      console.error('Failed to suspend organization:', error);
    }
  }

  private async sendReactivationInstructions(
    data: WorkflowTriggerData,
  ): Promise<void> {
    const organization = await this.prisma.organisation.findUnique({
      where: { id: data.organizationId },
      include: {
        users: {
          where: {
            roles: {
              some: {
                name: { in: ['ADMIN', 'ADMIN'] },
              },
            },
          },
        },
      },
    });

    if (organization && organization.users.length > 0) {
      const recipients = organization.users.map((user) => ({ id: user.id, email: user.email }));

      await this.notificationsQueue.add('send', {
        channel: 'EMAIL',
        recipients,
        templateId: 'reactivation_instructions_template_id',
        variables: {
          subject: 'Account Reactivation Instructions',
          organizationName: organization.name,
          reason: data.reason,
        },
        organisationId: data.organizationId,
      });
    }
  }

  private async sendOverduePaymentNotification(
    data: WorkflowTriggerData,
  ): Promise<void> {
    const organization = await this.prisma.organisation.findUnique({
      where: { id: data.organizationId },
      include: {
        users: {
          where: {
            roles: {
              some: {
                name: { in: ['ADMIN', 'ADMIN'] },
              },
            },
          },
        },
      },
    });

    if (organization && organization.users.length > 0) {
      const recipients = organization.users.map((user) => ({ id: user.id, email: user.email }));

      // Determine notification urgency based on days overdue
      const daysOverdue = data.daysOverdue || 0;
      let subject = 'Payment Overdue Reminder';
      let template = 'payment_overdue_template_id';

      if (daysOverdue > 14) {
        subject = 'URGENT: Payment Overdue - Account Suspension Imminent';
        template = 'payment_overdue_urgent_template_id';
      } else if (daysOverdue > 7) {
        subject = 'Payment Overdue - Second Notice';
        template = 'payment_overdue_second_template_id';
      }

      await this.notificationsQueue.add('send', {
        channel: 'EMAIL',
        recipients,
        templateId: template,
        variables: {
          subject,
          organizationName: organization.name,
          daysOverdue,
          amount: data.amount,
        },
        organisationId: data.organizationId,
      });
    }
  }

  // Escalation workflow for severely overdue payments
  private async initiateSuspensionProcess(
    data: WorkflowTriggerData,
  ): Promise<void> {
    // Automatically suspend organization after 21 days overdue
    await this.suspendOrganization(
      data.organizationId,
      `Payment overdue for ${data.daysOverdue} days`,
      'SYSTEM',
    );

    // Trigger suspension workflow
    await this.triggerOrganizationSuspendedWorkflow({
      organizationId: data.organizationId,
      organizationName: data.organizationName,
      reason: `Payment overdue for ${data.daysOverdue} days`,
    });
  }

  // Method to check and trigger overdue payment workflows
  async checkOverduePayments(): Promise<void> {
    const overdueSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.PAST_DUE,
        currentPeriodEnd: {
          lt: new Date(),
        },
      },
      include: {
        organisation: true,
        plan: true,
      },
    });

    for (const subscription of overdueSubscriptions) {
      const daysOverdue = Math.floor(
        (Date.now() - subscription.currentPeriodEnd.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Trigger workflow for specific overdue milestones
      if ([3, 7, 14, 21].includes(daysOverdue)) {
        await this.triggerPaymentOverdueWorkflow({
          organizationId: subscription.organisationId,
          organizationName: subscription.organisation.name,
          subscriptionId: subscription.id,
          amount: subscription.plan.amount,
          daysOverdue,
        });
      }
    }
  }
}
