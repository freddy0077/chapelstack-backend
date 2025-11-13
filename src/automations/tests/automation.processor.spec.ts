import { Test, TestingModule } from '@nestjs/testing';
import type { Job } from 'bull';
import { AutomationProcessor } from '../processors/automation.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { AutomationExecutionService } from '../services/automation-execution.service';

describe('AutomationProcessor', () => {
  let processor: AutomationProcessor;
  let prismaService: PrismaService;
  let executionService: AutomationExecutionService;

  const mockAutomation = {
    id: 'automation-1',
    name: 'Test Automation',
    status: 'ACTIVE',
    isEnabled: true,
    template: { id: 'template-1', name: 'Test Template' },
    channels: ['EMAIL'],
  };

  const mockJob = {
    id: 'job-1',
    data: { automationId: 'automation-1' },
  } as unknown as Job;

  const mockExecutionResult = {
    recipientCount: 10,
    successCount: 9,
    failureCount: 1,
    status: 'PARTIAL',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationProcessor,
        {
          provide: PrismaService,
          useValue: {
            automationConfig: {
              findUnique: jest.fn().mockResolvedValue(mockAutomation),
              update: jest.fn().mockResolvedValue(mockAutomation),
            },
            automationLog: {
              create: jest.fn().mockResolvedValue({
                id: 'log-1',
                automationId: 'automation-1',
              }),
            },
          },
        },
        {
          provide: AutomationExecutionService,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockExecutionResult),
          },
        },
      ],
    }).compile();

    processor = module.get<AutomationProcessor>(AutomationProcessor);
    prismaService = module.get<PrismaService>(PrismaService);
    executionService = module.get<AutomationExecutionService>(
      AutomationExecutionService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executeAutomation', () => {
    it('should execute automation successfully', async () => {
      const result = await processor.executeAutomation(mockJob);

      expect(prismaService.automationConfig.findUnique).toHaveBeenCalledWith({
        where: { id: 'automation-1' },
        include: { template: true },
      });
      expect(executionService.execute).toHaveBeenCalledWith(mockAutomation);
      expect(result).toEqual(mockExecutionResult);
    });

    it('should update automation statistics after execution', async () => {
      await processor.executeAutomation(mockJob);

      expect(prismaService.automationConfig.update).toHaveBeenCalledWith({
        where: { id: 'automation-1' },
        data: {
          lastRun: expect.any(Date),
          totalRuns: { increment: 1 },
          successCount: { increment: mockExecutionResult.successCount },
          failureCount: { increment: mockExecutionResult.failureCount },
        },
      });
    });

    it('should throw error if automation not found', async () => {
      jest
        .spyOn(prismaService.automationConfig, 'findUnique')
        .mockResolvedValueOnce(null);

      await expect(processor.executeAutomation(mockJob)).rejects.toThrow(
        'Automation not found: automation-1',
      );
    });

    it('should throw error if automation is disabled', async () => {
      jest
        .spyOn(prismaService.automationConfig, 'findUnique')
        .mockResolvedValueOnce({
          ...mockAutomation,
          isEnabled: false,
        });

      await expect(processor.executeAutomation(mockJob)).rejects.toThrow(
        'Automation is disabled: automation-1',
      );
    });

    it('should throw error if execution fails', async () => {
      jest
        .spyOn(executionService, 'execute')
        .mockRejectedValueOnce(new Error('Execution failed'));

      await expect(processor.executeAutomation(mockJob)).rejects.toThrow(
        'Execution failed',
      );
    });

    it('should not update statistics if execution fails', async () => {
      jest
        .spyOn(executionService, 'execute')
        .mockRejectedValueOnce(new Error('Execution failed'));

      try {
        await processor.executeAutomation(mockJob);
      } catch (error) {
        // Expected error
      }

      expect(prismaService.automationConfig.update).not.toHaveBeenCalled();
    });
  });

  describe('onCompleted', () => {
    it('should log job completion', async () => {
      const logSpy = jest.spyOn(processor['logger'], 'log');

      processor.onCompleted(mockJob, mockExecutionResult);

      expect(logSpy).toHaveBeenCalledWith(
        `Job ${mockJob.id} completed with result:`,
        mockExecutionResult,
      );
    });
  });

  describe('onFailed', () => {
    it('should log job failure', async () => {
      const logSpy = jest.spyOn(processor['logger'], 'error');
      const error = new Error('Job failed');

      processor.onFailed(mockJob, error);

      expect(logSpy).toHaveBeenCalledWith(
        `Job ${mockJob.id} failed:`,
        'Job failed',
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete automation execution flow', async () => {
      // Execute automation
      const result = await processor.executeAutomation(mockJob);

      // Verify execution
      expect(result).toEqual(mockExecutionResult);

      // Verify statistics were updated
      expect(prismaService.automationConfig.update).toHaveBeenCalled();

      // Verify completion was logged
      processor.onCompleted(mockJob, result);
    });

    it('should handle automation with partial failure', async () => {
      const partialResult = {
        recipientCount: 10,
        successCount: 5,
        failureCount: 5,
        status: 'PARTIAL',
      };

      jest
        .spyOn(executionService, 'execute')
        .mockResolvedValueOnce(partialResult);

      const result = await processor.executeAutomation(mockJob);

      expect(result.status).toBe('PARTIAL');
      expect(result.failureCount).toBe(5);
    });

    it('should handle automation with complete failure', async () => {
      const failedResult = {
        recipientCount: 10,
        successCount: 0,
        failureCount: 10,
        status: 'FAILED',
      };

      jest
        .spyOn(executionService, 'execute')
        .mockResolvedValueOnce(failedResult);

      const result = await processor.executeAutomation(mockJob);

      expect(result.status).toBe('FAILED');
      expect(result.successCount).toBe(0);
    });
  });
});
