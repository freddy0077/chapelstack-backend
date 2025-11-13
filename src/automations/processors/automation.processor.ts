import { Processor, Process, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { AutomationExecutionService } from '../services/automation-execution.service';

@Processor('automations')
export class AutomationProcessor {
  private readonly logger = new Logger(AutomationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private executionService: AutomationExecutionService,
  ) {}

  @Process()
  async executeAutomation(job: Job<{ automationId: string }>) {
    this.logger.log(`Processing automation job: ${job.id}`);

    const { automationId } = job.data;

    try {
      // Get automation config
      const automation = await this.prisma.automationConfig.findUnique({
        where: { id: automationId },
        include: { template: true },
      });

      if (!automation) {
        throw new Error(`Automation not found: ${automationId}`);
      }

      if (!automation.isEnabled) {
        throw new Error(`Automation is disabled: ${automationId}`);
      }

      // Execute automation
      const result = await this.executionService.execute(automation);

      // Update automation stats
      await this.prisma.automationConfig.update({
        where: { id: automationId },
        data: {
          lastRun: new Date(),
          totalRuns: { increment: 1 },
          successCount: { increment: result.successCount },
          failureCount: { increment: result.failureCount },
        },
      });

      this.logger.log(`Automation executed successfully: ${automationId}`);
      return result;
    } catch (error) {
      this.logger.error(`Automation execution failed: ${error.message}`);
      throw error; // Bull will retry
    }
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed with result:`, result);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed:`, error.message);
  }
}
