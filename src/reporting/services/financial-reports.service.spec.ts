import { Test, TestingModule } from '@nestjs/testing';
import { FinancialReportsService } from './financial-reports.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportFilterInput } from '../dto/report-filter.input';

// Mock PrismaService
const mockPrismaService = {
  contribution: {
    findMany: jest.fn(),
  },
  $connect: jest.fn(),
};

describe('FinancialReportsService', () => {
  let service: FinancialReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialReportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FinancialReportsService>(FinancialReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getContributionsReport', () => {
    it('should return a contributions report with proper aggregations', async () => {
      // Define test data
      const filter: ReportFilterInput = {
        branchId: 'branch-1',
        dateRange: {
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
        },
        fundId: 'fund-1',
      };

      // Mock contributions data
      const mockContributions = [
        {
          id: 'contrib-1',
          amount: 100.0,
          date: new Date('2023-06-15'),
          branchId: 'branch-1',
          fundId: 'fund-1',
          memberId: 'member-1',
          paymentMethodId: 'cash',
          fund: { name: 'General Fund' },
          branch: { name: 'Main Branch' },
          member: { firstName: 'John', lastName: 'Doe' },
        },
        {
          id: 'contrib-2',
          amount: 200.0,
          date: new Date('2023-06-20'),
          branchId: 'branch-1',
          fundId: 'fund-1',
          memberId: 'member-2',
          paymentMethodId: 'card',
          fund: { name: 'General Fund' },
          branch: { name: 'Main Branch' },
          member: { firstName: 'Jane', lastName: 'Smith' },
        },
        {
          id: 'contrib-3',
          amount: 150.0,
          date: new Date('2023-06-25'),
          branchId: 'branch-1',
          fundId: 'fund-2',
          memberId: 'member-1',
          paymentMethodId: 'cash',
          fund: { name: 'Building Fund' },
          branch: { name: 'Main Branch' },
          member: { firstName: 'John', lastName: 'Doe' },
        },
      ];

      // Setup mock return value
      mockPrismaService.contribution.findMany.mockResolvedValue(
        mockContributions,
      );

      // Call the service method
      const result = await service.getContributionsReport(filter);

      // Verify Prisma was called with correct parameters
      expect(mockPrismaService.contribution.findMany).toHaveBeenCalledWith({
        where: {
          branchId: 'branch-1',
          fundId: 'fund-1',
          date: filter.dateRange
            ? {
                gte: filter.dateRange.startDate,
                lte: filter.dateRange.endDate,
              }
            : undefined,
        },
        include: {
          fund: {
            select: {
              name: true,
            },
          },
          branch: {
            select: {
              name: true,
            },
          },
          member: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });

      // Verify the result structure and calculations
      expect(result).toBeDefined();
      expect(result.totalAmount).toBe(450);
      expect(result.contributionCount).toBe(3);

      // Check fund breakdown
      expect(result.fundBreakdown).toHaveLength(2);
      const generalFund = result.fundBreakdown.find(
        (f) => f.name === 'General Fund',
      );
      const buildingFund = result.fundBreakdown.find(
        (f) => f.name === 'Building Fund',
      );

      expect(generalFund).toBeDefined();
      expect(generalFund.amount).toBe(300);
      expect(generalFund.percentage).toBeCloseTo(66.67, 1);

      expect(buildingFund).toBeDefined();
      expect(buildingFund.amount).toBe(150);
      expect(buildingFund.percentage).toBeCloseTo(33.33, 1);

      // Check payment method breakdown
      expect(result.paymentMethodBreakdown).toHaveLength(2);
      const cashPayments = result.paymentMethodBreakdown.find(
        (p) => p.method === 'cash',
      );
      const cardPayments = result.paymentMethodBreakdown.find(
        (p) => p.method === 'card',
      );

      expect(cashPayments).toBeDefined();
      expect(cashPayments.amount).toBe(250);
      expect(cashPayments.percentage).toBeCloseTo(55.56, 1);

      expect(cardPayments).toBeDefined();
      expect(cardPayments.amount).toBe(200);
      expect(cardPayments.percentage).toBeCloseTo(44.44, 1);

      // Check trend data
      expect(result.trendData).toHaveLength(3);
      expect(result.trendData[0].date).toEqual(new Date('2023-06-15'));
      expect(result.trendData[0].amount).toBe(100);
      expect(result.trendData[1].date).toEqual(new Date('2023-06-20'));
      expect(result.trendData[1].amount).toBe(200);
      expect(result.trendData[2].date).toEqual(new Date('2023-06-25'));
      expect(result.trendData[2].amount).toBe(150);

      // Check other properties
      expect(result.branchName).toBe('Main Branch');
      expect(result.branchId).toBe('branch-1');
      expect(result.dateRange).toEqual({
        startDate: filter.dateRange?.startDate,
        endDate: filter.dateRange?.endDate,
      });
    });

    it('should handle empty contributions array', async () => {
      // Define test data
      const filter: ReportFilterInput = {
        branchId: 'branch-1',
        dateRange: {
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
        },
      };

      // Setup mock return value
      mockPrismaService.contribution.findMany.mockResolvedValue([]);

      // Call the service method
      const result = await service.getContributionsReport(filter);

      // Verify the result structure with empty data
      expect(result).toBeDefined();
      expect(result.totalAmount).toBe(0);
      expect(result.contributionCount).toBe(0);
      expect(result.fundBreakdown).toEqual([]);
      expect(result.paymentMethodBreakdown).toEqual([]);
      expect(result.trendData).toEqual([]);
      expect(result.branchName).toBeUndefined();
    });

    it('should handle missing filters', async () => {
      // Define minimal filter
      const filter: ReportFilterInput = {};

      // Setup mock return value
      mockPrismaService.contribution.findMany.mockResolvedValue([]);

      // Call the service method
      const result = await service.getContributionsReport(filter);

      // Verify Prisma was called with empty where clause
      expect(mockPrismaService.contribution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result.totalAmount).toBe(0);
      expect(result.dateRange).toEqual({
        startDate: undefined,
        endDate: undefined,
      });
    });
  });

  describe('getBudgetVsActualReport', () => {
    it('should return a placeholder budget vs actual report', async () => {
      const branchId = 'branch-1';
      const dateRange = {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      const result = await service.getBudgetVsActualReport(branchId, dateRange);

      // Verify that $connect was called (placeholder implementation)
      expect(mockPrismaService.$connect).toHaveBeenCalled();

      // Verify the structure of the placeholder data
      expect(result).toBeDefined();
      expect(result.branchId).toBe(branchId);
      expect(result.startDate).toEqual(dateRange.startDate);
      expect(result.endDate).toEqual(dateRange.endDate);
      expect(result.categories).toBeInstanceOf(Array);
      expect(result.categories.length).toBeGreaterThan(0);

      // Check that each category has the expected properties
      result.categories.forEach((category) => {
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('budgeted');
        expect(category).toHaveProperty('actual');
        expect(category).toHaveProperty('variance');
        expect(category).toHaveProperty('percentVariance');
      });

      // Check totals
      expect(result.totals).toBeDefined();
      expect(result.totals).toHaveProperty('budgeted');
      expect(result.totals).toHaveProperty('actual');
      expect(result.totals).toHaveProperty('variance');
      expect(result.totals).toHaveProperty('percentVariance');
    });
  });

  describe('getPledgeFulfillmentReport', () => {
    it('should return a placeholder pledge fulfillment report', async () => {
      const branchId = 'branch-1';
      const fundId = 'fund-1';

      const result = await service.getPledgeFulfillmentReport(branchId, fundId);

      // Verify that $connect was called (placeholder implementation)
      expect(mockPrismaService.$connect).toHaveBeenCalled();

      // Verify the structure of the placeholder data
      expect(result).toBeDefined();
      expect(result.branchId).toBe(branchId);
      expect(result.fundId).toBe(fundId);
      expect(result).toHaveProperty('totalPledged');
      expect(result).toHaveProperty('totalFulfilled');
      expect(result).toHaveProperty('fulfillmentRate');
      expect(result).toHaveProperty('pledgeCount');
      expect(result).toHaveProperty('fullyFulfilledCount');
      expect(result).toHaveProperty('partiallyFulfilledCount');
      expect(result).toHaveProperty('unfulfilled');
      expect(result).toHaveProperty('pledges');
    });

    it('should handle optional fundId parameter', async () => {
      const branchId = 'branch-1';
      // No fundId passed

      const result = await service.getPledgeFulfillmentReport(branchId);

      // Verify that $connect was called (placeholder implementation)
      expect(mockPrismaService.$connect).toHaveBeenCalled();

      // Verify the structure of the placeholder data
      expect(result).toBeDefined();
      expect(result.branchId).toBe(branchId);
      expect(result.fundId).toBeUndefined();
    });
  });
});
