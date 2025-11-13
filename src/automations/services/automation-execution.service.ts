import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AutomationExecutionService {
  private readonly logger = new Logger(AutomationExecutionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Execute an automation
   * Sends messages to recipients through configured channels
   */
  async execute(automation: any) {
    this.logger.log(`Executing automation: ${automation.name}`);

    try {
      // 1. Validate automation
      if (!automation.template) {
        throw new Error('No template assigned to automation');
      }

      if (!automation.channels || automation.channels.length === 0) {
        throw new Error('No channels configured for automation');
      }

      // 2. Get recipients
      const recipients = await this.getRecipients(automation);
      if (recipients.length === 0) {
        this.logger.warn(`No recipients found for automation: ${automation.id}`);
      }

      // 3. Send messages
      const result = await this.sendMessages(automation, recipients);

      // 4. Log execution
      await this.logExecution(automation, result);

      return result;
    } catch (error) {
      this.logger.error(`Automation execution failed: ${error.message}`);
      await this.logExecutionError(automation, error);
      throw error;
    }
  }

  /**
   * Get recipients for automation based on branch
   */
  private async getRecipients(automation: any) {
    // Get members from automation's branch
    return this.prisma.member.findMany({
      where: {
        branchId: automation.branchId,
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
      },
    });
  }

  /**
   * Send messages through configured channels
   */
  private async sendMessages(automation: any, recipients: any[]) {
    let successCount = 0;
    let failureCount = 0;

    for (const recipient of recipients) {
      for (const channel of automation.channels) {
        try {
          // Send through channel
          await this.sendViaChannel(channel, automation, recipient);
          successCount++;
        } catch (error) {
          this.logger.error(
            `Failed to send via ${channel} to ${recipient.id}:`,
            error,
          );
          failureCount++;
        }
      }
    }

    const totalAttempts = recipients.length * automation.channels.length;
    const status =
      failureCount === 0
        ? 'SUCCESS'
        : failureCount === totalAttempts
        ? 'FAILED'
        : 'PARTIAL';

    return {
      recipientCount: recipients.length,
      successCount,
      failureCount,
      status,
    };
  }

  /**
   * Send message via specific channel
   * TODO: Implement actual sending logic for each channel
   */
  private async sendViaChannel(
    channel: string,
    automation: any,
    recipient: any,
  ) {
    this.logger.log(
      `Sending ${channel} to ${recipient.id} via automation ${automation.id}`,
    );

    // TODO: Implement channel-specific sending logic
    // Examples:
    // - EMAIL: Use email service
    // - SMS: Use SMS service
    // - PUSH: Use push notification service
    // - WHATSAPP: Use WhatsApp service

    // For now, just log it
    // In production, call actual sending services
  }

  /**
   * Log successful execution
   */
  private async logExecution(automation: any, result: any) {
    await this.prisma.automationLog.create({
      data: {
        automationId: automation.id,
        status: result.status,
        recipientCount: result.recipientCount,
        successCount: result.successCount,
        failedCount: result.failureCount,
        executedAt: new Date(),
        metadata: result,
      },
    });
  }

  /**
   * Log execution error
   */
  private async logExecutionError(automation: any, error: Error) {
    await this.prisma.automationLog.create({
      data: {
        automationId: automation.id,
        status: 'FAILED',
        recipientCount: 0,
        successCount: 0,
        failedCount: 0,
        errorMessage: error.message,
        executedAt: new Date(),
      },
    });
  }
}
