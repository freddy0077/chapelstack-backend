import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AutomationSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(AutomationSchedulerService.name);

  constructor(
    @InjectQueue('automations') private automationQueue: Queue,
    private prisma: PrismaService,
  ) {}

  /**
   * Initialize scheduler on module load
   * Schedule all active automations
   */
  async onModuleInit() {
    this.logger.log('Initializing automation scheduler...');
    await this.scheduleAllAutomations();
  }

  /**
   * Schedule all active automations
   */
  async scheduleAllAutomations() {
    try {
      const automations = await this.prisma.automationConfig.findMany({
        where: {
          status: 'ACTIVE',
          isEnabled: true,
          triggerType: 'TIME_BASED',
          schedule: { not: null },
        },
      });

      this.logger.log(`Found ${automations.length} automations to schedule`);

      for (const automation of automations) {
        await this.scheduleAutomation(automation);
      }
    } catch (error) {
      this.logger.error('Failed to schedule automations:', error);
    }
  }

  /**
   * Schedule a single automation with cron pattern
   */
  async scheduleAutomation(automation: any) {
    try {
      // Remove existing recurring job if any
      const existingJobs = await this.automationQueue.getRepeatableJobs();
      for (const job of existingJobs) {
        if (job.key.includes(automation.id)) {
          await this.automationQueue.removeRepeatableByKey(job.key);
          this.logger.log(`Removed existing job for automation: ${automation.id}`);
        }
      }

      // Add recurring job with cron pattern
      await this.automationQueue.add(
        { automationId: automation.id },
        {
          repeat: {
            cron: automation.schedule, // e.g., '0 9 * * *' for 9 AM daily
          },
          jobId: `automation-${automation.id}`,
          removeOnComplete: {
            age: 3600, // Keep completed jobs for 1 hour
          },
          removeOnFail: false, // Keep failed jobs for debugging
        },
      );

      this.logger.log(
        `Scheduled automation: ${automation.name} (${automation.schedule})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to schedule automation ${automation.id}:`,
        error,
      );
    }
  }

  /**
   * Unschedule an automation
   */
  async unscheduleAutomation(automationId: string) {
    try {
      const existingJobs = await this.automationQueue.getRepeatableJobs();
      for (const job of existingJobs) {
        if (job.key.includes(automationId)) {
          await this.automationQueue.removeRepeatableByKey(job.key);
          this.logger.log(`Unscheduled automation: ${automationId}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to unschedule automation: ${error.message}`);
    }
  }

  /**
   * Manually trigger an automation immediately
   */
  async triggerAutomationNow(automationId: string) {
    try {
      const job = await this.automationQueue.add(
        { automationId },
        {
          priority: 10, // High priority
          removeOnComplete: true,
        },
      );

      this.logger.log(`Triggered automation immediately: ${automationId}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to trigger automation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get job statistics
   */
  async getJobStats() {
    try {
      const counts = await this.automationQueue.getJobCounts();
      const repeatableJobs = await this.automationQueue.getRepeatableJobs();

      return {
        active: counts.active,
        completed: counts.completed,
        failed: counts.failed,
        delayed: counts.delayed,
        waiting: counts.waiting,
        repeatableJobs: repeatableJobs.length,
      };
    } catch (error) {
      this.logger.error(`Failed to get job stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get failed jobs for debugging
   */
  async getFailedJobs(limit: number = 10) {
    try {
      return await this.automationQueue.getFailed(0, limit);
    } catch (error) {
      this.logger.error(`Failed to get failed jobs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get completed jobs
   */
  async getCompletedJobs(limit: number = 10) {
    try {
      return await this.automationQueue.getCompleted(0, limit);
    } catch (error) {
      this.logger.error(`Failed to get completed jobs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retry a failed job
   */
  async retryFailedJob(jobId: string) {
    try {
      const job = await this.automationQueue.getJob(jobId);
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      await job.retry();
      this.logger.log(`Retried job: ${jobId}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to retry job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove a job
   */
  async removeJob(jobId: string) {
    try {
      const job = await this.automationQueue.getJob(jobId);
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      await job.remove();
      this.logger.log(`Removed job: ${jobId}`);
    } catch (error) {
      this.logger.error(`Failed to remove job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear all jobs
   */
  async clearAllJobs() {
    try {
      await this.automationQueue.clean(0, 'completed');
      await this.automationQueue.clean(0, 'failed');
      this.logger.log('Cleared all jobs');
    } catch (error) {
      this.logger.error(`Failed to clear jobs: ${error.message}`);
      throw error;
    }
  }
}
