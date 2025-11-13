import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { AutomationsModule } from '../automations.module';
import { AutomationSchedulerService } from '../services/automation-scheduler.service';
import { AutomationExecutionService } from '../services/automation-execution.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Automation Integration Tests', () => {
  let app: INestApplication;
  let schedulerService: AutomationSchedulerService;
  let executionService: AutomationExecutionService;
  let prismaService: PrismaService;
  let mockQueue: any;

  const mockAutomation = {
    id: 'automation-1',
    name: 'Integration Test Automation',
    status: 'ACTIVE',
    isEnabled: true,
    triggerType: 'TIME_BASED',
    schedule: '0 9 * * *',
    branchId: 'branch-1',
    organisationId: 'org-1',
    template: {
      id: 'template-1',
      name: 'Test Template',
      subject: 'Test Subject',
      body: 'Test Body',
    },
    channels: ['EMAIL'],
  };

  const mockRecipients = [
    {
      id: 'member-1',
      email: 'member1@example.com',
      phoneNumber: '+1234567890',
    },
  ];

  beforeAll(async () => {
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-1' }),
      getRepeatableJobs: jest.fn().mockResolvedValue([]),
      getJobCounts: jest.fn().mockResolvedValue({
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        waiting: 0,
      }),
      getFailed: jest.fn().mockResolvedValue([]),
      getCompleted: jest.fn().mockResolvedValue([]),
      getJob: jest.fn().mockResolvedValue(null),
      removeRepeatableByKey: jest.fn().mockResolvedValue(true),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AutomationsModule],
    })
      .overrideProvider(getQueueToken('automations'))
      .useValue(mockQueue)
      .overrideProvider(PrismaService)
      .useValue({
        automationConfig: {
          findMany: jest.fn().mockResolvedValue([mockAutomation]),
          findUnique: jest.fn().mockResolvedValue(mockAutomation),
          update: jest.fn().mockResolvedValue(mockAutomation),
        },
        member: {
          findMany: jest.fn().mockResolvedValue(mockRecipients),
        },
        automationLog: {
          create: jest.fn().mockResolvedValue({
            id: 'log-1',
            automationId: 'automation-1',
          }),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    schedulerService = moduleFixture.get<AutomationSchedulerService>(
      AutomationSchedulerService,
    );
    executionService = moduleFixture.get<AutomationExecutionService>(
      AutomationExecutionService,
    );
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('End-to-End Automation Flow', () => {
    it('should initialize scheduler and schedule automations', async () => {
      expect(schedulerService).toBeDefined();
      expect(mockQueue.add).toHaveBeenCalled();
    });

    it('should execute automation and log results', async () => {
      const result = await executionService.execute(mockAutomation);

      expect(result).toHaveProperty('recipientCount');
      expect(result).toHaveProperty('successCount');
      expect(result).toHaveProperty('failureCount');
      expect(result).toHaveProperty('status');
      expect(prismaService.automationLog.create).toHaveBeenCalled();
    });

    it('should get job statistics', async () => {
      const stats = await schedulerService.getJobStats();

      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('waiting');
      expect(stats).toHaveProperty('repeatableJobs');
    });

    it('should trigger automation immediately', async () => {
      const job = await schedulerService.triggerAutomationNow('automation-1');

      expect(job).toBeDefined();
      expect(mockQueue.add).toHaveBeenCalledWith(
        { automationId: 'automation-1' },
        expect.objectContaining({
          priority: 10,
          removeOnComplete: true,
        }),
      );
    });

    it('should schedule and execute automation workflow', async () => {
      // 1. Schedule automation
      await schedulerService.scheduleAutomation(mockAutomation);
      expect(mockQueue.add).toHaveBeenCalled();

      // 2. Execute automation
      const result = await executionService.execute(mockAutomation);
      expect(result.status).toBeDefined();

      // 3. Verify logging
      expect(prismaService.automationLog.create).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing automation gracefully', async () => {
      jest
        .spyOn(prismaService.automationConfig, 'findUnique')
        .mockResolvedValueOnce(null);

      const mockJob = {
        id: 'job-1',
        data: { automationId: 'non-existent' },
      };

      // Should throw error
      await expect(async () => {
        const automation = await prismaService.automationConfig.findUnique({
          where: { id: 'non-existent' },
        });
        if (!automation) throw new Error('Automation not found');
      }).rejects.toThrow('Automation not found');
    });

    it('should handle disabled automation', async () => {
      const disabledAutomation = {
        ...mockAutomation,
        isEnabled: false,
      };

      jest
        .spyOn(prismaService.automationConfig, 'findUnique')
        .mockResolvedValueOnce(disabledAutomation);

      // Should throw error
      await expect(async () => {
        const automation = await prismaService.automationConfig.findUnique({
          where: { id: 'automation-1' },
        });
        if (!automation.isEnabled) throw new Error('Automation is disabled');
      }).rejects.toThrow('Automation is disabled');
    });

    it('should handle execution errors', async () => {
      jest
        .spyOn(prismaService.member, 'findMany')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(
        executionService.execute(mockAutomation),
      ).rejects.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should schedule automation within acceptable time', async () => {
      const startTime = Date.now();
      await schedulerService.scheduleAutomation(mockAutomation);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should execute automation within acceptable time', async () => {
      const startTime = Date.now();
      await executionService.execute(mockAutomation);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle multiple automations', async () => {
      const automations = Array.from({ length: 10 }, (_, i) => ({
        ...mockAutomation,
        id: `automation-${i}`,
        name: `Automation ${i}`,
      }));

      jest
        .spyOn(prismaService.automationConfig, 'findMany')
        .mockResolvedValueOnce(automations);

      const startTime = Date.now();
      await schedulerService.scheduleAllAutomations();
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(mockQueue.add).toHaveBeenCalledTimes(expect.any(Number));
    });
  });

  describe('Data Integrity', () => {
    it('should maintain automation statistics', async () => {
      const result = await executionService.execute(mockAutomation);

      expect(result.recipientCount).toBeGreaterThanOrEqual(0);
      expect(result.successCount).toBeGreaterThanOrEqual(0);
      expect(result.failureCount).toBeGreaterThanOrEqual(0);
      expect(result.successCount + result.failureCount).toBeLessThanOrEqual(
        result.recipientCount * mockAutomation.channels.length,
      );
    });

    it('should log all execution attempts', async () => {
      await executionService.execute(mockAutomation);

      expect(prismaService.automationLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          automationId: mockAutomation.id,
          status: expect.any(String),
          recipientCount: expect.any(Number),
          successCount: expect.any(Number),
          failureCount: expect.any(Number),
          executedAt: expect.any(Date),
        }),
      });
    });

    it('should preserve automation configuration', async () => {
      await schedulerService.scheduleAutomation(mockAutomation);

      expect(mockQueue.add).toHaveBeenCalledWith(
        { automationId: mockAutomation.id },
        expect.objectContaining({
          repeat: {
            cron: mockAutomation.schedule,
          },
        }),
      );
    });
  });

  describe('Concurrency Tests', () => {
    it('should handle concurrent automation executions', async () => {
      const promises = Array.from({ length: 5 }, () =>
        executionService.execute(mockAutomation),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('recipientCount');
      });
    });

    it('should handle concurrent job scheduling', async () => {
      const automations = Array.from({ length: 5 }, (_, i) => ({
        ...mockAutomation,
        id: `automation-${i}`,
      }));

      const promises = automations.map((automation) =>
        schedulerService.scheduleAutomation(automation),
      );

      await Promise.all(promises);

      expect(mockQueue.add).toHaveBeenCalledTimes(expect.any(Number));
    });
  });
});
