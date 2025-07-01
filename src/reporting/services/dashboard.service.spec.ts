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
    findMany: jest.fn(),
  },
  expense: {
    findMany: jest.fn(),
  },
  branch: {
    findUnique: jest.fn().mockResolvedValue({ name: 'Test Branch' }),
  },
  ministry: {
    findMany: jest.fn(),
  },
  sacramentalRecord: {
    findMany: jest.fn(),
  },
  prayerRequest: {
    groupBy: jest.fn(),
  },
  smallGroup: {
    findMany: jest.fn(),
  },
  groupMember: {
    findMany: jest.fn(),
  },
  attendanceRecord: {
    count: jest.fn(),
  },
  userDashboardPreference: {
    findUnique: jest.fn().mockResolvedValue({
      dashboardType: DashboardType.ADMIN,
      branchId: 'branch-1',
    }),
  },
  $connect: jest.fn(),
};

// Mock FinancialReportsService
const mockFinancialReportsService = {
  getContributionsReport: jest.fn(),
  getBudgetVsActualReport: jest.fn().mockResolvedValue({
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
  const userId = 'user-1';

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
      mockPrismaService.contribution.findMany.mockResolvedValue([
        { date: new Date(), amount: 1200 },
        { date: new Date(), amount: 1300 },
      ]);
      mockPrismaService.expense.findMany.mockResolvedValue([
        { date: new Date(), amount: 500 },
        { date: new Date(), amount: 700 },
      ]);
      mockPrismaService.ministry.findMany.mockResolvedValue([
        { id: 'min-1', name: 'Worship', _count: { members: 10 } },
      ]);
      mockPrismaService.sacramentalRecord.findMany.mockResolvedValue([
        {
          id: 'sac-1',
          sacramentType: 'BAPTISM',
          dateOfSacrament: new Date(),
          member: { firstName: 'John', lastName: 'Doe' },
        },
      ]);
      mockPrismaService.prayerRequest.groupBy.mockResolvedValue([
        { status: 'NEW', _count: { id: 5 } },
      ]);
      mockPrismaService.smallGroup.findMany.mockResolvedValue([
        { id: 'group-1', name: 'Youth Group' },
      ]);
      mockPrismaService.groupMember.findMany.mockResolvedValue([
        { memberId: 'member-1' },
      ]);
      mockPrismaService.attendanceRecord.count.mockResolvedValue(10);

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
        userId,
        DashboardType.ADMIN,
        branchId,
      );

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result.dashboardType).toBe('ADMIN');
      expect(result.branchId).toBe(branchId);
      expect(result.generatedAt).toBeDefined();

      // Check for new widgets
      expect(result.widgets).toBeInstanceOf(Array);
      const widgetTypes = result.widgets.map((w) => w.widgetType);
      expect(widgetTypes).toContain('MINISTRY_INVOLVEMENT');
      expect(widgetTypes).toContain('RECENT_SACRAMENTS');
      expect(widgetTypes).toContain('PRAYER_REQUEST_SUMMARY');

      // Verify that the required methods were called
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
      mockPrismaService.contribution.findMany.mockResolvedValue([
        { date: new Date(), amount: 1200 },
        { date: new Date(), amount: 1300 },
      ]);
      mockPrismaService.expense.findMany.mockResolvedValue([
        { date: new Date(), amount: 500 },
        { date: new Date(), amount: 700 },
      ]);

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
        userId,
        DashboardType.FINANCE,
        branchId,
      );

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result.dashboardType).toBe('FINANCE');
      expect(result.branchId).toBe(branchId);

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
        userId,
        DashboardType.PASTORAL,
        branchId,
      );

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result.dashboardType).toBe('PASTORAL');
      expect(result.branchId).toBe(branchId);

      // Verify that the pastoral methods were called
      expect(mockPrismaService.member.count).toHaveBeenCalled();
      expect(
        mockAttendanceReportsService.getAttendanceTrendReport,
      ).toHaveBeenCalled();
    });

    it('should return ministry dashboard', async () => {
      // Call the service method
      const result = await service.getDashboardData(
        userId,
        DashboardType.MINISTRY,
        branchId,
      );

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result.dashboardType).toBe('MINISTRY');
      expect(result.branchId).toBe(branchId);
    });
  });

  describe('getMinistryInvolvementWidget', () => {
    it('should return ministry involvement data', async () => {
      const branchId = 'branch-1';
      const mockMinistries = [
        { id: 'min-1', name: 'Worship', _count: { members: 10 } },
        { id: 'min-2', name: 'Outreach', _count: { members: 15 } },
      ];
      mockPrismaService.ministry.findMany.mockResolvedValue(mockMinistries);

      const result = await (service as any).getMinistryInvolvementWidget(
        branchId,
      );

      expect(result.widgetType).toBe('MINISTRY_INVOLVEMENT');
      expect(result.title).toBe('Ministry Involvement');
      expect(result.ministries.length).toBe(2);
      expect(result.ministries[0].ministryName).toBe('Worship');
      expect(result.ministries[0].memberCount).toBe(10);
      expect(mockPrismaService.ministry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { branchId } }),
      );
    });
  });

  describe('getRecentSacramentsWidget', () => {
    it('should return recent sacraments data', async () => {
      const branchId = 'branch-1';
      const mockSacraments = [
        {
          id: 'sac-1',
          sacramentType: 'BAPTISM',
          dateOfSacrament: new Date(),
          member: { firstName: 'John', lastName: 'Doe' },
        },
      ];
      mockPrismaService.sacramentalRecord.findMany.mockResolvedValue(
        mockSacraments,
      );

      const result = await (service as any).getRecentSacramentsWidget(branchId);

      expect(result.widgetType).toBe('RECENT_SACRAMENTS');
      expect(result.title).toBe('Recent Sacraments');
      expect(result.sacraments.length).toBe(1);
      expect(result.sacraments[0].recipientName).toBe('John Doe');
      expect(mockPrismaService.sacramentalRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { branchId } }),
      );
    });
  });

  describe('getPrayerRequestSummaryWidget', () => {
    it('should return prayer request summary data', async () => {
      const branchId = 'branch-1';
      const mockPrayerRequests = [
        { status: 'NEW', _count: { id: 5 } },
        { status: 'IN_PROGRESS', _count: { id: 3 } },
      ];
      mockPrismaService.prayerRequest.groupBy.mockResolvedValue(
        mockPrayerRequests,
      );

      const result = await (service as any).getPrayerRequestSummaryWidget(
        branchId,
      );

      expect(result.widgetType).toBe('PRAYER_REQUEST_SUMMARY');
      expect(result.title).toBe('Prayer Requests');
      expect(result.summary.length).toBe(2);
      expect(result.summary[0].status).toBe('NEW');
      expect(result.summary[0].count).toBe(5);
      expect(mockPrismaService.prayerRequest.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { branchId } }),
      );
    });
  });

  describe('getGroupAttendanceWidget', () => {
    it('should return group attendance data', async () => {
      const mockGroups = [{ id: 'group-1', name: 'Youth Group' }];
      const mockGroupMembers = [{ memberId: 'member-1' }];
      mockPrismaService.smallGroup.findMany.mockResolvedValue(mockGroups);
      mockPrismaService.groupMember.findMany.mockResolvedValue(
        mockGroupMembers,
      );
      mockPrismaService.attendanceRecord.count.mockResolvedValue(10);

      const result = await (service as any).getGroupAttendanceWidget();

      expect(result.widgetType).toBe('CHART');
      expect(result.title).toBe('Group Attendance (Last 30 Days)');
      expect(result.data.labels).toEqual(['Youth Group']);
      expect(result.data.datasets[0].data).toEqual([10]);
      expect(mockPrismaService.smallGroup.findMany).toHaveBeenCalled();
      expect(mockPrismaService.groupMember.findMany).toHaveBeenCalledWith({
        where: { smallGroupId: 'group-1', status: 'ACTIVE' },
        select: { memberId: true },
      });
      expect(mockPrismaService.attendanceRecord.count).toHaveBeenCalled();
    });
  });
});
