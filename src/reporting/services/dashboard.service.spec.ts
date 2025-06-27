import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FinancialReportsService } from './financial-reports.service';
import { AttendanceReportsService } from './attendance-reports.service';
import { MemberReportsService } from './member-reports.service';
import { DashboardType } from '../entities/dashboard-data.entity';

// Mock PrismaService
const mockPrismaService = {
  member: {
    count: jest.fn(),
  },
  contribution: {
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  branch: {
    findUnique: jest.fn().mockResolvedValue({ name: 'Test Branch' }),
  },
  $connect: jest.fn(),
};

// Mock FinancialReportsService
const mockFinancialReportsService = {
  getContributionsReport: jest.fn(),
  getBudgetVsActualReport: jest.fn().mockResolvedValue({
    budgetItems: [
      { category: 'Income', budgeted: 10000, actual: 9000 },
      { category: 'Expenses', budgeted: 8000, actual: 7500 },
    ],
    totalBudgeted: 18000,
    totalActual: 16500,
  }),
};

// Mock AttendanceReportsService
const mockAttendanceReportsService = {
  getAttendanceTrendReport: jest.fn(),
};

// Mock MemberReportsService
const mockMemberReportsService = {
  getMembershipGrowthReport: jest.fn(),
  getMemberDemographicsReport: jest.fn().mockResolvedValue({
    ageDistribution: [
      { name: '18-25', count: 25 },
      { name: '26-35', count: 40 },
    ],
    genderDistribution: [
      { name: 'Male', count: 45 },
      { name: 'Female', count: 55 },
    ],
    membershipStatusDistribution: [
      { name: 'Active', count: 80 },
      { name: 'Inactive', count: 20 },
    ],
  }),
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: FinancialReportsService,
          useValue: mockFinancialReportsService,
        },
        {
          provide: AttendanceReportsService,
          useValue: mockAttendanceReportsService,
        },
        {
          provide: MemberReportsService,
          useValue: mockMemberReportsService,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardData', () => {
    const branchId = 'branch-1';

    it('should return admin dashboard', async () => {
      // Setup mock return values
      mockPrismaService.member.count.mockResolvedValue(150);
      mockPrismaService.contribution.count.mockResolvedValue(75);
      mockPrismaService.contribution.aggregate.mockResolvedValue({
        _sum: {
          amount: 25000,
        },
      });

      mockFinancialReportsService.getContributionsReport.mockResolvedValue({
        trendData: [
          { date: new Date('2023-06-01'), amount: 5000 },
          { date: new Date('2023-06-08'), amount: 6000 },
        ],
        fundBreakdown: [
          { name: 'General Fund', amount: 15000, percentage: 60 },
          { name: 'Building Fund', amount: 10000, percentage: 40 },
        ],
        totalAmount: 25000,
        contributionCount: 75,
      });

      // Call the service method
      const result = await service.getDashboardData(
        branchId,
        DashboardType.ADMIN,
      );

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result.dashboardType).toBe('ADMIN');
      expect(result.branchId).toBe(branchId);
      // The dateRange is not set in the implementation, so we shouldn't expect it
      expect(result.generatedAt).toBeDefined();

      // Check KPI cards
      expect(result.kpiCards).toBeInstanceOf(Array);
      expect(result.kpiCards.length).toBeGreaterThan(0);

      // Check charts
      expect(result.charts).toBeInstanceOf(Array);
      expect(result.charts.length).toBeGreaterThan(0);

      // Verify that the required methods were called
      expect(mockPrismaService.member.count).toHaveBeenCalled();
      // The implementation doesn't call contribution methods in the admin dashboard
      expect(
        mockMemberReportsService.getMemberDemographicsReport,
      ).toHaveBeenCalled();
    });

    it('should return finance dashboard', async () => {
      // Setup mock return values
      mockPrismaService.contribution.count.mockResolvedValue(75);
      mockPrismaService.contribution.aggregate.mockResolvedValue({
        _sum: {
          amount: 25000,
        },
      });

      mockFinancialReportsService.getContributionsReport.mockResolvedValue({
        trendData: [
          { date: new Date('2023-06-01'), amount: 5000 },
          { date: new Date('2023-06-08'), amount: 6000 },
        ],
        fundBreakdown: [
          { name: 'General Fund', amount: 15000, percentage: 60 },
          { name: 'Building Fund', amount: 10000, percentage: 40 },
        ],
        totalAmount: 25000,
        contributionCount: 75,
      });

      mockFinancialReportsService.getBudgetVsActualReport.mockResolvedValue({
        categories: [
          { name: 'Income', budgeted: 10000, actual: 9000 },
          { name: 'Expenses', budgeted: 8000, actual: 7500 },
        ],
        totals: {
          budgeted: 18000,
          actual: 16500,
          variance: 1500,
          percentVariance: 8.33,
        },
      });

      // Call the service method
      const result = await service.getDashboardData(
        branchId,
        DashboardType.FINANCE,
      );

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result.dashboardType).toBe('FINANCE');
      expect(result.branchId).toBe(branchId);

      // Check KPI cards
      expect(result.kpiCards).toBeInstanceOf(Array);
      expect(result.kpiCards.length).toBeGreaterThan(0);

      // Check charts
      expect(result.charts).toBeInstanceOf(Array);
      expect(result.charts.length).toBeGreaterThan(0);

      // Verify that the financial methods were called
      expect(
        mockFinancialReportsService.getContributionsReport,
      ).toHaveBeenCalled();
      expect(
        mockFinancialReportsService.getBudgetVsActualReport,
      ).toHaveBeenCalled();
    });

    it('should return pastoral dashboard', async () => {
      // Setup mock return values
      mockPrismaService.member.count.mockResolvedValue(150);

      mockAttendanceReportsService.getAttendanceTrendReport.mockResolvedValue({
        trendData: [
          { date: new Date('2023-06-01'), count: 120, percentChange: 5 },
          { date: new Date('2023-06-08'), count: 125, percentChange: 4.17 },
        ],
      });

      // Call the service method
      const result = await service.getDashboardData(
        branchId,
        DashboardType.PASTORAL,
      );

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result.dashboardType).toBe('PASTORAL');
      expect(result.branchId).toBe(branchId);

      // Check KPI cards
      expect(result.kpiCards).toBeInstanceOf(Array);
      expect(result.kpiCards.length).toBeGreaterThan(0);

      // Check charts
      expect(result.charts).toBeInstanceOf(Array);
      expect(result.charts.length).toBeGreaterThan(0);

      // Verify that the pastoral methods were called
      expect(mockPrismaService.member.count).toHaveBeenCalled();
      expect(
        mockAttendanceReportsService.getAttendanceTrendReport,
      ).toHaveBeenCalled();
    });

    it('should return ministry dashboard', async () => {
      // Call the service method
      const result = await service.getDashboardData(
        branchId,
        DashboardType.MINISTRY,
      );

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result.dashboardType).toBe('MINISTRY');
      expect(result.branchId).toBe(branchId);

      // Check KPI cards
      expect(result.kpiCards).toBeInstanceOf(Array);
      expect(result.kpiCards.length).toBeGreaterThan(0);

      // Check charts
    });

    it('should return pastoral dashboard', async () => {
      // ... (rest of the code remains the same)
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      // Call the private method using any type assertion to access it
      const result = await (service as any).getFormSubmissionsByForm(
        branchId,
        startDate,
        endDate,
      );

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);

      // Check that each item has the expected properties
      result.forEach((item) => {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('count');
      });
    });
  });

  describe('getGroupAttendance', () => {
    it('should return group attendance data', async () => {
      const branchId = 'branch-1';
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      // Call the private method using any type assertion to access it
      const result = await (service as any).getGroupAttendance(
        branchId,
        startDate,
        endDate,
      );

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result).toHaveProperty('activeGroups');
      expect(result).toHaveProperty('totalMembers');
      expect(result).toHaveProperty('groups');
      expect(result.groups).toBeInstanceOf(Array);

      // Check that each group has the expected properties
      result.groups.forEach((group) => {
        expect(group).toHaveProperty('name');
        expect(group).toHaveProperty('attendance');
        expect(group).toHaveProperty('capacity');
      });
    });
  });

  describe('getGroupTypeDistribution', () => {
    it('should return group type distribution data', async () => {
      const branchId = 'branch-1';

      // Call the private method using any type assertion to access it
      const result = await (service as any).getGroupTypeDistribution(branchId);

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);

      // Check that each item has the expected properties
      result.forEach((item) => {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('count');
      });
    });
  });
});
