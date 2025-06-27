import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportFilterInput, OutputFormat } from '../dto/report-filter.input';
import { ReportOutput } from '../entities/report-output.entity';
import { MemberReportsService } from '../services/member-reports.service';
import { AttendanceReportsService } from '../services/attendance-reports.service';
import { FinancialReportsService } from '../services/financial-reports.service';

@Injectable()
export class ReportingService {
  constructor(
    private prisma: PrismaService,
    private memberReportsService: MemberReportsService,
    private attendanceReportsService: AttendanceReportsService,
    private financialReportsService: FinancialReportsService,
  ) {}

  async generateReport(
    reportType: string,
    filter: ReportFilterInput = {},
    outputFormat: OutputFormat = OutputFormat.JSON,
  ): Promise<ReportOutput> {
    let data: any;

    // Ensure filter is always an object
    const safeFilter: ReportFilterInput = filter || {};

    // Route to the appropriate service based on report type
    switch (reportType) {
      case 'MEMBER_LIST':
        data = await this.memberReportsService.getMemberListReport(safeFilter);
        break;
      case 'MEMBER_DEMOGRAPHICS':
        data = await this.memberReportsService.getMemberDemographicsReport(
          safeFilter.branchId,
          safeFilter.organisationId,
          safeFilter.dateRange,
        );
        break;
      case 'ATTENDANCE_SUMMARY':
        data =
          await this.attendanceReportsService.getAttendanceSummaryReport(
            safeFilter,
          );
        break;
      case 'ATTENDANCE_TREND':
        data = await this.attendanceReportsService.getAttendanceTrendReport(
          safeFilter.branchId,
          safeFilter.organisationId,
          safeFilter.eventTypeId,
          safeFilter.dateRange,
        );
        break;
      case 'FINANCIAL_CONTRIBUTIONS':
        data =
          await this.financialReportsService.getContributionsReport(safeFilter);
        break;
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    // If format is not JSON, generate a file and return a download URL
    let downloadUrl: string | undefined;
    if (outputFormat !== OutputFormat.JSON) {
      downloadUrl = await this.generateFileForReport(
        reportType,
        data,
        outputFormat,
      );
    }

    return {
      reportType,
      data: outputFormat === OutputFormat.JSON ? data : undefined,
      downloadUrl,
      format: outputFormat,
      generatedAt: new Date(),
      message: `${reportType} report generated successfully`,
    };
  }

  async generateFileForReport(
    reportType: string,
    data: any,
    format: OutputFormat,
  ): Promise<string> {
    // Ensure we have an await expression
    await Promise.resolve();
    // In a real implementation, this would generate the appropriate file format
    // and store it in a file system or cloud storage

    // For now, we'll just return a mock URL
    const timestamp = new Date().getTime();
    const extension = format.toLowerCase();
    return `/reports/${reportType.toLowerCase()}_${timestamp}.${extension}`;
  }
}
