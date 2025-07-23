import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationManagementService } from '../services/organization-management.service';
import { SubscriptionWorkflowService } from '../services/subscription-workflow.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowsService } from '../../workflows/services/workflows.service';
import { EmailService } from '../../communications/services/email.service';
import { SubscriptionStatus } from '@prisma/client';

describe('Subscription Management', () => {
  let organizationService: OrganizationManagementService;
  let workflowService: SubscriptionWorkflowService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    organisation: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
    subscription: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockWorkflowsService = {
    executeWorkflow: jest.fn(),
    scheduleWorkflow: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationManagementService,
        SubscriptionWorkflowService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: WorkflowsService,
          useValue: mockWorkflowsService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    organizationService = module.get<OrganizationManagementService>(
      OrganizationManagementService,
    );
    workflowService = module.get<SubscriptionWorkflowService>(
      SubscriptionWorkflowService,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('OrganizationManagementService', () => {
    describe('getOrganizations', () => {
      it('should return organizations with subscription details', async () => {
        const mockOrganizations = [
          {
            id: '1',
            name: 'Test Church',
            email: 'test@church.com',
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date(),
            subscriptions: [
              {
                id: 'sub1',
                status: SubscriptionStatus.ACTIVE,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(),
                plan: {
                  name: 'Premium',
                  amount: 9900,
                },
              },
            ],
            _count: {
              branches: 2,
              users: 5,
              members: 100,
            },
          },
        ];

        mockPrismaService.organisation.findMany.mockResolvedValue(
          mockOrganizations,
        );

        const result = await organizationService.getOrganizations();

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Test Church');
        expect(result[0].subscription).toBeDefined();
        expect(result[0].subscription?.planName).toBe('Premium');
      });

      it('should filter organizations by status', async () => {
        mockPrismaService.organisation.findMany.mockResolvedValue([]);

        await organizationService.getOrganizations({
          status: 'SUSPENDED',
        });

        expect(mockPrismaService.organisation.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { status: 'SUSPENDED' },
          }),
        );
      });
    });

    describe('enableOrganization', () => {
      it('should enable a suspended organization', async () => {
        const orgId = '1';
        const userId = 'user1';
        const mockOrg = {
          id: orgId,
          status: 'SUSPENDED',
        };

        mockPrismaService.organisation.findUnique.mockResolvedValue(mockOrg);
        mockPrismaService.organisation.update.mockResolvedValue({
          ...mockOrg,
          status: 'ACTIVE',
        });

        const result = await organizationService.enableOrganization(
          orgId,
          userId,
        );

        expect(mockPrismaService.organisation.update).toHaveBeenCalledWith({
          where: { id: orgId },
          data: expect.objectContaining({
            status: 'ACTIVE',
            suspensionReason: null,
            suspendedAt: null,
            suspendedBy: null,
          }),
        });

        expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            action: 'ORGANIZATION_ENABLED',
            entityType: 'Organisation',
            entityId: orgId,
            userId,
          }),
        });
      });

      it('should throw error if organization is already active', async () => {
        const orgId = '1';
        const userId = 'user1';
        const mockOrg = {
          id: orgId,
          status: 'ACTIVE',
        };

        mockPrismaService.organisation.findUnique.mockResolvedValue(mockOrg);

        await expect(
          organizationService.enableOrganization(orgId, userId),
        ).rejects.toThrow('Organization is already active');
      });
    });

    describe('disableOrganization', () => {
      it('should disable an active organization', async () => {
        const orgId = '1';
        const userId = 'user1';
        const reason = 'Payment overdue';
        const mockOrg = {
          id: orgId,
          status: 'ACTIVE',
        };

        mockPrismaService.organisation.findUnique.mockResolvedValue(mockOrg);
        mockPrismaService.organisation.update.mockResolvedValue({
          ...mockOrg,
          status: 'SUSPENDED',
        });

        await organizationService.disableOrganization(orgId, userId, reason);

        expect(mockPrismaService.organisation.update).toHaveBeenCalledWith({
          where: { id: orgId },
          data: expect.objectContaining({
            status: 'SUSPENDED',
            suspensionReason: reason,
            suspendedBy: userId,
          }),
        });

        expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            action: 'ORGANIZATION_SUSPENDED',
            entityType: 'Organisation',
            entityId: orgId,
            userId,
          }),
        });
      });
    });

    describe('getOrganizationStats', () => {
      it('should return organization statistics', async () => {
        const mockStats = [
          { status: 'ACTIVE', _count: { id: 10 } },
          { status: 'SUSPENDED', _count: { id: 2 } },
          { status: 'TRIAL', _count: { id: 5 } },
        ];

        mockPrismaService.organisation.groupBy.mockResolvedValue(mockStats);

        const result = await organizationService.getOrganizationStats();

        expect(result.total).toBe(17);
        expect(result.active).toBe(10);
        expect(result.suspended).toBe(2);
        expect(result.trial).toBe(5);
      });
    });
  });

  describe('SubscriptionWorkflowService', () => {
    describe('triggerPaymentFailedWorkflow', () => {
      it('should execute payment failed workflow', async () => {
        const data = {
          organizationId: '1',
          organizationName: 'Test Church',
          subscriptionId: 'sub1',
          paymentId: 'pay1',
          amount: 9900,
        };

        mockPrismaService.organisation.findUnique.mockResolvedValue({
          id: '1',
          users: [{ email: 'admin@church.com', roles: [{ name: 'ADMIN' }] }],
        });

        await workflowService.triggerPaymentFailedWorkflow(data);

        expect(mockWorkflowsService.executeWorkflow).toHaveBeenCalledWith(
          'subscription_payment_failed',
          expect.objectContaining({
            organizationId: data.organizationId,
            subscriptionId: data.subscriptionId,
            paymentId: data.paymentId,
            amount: data.amount,
          }),
        );

        expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'admin@church.com',
            subject: 'Payment Failed - Action Required',
            template: 'payment_failed',
          }),
        );
      });
    });

    describe('checkOverduePayments', () => {
      it('should trigger workflows for overdue payments', async () => {
        const overdueDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        const mockOverdueSubscriptions = [
          {
            id: 'sub1',
            organisationId: '1',
            currentPeriodEnd: overdueDate,
            status: SubscriptionStatus.PAST_DUE,
            organisation: { name: 'Test Church' },
            plan: { amount: 9900 },
          },
        ];

        mockPrismaService.subscription.findMany.mockResolvedValue(
          mockOverdueSubscriptions,
        );

        const triggerSpy = jest.spyOn(
          workflowService,
          'triggerPaymentOverdueWorkflow',
        );
        triggerSpy.mockImplementation(() => Promise.resolve());

        await workflowService.checkOverduePayments();

        expect(triggerSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            organizationId: '1',
            organizationName: 'Test Church',
            subscriptionId: 'sub1',
            daysOverdue: 7,
          }),
        );
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete organization suspension workflow', async () => {
      const orgId = '1';
      const userId = 'user1';
      const reason = 'Payment overdue for 21 days';

      // Mock organization data
      mockPrismaService.organisation.findUnique.mockResolvedValue({
        id: orgId,
        status: 'ACTIVE',
        users: [{ email: 'admin@church.com', roles: [{ name: 'ADMIN' }] }],
      });

      mockPrismaService.organisation.update.mockResolvedValue({
        id: orgId,
        status: 'SUSPENDED',
      });

      // Disable organization
      await organizationService.disableOrganization(orgId, userId, reason);

      // Trigger workflow
      await workflowService.triggerOrganizationSuspendedWorkflow({
        organizationId: orgId,
        organizationName: 'Test Church',
        reason,
      });

      // Verify organization was suspended
      expect(mockPrismaService.organisation.update).toHaveBeenCalledWith({
        where: { id: orgId },
        data: expect.objectContaining({
          status: 'SUSPENDED',
          suspensionReason: reason,
        }),
      });

      // Verify workflow was executed
      expect(mockWorkflowsService.executeWorkflow).toHaveBeenCalledWith(
        'organization_suspended',
        expect.objectContaining({
          organizationId: orgId,
          reason,
        }),
      );

      // Verify notification was sent
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin@church.com',
          subject: 'Organization Access Suspended',
          template: 'organization_suspended',
        }),
      );
    });
  });
});
