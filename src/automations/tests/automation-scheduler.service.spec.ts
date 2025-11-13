import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { AutomationSchedulerService } from '../services/automation-scheduler.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AutomationSchedulerService', () => {
  let service: AutomationSchedulerService;
  let prismaService: PrismaService;
  let mockQueue: any;

  const mockAutomation = {
    id: 'automation-1',
    name: 'Test Automation',
    status: 'ACTIVE',
    isEnabled: true,
    triggerType: 'TIME_BASED',
    schedule: '0 9 * * *',
    branchId: 'branch-1',
  };

  const mockJob = {
    id: 'job-1',
    data: { automationId: 'automation-1' },
    retry: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn().mockResolvedValue(mockJob),
      getRepeatableJobs: jest.fn().mockResolvedValue([]),
      getJobCounts: jest.fn().mockResolvedValue({
        active: 0,
        completed: 5,
        failed: 0,
        delayed: 0,
        waiting: 2,
      }),
      getFailed: jest.fn().mockResolvedValue([]),
      getCompleted: jest.fn().mockResolvedValue([]),
      getJob: jest.fn().mockResolvedValue(mockJob),
      removeRepeatableByKey: jest.fn().mockResolvedValue(true),
      clean: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationSchedulerService,
        {
          provide: getQueueToken('automations'),
          useValue: mockQueue,
        },
        {
          provide: PrismaService,
          useValue: {
            automationConfig: {
              findMany: jest.fn().mockResolvedValue([mockAutomation]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AutomationSchedulerService>(AutomationSchedulerService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should initialize and schedule all automations', async () => {
      await service.onModuleInit();

      expect(prismaService.automationConfig.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          isEnabled: true,
          triggerType: 'TIME_BASED',
          schedule: { not: null },
        },
      });
    });
  });

  describe('scheduleAllAutomations', () => {
    it('should schedule all active automations', async () => {
      await service.scheduleAllAutomations();

      expect(prismaService.automationConfig.findMany).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalledWith(
        { automationId: mockAutomation.id },
        expect.objectContaining({
          repeat: {
            cron: mockAutomation.schedule,
          },
        }),
      );
    });

    it('should handle errors gracefully', async () => {
      jest
        .spyOn(prismaService.automationConfig, 'findMany')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(service.scheduleAllAutomations()).resolves.not.toThrow();
    });
  });

  describe('scheduleAutomation', () => {
    it('should schedule a single automation', async () => {
      await service.scheduleAutomation(mockAutomation);

      expect(mockQueue.add).toHaveBeenCalledWith(
        { automationId: mockAutomation.id },
        expect.objectContaining({
          repeat: {
            cron: mockAutomation.schedule,
          },
          jobId: `automation-${mockAutomation.id}`,
        }),
      );
    });

    it('should remove existing job before scheduling', async () => {
      mockQueue.getRepeatableJobs.mockResolvedValueOnce([
        {
          key: `automation-${mockAutomation.id}:1`,
        },
      ]);

      await service.scheduleAutomation(mockAutomation);

      expect(mockQueue.removeRepeatableByKey).toHaveBeenCalled();
    });

    it('should handle scheduling errors', async () => {
      mockQueue.add.mockRejectedValueOnce(new Error('Queue error'));

      await expect(
        service.scheduleAutomation(mockAutomation),
      ).resolves.not.toThrow();
    });
  });

  describe('unscheduleAutomation', () => {
    it('should remove automation from schedule', async () => {
      mockQueue.getRepeatableJobs.mockResolvedValueOnce([
        {
          key: `automation-${mockAutomation.id}:1`,
        },
      ]);

      await service.unscheduleAutomation(mockAutomation.id);

      expect(mockQueue.removeRepeatableByKey).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockQueue.getRepeatableJobs.mockRejectedValueOnce(
        new Error('Queue error'),
      );

      await expect(
        service.unscheduleAutomation(mockAutomation.id),
      ).resolves.not.toThrow();
    });
  });

  describe('triggerAutomationNow', () => {
    it('should trigger automation immediately', async () => {
      const result = await service.triggerAutomationNow(mockAutomation.id);

      expect(mockQueue.add).toHaveBeenCalledWith(
        { automationId: mockAutomation.id },
        expect.objectContaining({
          priority: 10,
          removeOnComplete: true,
        }),
      );
      expect(result).toEqual(mockJob);
    });

    it('should throw error if trigger fails', async () => {
      mockQueue.add.mockRejectedValueOnce(new Error('Queue error'));

      await expect(
        service.triggerAutomationNow(mockAutomation.id),
      ).rejects.toThrow('Queue error');
    });
  });

  describe('getJobStats', () => {
    it('should return job statistics', async () => {
      const stats = await service.getJobStats();

      expect(stats).toEqual({
        active: 0,
        completed: 5,
        failed: 0,
        delayed: 0,
        waiting: 2,
        repeatableJobs: 0,
      });
    });

    it('should include repeatable jobs count', async () => {
      mockQueue.getRepeatableJobs.mockResolvedValueOnce([
        { key: 'job-1' },
        { key: 'job-2' },
      ]);

      const stats = await service.getJobStats();

      expect(stats.repeatableJobs).toBe(2);
    });

    it('should throw error if stats retrieval fails', async () => {
      mockQueue.getJobCounts.mockRejectedValueOnce(new Error('Queue error'));

      await expect(service.getJobStats()).rejects.toThrow('Queue error');
    });
  });

  describe('getFailedJobs', () => {
    it('should return failed jobs', async () => {
      const failedJob = { id: 'failed-1', failedReason: 'Error message' };
      mockQueue.getFailed.mockResolvedValueOnce([failedJob]);

      const result = await service.getFailedJobs(10);

      expect(mockQueue.getFailed).toHaveBeenCalledWith(0, 10);
      expect(result).toEqual([failedJob]);
    });

    it('should use default limit of 10', async () => {
      await service.getFailedJobs();

      expect(mockQueue.getFailed).toHaveBeenCalledWith(0, 10);
    });

    it('should throw error if retrieval fails', async () => {
      mockQueue.getFailed.mockRejectedValueOnce(new Error('Queue error'));

      await expect(service.getFailedJobs()).rejects.toThrow('Queue error');
    });
  });

  describe('getCompletedJobs', () => {
    it('should return completed jobs', async () => {
      const completedJob = { id: 'completed-1', returnValue: 'Success' };
      mockQueue.getCompleted.mockResolvedValueOnce([completedJob]);

      const result = await service.getCompletedJobs(10);

      expect(mockQueue.getCompleted).toHaveBeenCalledWith(0, 10);
      expect(result).toEqual([completedJob]);
    });

    it('should use default limit of 10', async () => {
      await service.getCompletedJobs();

      expect(mockQueue.getCompleted).toHaveBeenCalledWith(0, 10);
    });
  });

  describe('retryFailedJob', () => {
    it('should retry a failed job', async () => {
      await service.retryFailedJob('job-1');

      expect(mockQueue.getJob).toHaveBeenCalledWith('job-1');
      expect(mockJob.retry).toHaveBeenCalled();
    });

    it('should throw error if job not found', async () => {
      mockQueue.getJob.mockResolvedValueOnce(null);

      await expect(service.retryFailedJob('job-1')).rejects.toThrow(
        'Job not found: job-1',
      );
    });

    it('should throw error if retry fails', async () => {
      mockJob.retry.mockRejectedValueOnce(new Error('Retry error'));

      await expect(service.retryFailedJob('job-1')).rejects.toThrow(
        'Failed to retry job',
      );
    });
  });

  describe('removeJob', () => {
    it('should remove a job', async () => {
      await service.removeJob('job-1');

      expect(mockQueue.getJob).toHaveBeenCalledWith('job-1');
      expect(mockJob.remove).toHaveBeenCalled();
    });

    it('should throw error if job not found', async () => {
      mockQueue.getJob.mockResolvedValueOnce(null);

      await expect(service.removeJob('job-1')).rejects.toThrow(
        'Job not found: job-1',
      );
    });
  });

  describe('clearAllJobs', () => {
    it('should clear all completed and failed jobs', async () => {
      await service.clearAllJobs();

      expect(mockQueue.clean).toHaveBeenCalledWith(0, 'completed');
      expect(mockQueue.clean).toHaveBeenCalledWith(0, 'failed');
    });

    it('should throw error if clearing fails', async () => {
      mockQueue.clean.mockRejectedValueOnce(new Error('Clean error'));

      await expect(service.clearAllJobs()).rejects.toThrow('Clean error');
    });
  });
});
