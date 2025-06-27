/**
 * ReportingService Unit Tests
 *
 * Note: This test file accesses private methods in the ReportingService class using type assertions.
 * ESLint warnings about unsafe any usage are suppressed where necessary using disable comments.
 * In a production environment, consider refactoring to avoid testing private methods directly.
 *
 * @typescript-eslint/ban-ts-comment is used to suppress TypeScript errors about accessing private methods
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ReportingService } from './reporting.service';
import { FinancialReportsService } from './financial-reports.service';
import { AttendanceReportsService } from './attendance-reports.service';
import { MemberReportsService } from './member-reports.service';
import { ReportFilterInput, OutputFormat } from '../dto/report-filter.input';
import { PrismaService } from '../../prisma/prisma.service';

// Define ReportType enum for tests since it's not available from imports
enum ReportType {
  MEMBER_LIST = 'MEMBER_LIST',
  MEMBER_DEMOGRAPHICS = 'MEMBER_DEMOGRAPHICS',
  ATTENDANCE_SUMMARY = 'ATTENDANCE_SUMMARY',
  ATTENDANCE_TREND = 'ATTENDANCE_TREND',
  FINANCIAL_CONTRIBUTIONS = 'FINANCIAL_CONTRIBUTIONS',
}

// Mock services
const mockPrismaService = {
  // Add any methods used by the reporting service
  $transaction: jest.fn(),
};

const mockFinancialReportsService = {
  getContributionsReport: jest.fn(),
  getBudgetVsActualReport: jest.fn(),
  getPledgeFulfillmentReport: jest.fn(),
};

const mockAttendanceReportsService = {
  getAttendanceSummaryReport: jest.fn(),
  getAttendanceTrendReport: jest.fn(),
};

const mockMemberReportsService = {
  getMemberListReport: jest.fn(),
  getMemberDemographicsReport: jest.fn(),
};

describe('ReportingService', () => {
  let service: ReportingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportingService,
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

    service = module.get<ReportingService>(ReportingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateReport', () => {
    const filter: ReportFilterInput = {
      branchId: 'branch-1',
      dateRange: {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      },
    };

    it('should generate a contributions report', async () => {
      const mockReport = {
        totalAmount: 25000,
        contributionCount: 100,
        fundBreakdown: [],
      };
      mockFinancialReportsService.getContributionsReport.mockResolvedValue(
        mockReport,
      );

      const result = await service.generateReport(
        ReportType.FINANCIAL_CONTRIBUTIONS,
        filter,
      );

      expect(
        mockFinancialReportsService.getContributionsReport,
      ).toHaveBeenCalledWith(filter);
      expect(result).toEqual({
        reportType: ReportType.FINANCIAL_CONTRIBUTIONS,
        data: mockReport,
        downloadUrl: undefined,
        format: OutputFormat.JSON,
        generatedAt: expect.any(Date),
        message: `${ReportType.FINANCIAL_CONTRIBUTIONS} report generated successfully`,
      });
    });

    it('should generate a member list report', async () => {
      const mockReport: Record<string, unknown> = {
        totalCount: 100,
        members: [],
        filters: {},
      };
      mockMemberReportsService.getMemberListReport.mockResolvedValue(
        mockReport,
      );

      const result = await service.generateReport(
        ReportType.MEMBER_LIST,
        filter,
      );

      expect(mockMemberReportsService.getMemberListReport).toHaveBeenCalledWith(
        filter,
      );
      expect(result).toEqual({
        reportType: ReportType.MEMBER_LIST,
        data: mockReport,
        downloadUrl: undefined,
        format: OutputFormat.JSON,
        generatedAt: expect.any(Date),
        message: `${ReportType.MEMBER_LIST} report generated successfully`,
      });
    });

    // Removed pledge fulfillment test case as it's not in our updated enum

    it('should generate a member demographics report', async () => {
      const mockReport: Record<string, unknown> = {
        branchId: 'branch-1',
        totalMembers: 100,
        ageDistribution: [],
      };
      mockMemberReportsService.getMemberDemographicsReport.mockResolvedValue(
        mockReport,
      );

      const result = await service.generateReport(
        ReportType.MEMBER_DEMOGRAPHICS,
        filter,
      );

      expect(
        mockMemberReportsService.getMemberDemographicsReport,
      ).toHaveBeenCalledWith(filter.branchId || '', filter.dateRange);
      expect(result).toEqual({
        reportType: ReportType.MEMBER_DEMOGRAPHICS,
        data: mockReport,
        downloadUrl: undefined,
        format: OutputFormat.JSON,
        generatedAt: expect.any(Date),
        message: `${ReportType.MEMBER_DEMOGRAPHICS} report generated successfully`,
      });
    });

    it('should generate an attendance summary report', async () => {
      const mockReport: Record<string, unknown> = {
        totalAttendance: 1200,
        averageAttendance: 100,
      };
      mockAttendanceReportsService.getAttendanceSummaryReport.mockResolvedValue(
        mockReport,
      );

      const result = await service.generateReport(
        ReportType.ATTENDANCE_SUMMARY,
        filter,
      );

      expect(
        mockAttendanceReportsService.getAttendanceSummaryReport,
      ).toHaveBeenCalledWith(filter);
      expect(result).toEqual({
        reportType: ReportType.ATTENDANCE_SUMMARY,
        data: mockReport,
        downloadUrl: undefined,
        format: OutputFormat.JSON,
        generatedAt: expect.any(Date),
        message: `${ReportType.ATTENDANCE_SUMMARY} report generated successfully`,
      });
    });

    it('should generate an attendance trend report', async () => {
      const mockReport: Record<string, unknown> = {
        trendData: [],
      };
      mockAttendanceReportsService.getAttendanceTrendReport.mockResolvedValue(
        mockReport,
      );

      const result = await service.generateReport(
        ReportType.ATTENDANCE_TREND,
        filter,
      );

      expect(
        mockAttendanceReportsService.getAttendanceTrendReport,
      ).toHaveBeenCalledWith(
        filter.branchId || '',
        filter.eventTypeId || '',
        filter.dateRange,
      );
      expect(result).toEqual({
        reportType: ReportType.ATTENDANCE_TREND,
        data: mockReport,
        downloadUrl: undefined,
        format: OutputFormat.JSON,
        generatedAt: expect.any(Date),
        message: `${ReportType.ATTENDANCE_TREND} report generated successfully`,
      });
    });

    it('should throw Error for unsupported report type', async () => {
      await expect(
        service.generateReport('UNSUPPORTED_TYPE' as ReportType, filter),
      ).rejects.toThrow('Unsupported report type: UNSUPPORTED_TYPE');
    });
  });

  describe('generateReport with different output formats', () => {
    const reportType = ReportType.FINANCIAL_CONTRIBUTIONS;
    const filter: ReportFilterInput = {
      branchId: 'branch-1',
      dateRange: {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      },
    };

    it('should generate PDF format report', async () => {
      const mockReport = {
        totalAmount: 25000,
        contributionCount: 100,
      };
      mockFinancialReportsService.getContributionsReport.mockResolvedValue(
        mockReport,
      );

      const result = await service.generateReport(
        reportType,
        filter,
        OutputFormat.PDF,
      );

      expect(
        mockFinancialReportsService.getContributionsReport,
      ).toHaveBeenCalledWith(filter);
      expect(result).toEqual({
        reportType,
        data: undefined,
        downloadUrl: expect.stringContaining('.pdf'),
        format: OutputFormat.PDF,
        generatedAt: expect.any(Date),
        message: expect.stringContaining('report generated successfully'),
      });
    });

    it('should generate CSV format report', async () => {
      const mockReport = {
        totalAmount: 25000,
        contributionCount: 100,
      };
      mockFinancialReportsService.getContributionsReport.mockResolvedValue(
        mockReport,
      );

      const result = await service.generateReport(
        reportType,
        filter,
        OutputFormat.CSV,
      );

      expect(
        mockFinancialReportsService.getContributionsReport,
      ).toHaveBeenCalledWith(filter);
      expect(result).toEqual({
        reportType,
        data: undefined,
        downloadUrl: expect.stringContaining('.csv'),
        format: OutputFormat.CSV,
        generatedAt: expect.any(Date),
        message: expect.stringContaining('report generated successfully'),
      });
    });

    it('should generate Excel format report', async () => {
      const mockReport = {
        totalAmount: 25000,
        contributionCount: 100,
      };
      mockFinancialReportsService.getContributionsReport.mockResolvedValue(
        mockReport,
      );

      const result = await service.generateReport(
        reportType,
        filter,
        OutputFormat.EXCEL,
      );

      expect(
        mockFinancialReportsService.getContributionsReport,
      ).toHaveBeenCalledWith(filter);
      expect(result).toEqual({
        reportType,
        data: undefined,
        downloadUrl: expect.stringContaining('excel'),
        format: OutputFormat.EXCEL,
        generatedAt: expect.any(Date),
        message: expect.stringContaining('report generated successfully'),
      });
    });

    it('should throw error for unsupported report type', async () => {
      await expect(
        service.generateReport('INVALID_REPORT_TYPE', filter, OutputFormat.PDF),
      ).rejects.toThrow('Unsupported report type: INVALID_REPORT_TYPE');
    });
  });
});
