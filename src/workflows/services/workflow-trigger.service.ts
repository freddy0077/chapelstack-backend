import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowExecutionService } from './workflow-execution.service';

@Injectable()
export class WorkflowTriggerService {
  private readonly logger = new Logger(WorkflowTriggerService.name);

  constructor(
    private prisma: PrismaService,
    private workflowExecutionService: WorkflowExecutionService,
  ) {}

  // Run every 5 minutes to check for scheduled workflows
  @Cron('0 */5 * * * *')
  async checkScheduledWorkflows() {
    this.logger.log('Checking for scheduled workflows...');

    const now = new Date();
    const triggers = await this.prisma.workflowTrigger.findMany({
      where: {
        isActive: true,
      },
      include: {
        workflow: {
          include: {
            actions: true,
          },
        },
      },
    });

    for (const trigger of triggers) {
      if (!trigger.workflow || trigger.workflow.status !== 'ACTIVE') continue;

      try {
        await this.executeTrigger(trigger);
        await this.updateNextRunTime(trigger);
      } catch (error) {
        this.logger.error(`Failed to execute trigger ${trigger.id}:`, error);
      }
    }
  }

  // Check for member-related triggers
  async handleMemberCreated(
    memberId: string,
    organisationId: string,
    branchId?: string,
  ) {
    await this.handleTrigger('MEMBER_CREATED', {
      memberId,
      organisationId,
      branchId,
    });
  }

  async handleMemberUpdated(
    memberId: string,
    organisationId: string,
    branchId?: string,
    changes?: any,
  ) {
    await this.handleTrigger('MEMBER_UPDATED', {
      memberId,
      organisationId,
      branchId,
      changes,
    });
  }

  // Check for event-related triggers
  async handleEventCreated(
    eventId: string,
    organisationId: string,
    branchId?: string,
  ) {
    await this.handleTrigger('EVENT_CREATED', {
      eventId,
      organisationId,
      branchId,
    });
  }

  async handleEventApproaching(
    eventId: string,
    organisationId: string,
    branchId?: string,
  ) {
    await this.handleTrigger('EVENT_APPROACHING', {
      eventId,
      organisationId,
      branchId,
    });
  }

  // Check for donation-related triggers
  async handleDonationReceived(
    transactionId: string,
    organisationId: string,
    branchId?: string,
  ): Promise<void> {
    const data = {
      transactionId,
      organisationId,
      branchId,
    };

    await this.handleTrigger('DONATION_RECEIVED', data);
  }

  // Check for membership renewal triggers
  async handleMembershipExpiring(
    memberId: string,
    organisationId: string,
    branchId?: string,
    expiryDate?: Date,
  ) {
    await this.handleTrigger('MEMBERSHIP_EXPIRING', {
      memberId,
      organisationId,
      branchId,
      expiryDate,
    });
  }

  // Check for attendance-related triggers
  async handleAttendanceRecorded(
    attendanceId: string,
    memberId: string,
    organisationId: string,
    branchId?: string,
  ) {
    await this.handleTrigger('ATTENDANCE_RECORDED', {
      attendanceId,
      memberId,
      organisationId,
      branchId,
    });
  }

  // Run daily to check for membership renewals and event reminders
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkMembershipRenewals() {
    this.logger.log('Checking for membership renewals...');

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Find members whose membership is expiring
    const expiringMembers = await this.prisma.member.findMany({
      where: {
        membershipDate: {
          not: null,
        },
        status: 'ACTIVE',
        // This would need to be adjusted based on your membership duration logic
        // For now, assuming 1-year memberships
      },
    });

    for (const member of expiringMembers) {
      if (member.membershipDate) {
        const membershipExpiry = new Date(member.membershipDate);
        membershipExpiry.setFullYear(membershipExpiry.getFullYear() + 1);

        if (membershipExpiry <= thirtyDaysFromNow) {
          await this.handleMembershipExpiring(
            member.id,
            member.organisationId!,
            member.branchId!,
            membershipExpiry,
          );
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async checkUpcomingEvents() {
    this.logger.log('Checking for upcoming events...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const upcomingEvents = await this.prisma.event.findMany({
      where: {
        startDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
      },
    });

    for (const event of upcomingEvents) {
      await this.handleEventApproaching(
        event.id,
        event.organisationId!,
        event.branchId!,
      );
    }
  }

  private async handleTrigger(triggerType: string, data: any) {
    const workflows = await this.prisma.workflowTemplate.findMany({
      where: {
        status: 'ACTIVE',
        triggerType: triggerType as any,
        organisationId: data.organisationId,
        ...(data.branchId && { branchId: data.branchId }),
      },
      include: {
        actions: true,
      },
    });

    for (const workflow of workflows) {
      try {
        // Check if trigger conditions are met
        if (await this.evaluateTriggerConditions(workflow, data)) {
          await this.workflowExecutionService.triggerWorkflow({
            workflowId: workflow.id,
            targetMemberId: data.memberId,
            targetEventId: data.eventId,
            triggerData: JSON.stringify(data),
          });

          this.logger.log(
            `Triggered workflow ${workflow.id} for ${triggerType}`,
          );
        }
      } catch (error) {
        this.logger.error(`Failed to trigger workflow ${workflow.id}:`, error);
      }
    }
  }

  private async evaluateTriggerConditions(
    workflow: any,
    data: any,
  ): Promise<boolean> {
    if (!workflow.triggerConfig) return true;

    const config = workflow.triggerConfig;

    // Example condition evaluations based on trigger type
    switch (workflow.triggerType) {
      case 'MEMBER_CREATED':
        // Check if member matches criteria (e.g., age, location, etc.)
        if (config.memberCriteria) {
          const member = await this.prisma.member.findUnique({
            where: { id: data.memberId },
          });

          if (!member) return false;

          // Example: Check age range
          if (config.memberCriteria.ageRange) {
            const age = member.dateOfBirth
              ? new Date().getFullYear() -
                new Date(member.dateOfBirth).getFullYear()
              : null;

            if (
              age &&
              (age < config.memberCriteria.ageRange.min ||
                age > config.memberCriteria.ageRange.max)
            ) {
              return false;
            }
          }

          // Example: Check membership status
          if (
            config.memberCriteria.status &&
            member.status !== config.memberCriteria.status
          ) {
            return false;
          }
        }
        break;

      case 'DONATION_RECEIVED':
        // Check donation amount thresholds
        if (config.minAmount || config.maxAmount) {
          const transaction = await this.prisma.transaction.findUnique({
            where: { id: data.transactionId },
          });

          if (!transaction) return false;

          if (config.minAmount && transaction.amount < config.minAmount)
            return false;
          if (config.maxAmount && transaction.amount > config.maxAmount)
            return false;
        }
        break;

      case 'EVENT_APPROACHING':
        // Check event type or category
        if (config.eventTypes) {
          const event = await this.prisma.event.findUnique({
            where: { id: data.eventId },
          });

          if (!event || !config.eventTypes.includes(event.category)) {
            return false;
          }
        }
        break;

      default:
        return true;
    }

    return true;
  }

  private async executeTrigger(trigger: any) {
    const triggerConfig = trigger.triggerConfig || {};

    await this.workflowExecutionService.triggerWorkflow({
      workflowId: trigger.workflowId,
      triggerData: JSON.stringify(triggerConfig),
    });

    // Update last triggered time
    await this.prisma.workflowTrigger.update({
      where: { id: trigger.id },
      data: { lastTriggeredAt: new Date() },
    });
  }

  private async updateNextRunTime(trigger: any) {
    if (!trigger.cronExpression) return;

    // Simple cron parsing - in production, use a proper cron library
    const now = new Date();
    let nextRun = new Date(now);

    // Basic daily cron support
    if (trigger.cronExpression === '0 0 * * *') {
      nextRun.setDate(nextRun.getDate() + 1);
      nextRun.setHours(0, 0, 0, 0);
    } else if (trigger.cronExpression === '0 */5 * * * *') {
      nextRun.setMinutes(nextRun.getMinutes() + 5);
    } else {
      // Default to daily
      nextRun.setDate(nextRun.getDate() + 1);
    }

    await this.prisma.workflowTrigger.update({
      where: { id: trigger.id },
      data: { nextRunAt: nextRun },
    });
  }

  // Utility method to create a new trigger
  async createTrigger(
    workflowId: string,
    triggerType: string,
    triggerConfig: any,
    cronExpression?: string,
    organisationId?: string,
    branchId?: string,
  ) {
    const nextRunAt = cronExpression
      ? this.calculateNextRun(cronExpression)
      : null;

    return this.prisma.workflowTrigger.create({
      data: {
        workflowId,
        triggerType: triggerType as any,
        triggerConfig,
        cronExpression,
        nextRunAt,
        organisationId: organisationId!,
        branchId,
      },
    });
  }

  private calculateNextRun(cronExpression: string): Date {
    const now = new Date();
    let nextRun = new Date(now);

    // Basic cron parsing
    if (cronExpression === '0 0 * * *') {
      nextRun.setDate(nextRun.getDate() + 1);
      nextRun.setHours(0, 0, 0, 0);
    } else if (cronExpression === '0 */5 * * * *') {
      nextRun.setMinutes(nextRun.getMinutes() + 5);
    } else {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun;
  }
}
