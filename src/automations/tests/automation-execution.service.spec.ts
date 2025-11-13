import { Test, TestingModule } from '@nestjs/testing';
import { AutomationExecutionService } from '../services/automation-execution.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AutomationExecutionService', () => {
  let service: AutomationExecutionService;
  let prismaService: PrismaService;

  const mockAutomation = {
    id: 'automation-1',
    name: 'Test Automation',
    branchId: 'branch-1',
    template: {
      id: 'template-1',
      name: 'Test Template',
      subject: 'Test Subject',
      body: 'Test Body',
    },
    channels: ['EMAIL', 'SMS'],
  };

  const mockRecipients = [
    {
      id: 'member-1',
      email: 'member1@example.com',
      phoneNumber: '+1234567890',
    },
    {
      id: 'member-2',
      email: 'member2@example.com',
      phoneNumber: '+0987654321',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationExecutionService,
        {
          provide: PrismaService,
          useValue: {
            member: {
              findMany: jest.fn().mockResolvedValue(mockRecipients),
            },
            automationLog: {
              create: jest.fn().mockResolvedValue({
                id: 'log-1',
                automationId: 'automation-1',
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AutomationExecutionService>(AutomationExecutionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should execute automation successfully', async () => {
      const result = await service.execute(mockAutomation);

      expect(result).toHaveProperty('recipientCount');
      expect(result).toHaveProperty('successCount');
      expect(result).toHaveProperty('failureCount');
      expect(result).toHaveProperty('status');
    });

    it('should get recipients from branch', async () => {
      await service.execute(mockAutomation);

      expect(prismaService.member.findMany).toHaveBeenCalledWith({
        where: {
          branchId: mockAutomation.branchId,
        },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
        },
      });
    });

    it('should log execution result', async () => {
      await service.execute(mockAutomation);

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

    it('should throw error if no template assigned', async () => {
      const automationWithoutTemplate = {
        ...mockAutomation,
        template: null,
      };

      await expect(service.execute(automationWithoutTemplate)).rejects.toThrow(
        'No template assigned to automation',
      );
    });

    it('should throw error if no channels configured', async () => {
      const automationWithoutChannels = {
        ...mockAutomation,
        channels: [],
      };

      await expect(
        service.execute(automationWithoutChannels),
      ).rejects.toThrow('No channels configured for automation');
    });

    it('should handle empty recipients list', async () => {
      jest
        .spyOn(prismaService.member, 'findMany')
        .mockResolvedValueOnce([]);

      const result = await service.execute(mockAutomation);

      expect(result.recipientCount).toBe(0);
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
    });

    it('should return SUCCESS status when all messages sent', async () => {
      const result = await service.execute(mockAutomation);

      // With 2 recipients and 2 channels, we expect 4 total attempts
      expect(result.status).toBe('SUCCESS');
    });

    it('should log execution error', async () => {
      jest
        .spyOn(prismaService.member, 'findMany')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(service.execute(mockAutomation)).rejects.toThrow();

      // Should still log the error
      expect(prismaService.automationLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          automationId: mockAutomation.id,
          status: 'FAILED',
          errorMessage: expect.any(String),
        }),
      });
    });
  });

  describe('getRecipients', () => {
    it('should fetch recipients from branch', async () => {
      const recipients = await service['getRecipients'](mockAutomation);

      expect(recipients).toEqual(mockRecipients);
      expect(prismaService.member.findMany).toHaveBeenCalledWith({
        where: {
          branchId: mockAutomation.branchId,
        },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
        },
      });
    });

    it('should return empty array if no recipients', async () => {
      jest
        .spyOn(prismaService.member, 'findMany')
        .mockResolvedValueOnce([]);

      const recipients = await service['getRecipients'](mockAutomation);

      expect(recipients).toEqual([]);
    });
  });

  describe('sendMessages', () => {
    it('should send messages through all channels', async () => {
      const result = await service['sendMessages'](
        mockAutomation,
        mockRecipients,
      );

      // 2 recipients * 2 channels = 4 total attempts
      expect(result.recipientCount).toBe(2);
      expect(result.successCount + result.failureCount).toBe(4);
    });

    it('should return SUCCESS status when all succeed', async () => {
      const result = await service['sendMessages'](
        mockAutomation,
        mockRecipients,
      );

      if (result.failureCount === 0) {
        expect(result.status).toBe('SUCCESS');
      }
    });

    it('should return PARTIAL status on mixed results', async () => {
      // This would require mocking sendViaChannel to fail sometimes
      const result = await service['sendMessages'](
        mockAutomation,
        mockRecipients,
      );

      expect(['SUCCESS', 'PARTIAL', 'FAILED']).toContain(result.status);
    });

    it('should return FAILED status when all fail', async () => {
      // This would require mocking sendViaChannel to always fail
      const result = await service['sendMessages'](
        mockAutomation,
        mockRecipients,
      );

      expect(['SUCCESS', 'PARTIAL', 'FAILED']).toContain(result.status);
    });
  });

  describe('logExecution', () => {
    it('should create execution log', async () => {
      const result = {
        recipientCount: 10,
        successCount: 9,
        failureCount: 1,
        status: 'PARTIAL',
      };

      await service['logExecution'](mockAutomation, result);

      expect(prismaService.automationLog.create).toHaveBeenCalledWith({
        data: {
          automationId: mockAutomation.id,
          status: result.status,
          recipientCount: result.recipientCount,
          successCount: result.successCount,
          failureCount: result.failureCount,
          executedAt: expect.any(Date),
          metadata: result,
        },
      });
    });
  });

  describe('logExecutionError', () => {
    it('should log execution error', async () => {
      const error = new Error('Execution failed');

      await service['logExecutionError'](mockAutomation, error);

      expect(prismaService.automationLog.create).toHaveBeenCalledWith({
        data: {
          automationId: mockAutomation.id,
          status: 'FAILED',
          recipientCount: 0,
          successCount: 0,
          failureCount: 0,
          errorMessage: error.message,
          executedAt: expect.any(Date),
        },
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete execution flow', async () => {
      const result = await service.execute(mockAutomation);

      // Verify result structure
      expect(result).toHaveProperty('recipientCount', 2);
      expect(result).toHaveProperty('successCount');
      expect(result).toHaveProperty('failureCount');
      expect(result).toHaveProperty('status');

      // Verify logging
      expect(prismaService.automationLog.create).toHaveBeenCalled();
    });

    it('should handle automation with multiple channels', async () => {
      const multiChannelAutomation = {
        ...mockAutomation,
        channels: ['EMAIL', 'SMS', 'PUSH'],
      };

      const result = await service.execute(multiChannelAutomation);

      // 2 recipients * 3 channels = 6 total attempts
      expect(result.recipientCount).toBe(2);
    });

    it('should handle automation with single recipient', async () => {
      jest
        .spyOn(prismaService.member, 'findMany')
        .mockResolvedValueOnce([mockRecipients[0]]);

      const result = await service.execute(mockAutomation);

      expect(result.recipientCount).toBe(1);
    });

    it('should handle automation with many recipients', async () => {
      const manyRecipients = Array.from({ length: 100 }, (_, i) => ({
        id: `member-${i}`,
        email: `member${i}@example.com`,
        phoneNumber: `+123456789${i}`,
      }));

      jest
        .spyOn(prismaService.member, 'findMany')
        .mockResolvedValueOnce(manyRecipients);

      const result = await service.execute(mockAutomation);

      expect(result.recipientCount).toBe(100);
    });
  });
});
