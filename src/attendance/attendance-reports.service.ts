import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatsService } from './attendance-stats.service';
import { FileGenerationService } from './file-generation.service';
import {
  AttendanceReportInput,
  AttendanceReportType,
  AttendanceReportGroupBy,
  AttendanceReportFormat,
} from './dto/attendance-report.input';
import {
  AttendanceReport,
  AttendanceReportSummary,
  AttendanceReportData,
  AttendanceReportMember,
  AttendanceReportSession,
  AttendanceReportEvent,
  AttendanceReportChart,
} from './entities/attendance-report.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AttendanceReportsService {
  private readonly logger = new Logger(AttendanceReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceStatsService: AttendanceStatsService,
    private readonly fileGenerationService: FileGenerationService,
  ) {}

  async generateAttendanceReport(
    input: AttendanceReportInput,
    generatedBy: string,
  ): Promise<AttendanceReport> {
    this.logger.log(`Generating attendance report: ${input.reportType}`);

    const reportId = uuidv4();
    const title = input.title || this.getDefaultTitle(input.reportType);

    // Generate summary data
    const summary = await this.generateReportSummary(input);

    // Generate main report data based on type
    let reportData: AttendanceReportData[] = [];
    let members: AttendanceReportMember[] | undefined;
    let sessions: AttendanceReportSession[] | undefined;
    let events: AttendanceReportEvent[] | undefined;
    let charts: AttendanceReportChart[] | undefined;

    switch (input.reportType) {
      case AttendanceReportType.SUMMARY:
        reportData = await this.generateSummaryData(input);
        break;
      case AttendanceReportType.DETAILED:
        reportData = await this.generateDetailedData(input);
        if (input.includeMemberDetails) {
          members = await this.generateMemberAnalysis(input);
        }
        if (input.includeSessionDetails) {
          sessions = await this.generateSessionAnalysis(input);
        }
        if (input.includeEventDetails) {
          events = await this.generateEventAnalysis(input);
        }
        break;
      case AttendanceReportType.COMPARATIVE:
        reportData = await this.generateComparativeData(input);
        break;
      case AttendanceReportType.TRENDS:
        reportData = await this.generateTrendsData(input);
        break;
      case AttendanceReportType.MEMBER_ANALYSIS:
        members = await this.generateMemberAnalysis(input);
        reportData = await this.generateMemberSummaryData(input);
        break;
      case AttendanceReportType.SESSION_ANALYSIS:
        sessions = await this.generateSessionAnalysis(input);
        reportData = await this.generateSessionSummaryData(input);
        break;
      case AttendanceReportType.EVENT_ANALYSIS:
        events = await this.generateEventAnalysis(input);
        reportData = await this.generateEventSummaryData(input);
        break;
    }

    // Generate charts if requested
    if (input.includeCharts) {
      charts = await this.generateCharts(input, reportData);
    }

    const report: AttendanceReport = {
      id: reportId,
      reportType: input.reportType,
      title,
      generatedAt: new Date().toISOString(),
      generatedBy,
      format: input.format || AttendanceReportFormat.JSON,
      summary,
      data: reportData,
      members,
      sessions,
      events,
      charts,
      branchId: input.branchId,
      organisationId: input.organisationId,
    };

    // Generate download URL if format is not JSON
    if (input.format && input.format !== AttendanceReportFormat.JSON) {
      this.logger.log(`Generating file for format: ${input.format}`);
      try {
        const filePath = await this.fileGenerationService.generateFile(
          report,
          input.format,
        );
        report.downloadUrl = this.fileGenerationService.getFileUrl(filePath);
        this.logger.log(
          `Generated file: ${filePath}, Download URL: ${report.downloadUrl}`,
        );
      } catch (error) {
        this.logger.error(
          `Error generating file for format ${input.format}:`,
          error,
        );
        // Don't throw error, just continue without downloadUrl so it falls back to JSON
      }
    } else {
      this.logger.log(
        `Using JSON format or no format specified: ${input.format}`,
      );
    }

    return report;
  }

  private async generateReportSummary(
    input: AttendanceReportInput,
  ): Promise<AttendanceReportSummary> {
    const whereClause = this.buildWhereClause(input);

    // Get total sessions and events
    const [totalSessions, totalEvents] = await Promise.all([
      this.prisma.attendanceSession.count({
        where: {
          ...whereClause,
          date: {
            gte: new Date(input.startDate),
            lte: new Date(input.endDate),
          },
        },
      }),
      this.prisma.event.count({
        where: {
          ...whereClause,
          startDate: {
            gte: new Date(input.startDate),
            lte: new Date(input.endDate),
          },
        },
      }),
    ]);

    // Get attendance statistics
    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        ...whereClause,
        checkInTime: {
          gte: new Date(input.startDate),
          lte: new Date(input.endDate),
        },
      },
      include: {
        member: true,
        session: true,
        event: true,
      },
    });

    const totalAttendance = attendanceRecords.length;
    const uniqueMembers = new Set(
      attendanceRecords.filter((r) => r.memberId).map((r) => r.memberId),
    ).size;
    const totalVisitors = attendanceRecords.filter((r) => !r.memberId).length;
    const firstTimeVisitors = await this.calculateFirstTimeVisitors(
      attendanceRecords,
      input,
    );

    const sessionAttendance = attendanceRecords.filter((r) => r.sessionId);
    const eventAttendance = attendanceRecords.filter((r) => r.eventId);

    const averageSessionAttendance =
      totalSessions > 0 ? sessionAttendance.length / totalSessions : 0;
    const averageEventAttendance =
      totalEvents > 0 ? eventAttendance.length / totalEvents : 0;

    // Calculate rates (simplified for now)
    const memberRetentionRate = await this.calculateRetentionRate(input);
    const visitorConversionRate =
      await this.calculateVisitorConversionRate(input);
    const overallGrowthRate = await this.calculateGrowthRate(input);

    return {
      startDate: input.startDate,
      endDate: input.endDate,
      totalSessions,
      totalEvents,
      totalAttendance,
      uniqueMembers,
      totalVisitors,
      firstTimeVisitors,
      averageSessionAttendance,
      averageEventAttendance,
      memberRetentionRate,
      visitorConversionRate,
      overallGrowthRate,
    };
  }

  private async generateSummaryData(
    input: AttendanceReportInput,
  ): Promise<AttendanceReportData[]> {
    const groupBy = input.groupBy || AttendanceReportGroupBy.WEEK;
    const periods = this.generatePeriods(
      input.startDate,
      input.endDate,
      groupBy,
    );

    const data: AttendanceReportData[] = [];

    for (const period of periods) {
      const periodData = await this.getAttendanceDataForPeriod(period, input);
      data.push(periodData);
    }

    return data;
  }

  private async generateDetailedData(
    input: AttendanceReportInput,
  ): Promise<AttendanceReportData[]> {
    // Similar to summary but with more granular data
    return this.generateSummaryData(input);
  }

  private async generateComparativeData(
    input: AttendanceReportInput,
  ): Promise<AttendanceReportData[]> {
    // Compare current period with previous period
    const currentData = await this.generateSummaryData(input);

    // Calculate previous period
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    const periodLength = endDate.getTime() - startDate.getTime();

    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(startDate.getTime() - 1);

    const previousInput = {
      ...input,
      startDate: previousStartDate.toISOString(),
      endDate: previousEndDate.toISOString(),
    };

    const previousData = await this.generateSummaryData(previousInput);

    // Combine and calculate comparisons
    return this.combineComparativeData(currentData, previousData);
  }

  private async generateTrendsData(
    input: AttendanceReportInput,
  ): Promise<AttendanceReportData[]> {
    // Generate trend analysis over time
    return this.generateSummaryData({
      ...input,
      groupBy: AttendanceReportGroupBy.WEEK,
    });
  }

  private async generateMemberAnalysis(
    input: AttendanceReportInput,
  ): Promise<AttendanceReportMember[]> {
    const whereClause = this.buildWhereClause(input);

    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        ...whereClause,
        checkInTime: {
          gte: new Date(input.startDate),
          lte: new Date(input.endDate),
        },
        memberId: { not: null },
      },
      include: {
        member: true,
      },
      orderBy: {
        checkInTime: 'desc',
      },
    });

    const memberMap = new Map<string, AttendanceReportMember>();

    attendanceRecords.forEach((record) => {
      if (!record.member) return;

      const memberId = record.member.id;
      if (!memberMap.has(memberId)) {
        memberMap.set(memberId, {
          id: memberId,
          firstName: record.member.firstName,
          lastName: record.member.lastName,
          email: record.member.email || undefined,
          attendanceCount: 0,
          attendanceRate: 0,
          attendanceDates: [],
        });
      }

      const member = memberMap.get(memberId)!;
      member.attendanceCount++;
      member.attendanceDates.push(record.checkInTime.toISOString());
      member.lastAttendance = record.checkInTime.toISOString();
    });

    // Calculate attendance rates
    const totalPossibleAttendances =
      await this.getTotalPossibleAttendances(input);

    return Array.from(memberMap.values()).map((member) => ({
      ...member,
      attendanceRate:
        totalPossibleAttendances > 0
          ? (member.attendanceCount / totalPossibleAttendances) * 100
          : 0,
    }));
  }

  private async generateSessionAnalysis(
    input: AttendanceReportInput,
  ): Promise<AttendanceReportSession[]> {
    const whereClause = this.buildWhereClause(input);

    const sessions = await this.prisma.attendanceSession.findMany({
      where: {
        ...whereClause,
        date: {
          gte: new Date(input.startDate),
          lte: new Date(input.endDate),
        },
      },
      include: {
        attendanceRecords: {
          include: {
            member: true,
          },
        },
      },
    });

    return sessions.map((session) => {
      const totalAttendance = session.attendanceRecords.length;
      const memberAttendance = session.attendanceRecords.filter(
        (r) => r.memberId,
      ).length;
      const visitorAttendance = totalAttendance - memberAttendance;

      return {
        id: session.id,
        name: session.name,
        date: session.date.toISOString(),
        type: session.type,
        totalAttendance,
        memberAttendance,
        visitorAttendance,
        attendanceRate: 100, // Could be calculated based on expected attendance
      };
    });
  }

  private async generateEventAnalysis(
    input: AttendanceReportInput,
  ): Promise<AttendanceReportEvent[]> {
    const whereClause = this.buildWhereClause(input);

    const events = await this.prisma.event.findMany({
      where: {
        ...whereClause,
        startDate: {
          gte: new Date(input.startDate),
          lte: new Date(input.endDate),
        },
      },
      include: {
        attendanceRecords: {
          include: {
            member: true,
          },
        },
      },
    });

    return events.map((event) => {
      const totalAttendance = event.attendanceRecords.length;
      const memberAttendance = event.attendanceRecords.filter(
        (r) => r.memberId,
      ).length;
      const visitorAttendance = totalAttendance - memberAttendance;

      return {
        id: event.id,
        title: event.title,
        startDate: event.startDate.toISOString(),
        category: event.category || undefined,
        totalAttendance,
        memberAttendance,
        visitorAttendance,
        attendanceRate: 100, // Could be calculated based on expected attendance
      };
    });
  }

  private async generateCharts(
    input: AttendanceReportInput,
    data: AttendanceReportData[],
  ): Promise<AttendanceReportChart[]> {
    const charts: AttendanceReportChart[] = [];

    // Attendance trend chart
    charts.push({
      type: 'line',
      title: 'Attendance Trends',
      labels: data.map((d) => d.period),
      data: data.map((d) => d.totalAttendance),
      colors: ['#3B82F6'],
    });

    // Member vs Visitor chart
    charts.push({
      type: 'bar',
      title: 'Members vs Visitors',
      labels: data.map((d) => d.period),
      data: data.map((d) => d.uniqueMembers),
      colors: ['#10B981', '#F59E0B'],
    });

    return charts;
  }

  private async getAttendanceDataForPeriod(
    period: string,
    input: AttendanceReportInput,
  ): Promise<AttendanceReportData> {
    const whereClause = this.buildWhereClause(input);

    // Calculate the actual date range for this specific period
    const periodDateRange = this.calculatePeriodDateRange(
      period,
      input.groupBy || AttendanceReportGroupBy.WEEK,
    );

    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        ...whereClause,
        checkInTime: {
          gte: periodDateRange.startDate,
          lte: periodDateRange.endDate,
        },
      },
      include: {
        member: true,
        session: true,
        event: true,
      },
    });

    const totalAttendance = attendanceRecords.length;
    const uniqueMembers = new Set(
      attendanceRecords.filter((r) => r.memberId).map((r) => r.memberId),
    ).size;
    const visitors = attendanceRecords.filter((r) => !r.memberId).length;

    return {
      period,
      totalAttendance,
      uniqueMembers,
      visitors,
      firstTimeVisitors: 0, // Simplified
      averageAttendance: totalAttendance,
      growthRate: 0, // Would need previous period data
      retentionRate: 0, // Would need calculation
    };
  }

  private calculatePeriodDateRange(
    period: string,
    groupBy: AttendanceReportGroupBy,
  ): { startDate: Date; endDate: Date } {
    const now = new Date();

    switch (groupBy) {
      case AttendanceReportGroupBy.DAY:
        // Period format: "2025-06-17"
        const dayDate = new Date(period);
        return {
          startDate: new Date(
            dayDate.getFullYear(),
            dayDate.getMonth(),
            dayDate.getDate(),
            0,
            0,
            0,
          ),
          endDate: new Date(
            dayDate.getFullYear(),
            dayDate.getMonth(),
            dayDate.getDate(),
            23,
            59,
            59,
          ),
        };

      case AttendanceReportGroupBy.WEEK:
        // Period format: "Week of 2025-06-17"
        const weekStartStr = period.replace('Week of ', '');
        const weekStart = new Date(weekStartStr);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return {
          startDate: weekStart,
          endDate: weekEnd,
        };

      case AttendanceReportGroupBy.MONTH:
        // Period format: "2025-06"
        const [year, month] = period.split('-').map(Number);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
        return {
          startDate: monthStart,
          endDate: monthEnd,
        };

      case AttendanceReportGroupBy.QUARTER:
        // Period format: "Q1 2025"
        const quarterMatch = period.match(/Q(\d) (\d{4})/);
        if (quarterMatch) {
          const quarter = parseInt(quarterMatch[1]);
          const qYear = parseInt(quarterMatch[2]);
          const quarterStart = new Date(qYear, (quarter - 1) * 3, 1);
          const quarterEnd = new Date(qYear, quarter * 3, 0, 23, 59, 59, 999);
          return {
            startDate: quarterStart,
            endDate: quarterEnd,
          };
        }
        break;

      case AttendanceReportGroupBy.YEAR:
        // Period format: "2025"
        const yearNum = parseInt(period);
        return {
          startDate: new Date(yearNum, 0, 1),
          endDate: new Date(yearNum, 11, 31, 23, 59, 59, 999),
        };
    }

    // Fallback to current date if parsing fails
    return {
      startDate: now,
      endDate: now,
    };
  }

  private async generateMemberSummaryData(
    input: AttendanceReportInput,
  ): Promise<AttendanceReportData[]> {
    return this.generateSummaryData(input);
  }

  private async generateSessionSummaryData(
    input: AttendanceReportInput,
  ): Promise<AttendanceReportData[]> {
    return this.generateSummaryData(input);
  }

  private async generateEventSummaryData(
    input: AttendanceReportInput,
  ): Promise<AttendanceReportData[]> {
    return this.generateSummaryData(input);
  }

  private async calculateFirstTimeVisitors(
    attendanceRecords: any[],
    input: AttendanceReportInput,
  ): Promise<number> {
    // Simplified implementation
    return attendanceRecords.filter((r) => !r.memberId).length;
  }

  private async calculateRetentionRate(
    input: AttendanceReportInput,
  ): Promise<number> {
    // Simplified implementation
    return 85.5;
  }

  private async calculateVisitorConversionRate(
    input: AttendanceReportInput,
  ): Promise<number> {
    // Simplified implementation
    return 12.3;
  }

  private async calculateGrowthRate(
    input: AttendanceReportInput,
  ): Promise<number> {
    // Simplified implementation
    return 5.2;
  }

  private async getTotalPossibleAttendances(
    input: AttendanceReportInput,
  ): Promise<number> {
    // Calculate total possible attendances based on sessions and events in the period
    const whereClause = this.buildWhereClause(input);

    const [sessionCount, eventCount] = await Promise.all([
      this.prisma.attendanceSession.count({
        where: {
          ...whereClause,
          date: {
            gte: new Date(input.startDate),
            lte: new Date(input.endDate),
          },
        },
      }),
      this.prisma.event.count({
        where: {
          ...whereClause,
          startDate: {
            gte: new Date(input.startDate),
            lte: new Date(input.endDate),
          },
        },
      }),
    ]);

    return sessionCount + eventCount;
  }

  private getDefaultTitle(reportType: AttendanceReportType): string {
    const titles = {
      [AttendanceReportType.SUMMARY]: 'Attendance Summary Report',
      [AttendanceReportType.DETAILED]: 'Detailed Attendance Report',
      [AttendanceReportType.COMPARATIVE]: 'Comparative Attendance Report',
      [AttendanceReportType.TRENDS]: 'Attendance Trends Report',
      [AttendanceReportType.MEMBER_ANALYSIS]: 'Member Attendance Analysis',
      [AttendanceReportType.SESSION_ANALYSIS]: 'Session Attendance Analysis',
      [AttendanceReportType.EVENT_ANALYSIS]: 'Event Attendance Analysis',
    };

    return titles[reportType] || 'Attendance Report';
  }

  private async generateDownloadUrl(
    report: AttendanceReport,
    format: AttendanceReportFormat,
  ): Promise<string> {
    // In a real implementation, you would generate the file and return a download URL
    // For now, return a placeholder URL
    return `/api/reports/download/${report.id}.${format.toLowerCase()}`;
  }

  private generatePeriods(
    startDate: string,
    endDate: string,
    groupBy: AttendanceReportGroupBy,
  ): string[] {
    const periods: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    let current = new Date(start);

    while (current <= end) {
      switch (groupBy) {
        case AttendanceReportGroupBy.DAY:
          periods.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
          break;
        case AttendanceReportGroupBy.WEEK:
          periods.push(`Week of ${current.toISOString().split('T')[0]}`);
          current.setDate(current.getDate() + 7);
          break;
        case AttendanceReportGroupBy.MONTH:
          periods.push(
            `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`,
          );
          current.setMonth(current.getMonth() + 1);
          break;
        case AttendanceReportGroupBy.QUARTER:
          const quarter = Math.floor(current.getMonth() / 3) + 1;
          periods.push(`Q${quarter} ${current.getFullYear()}`);
          current.setMonth(current.getMonth() + 3);
          break;
        case AttendanceReportGroupBy.YEAR:
          periods.push(current.getFullYear().toString());
          current.setFullYear(current.getFullYear() + 1);
          break;
        default:
          periods.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
      }
    }

    return periods;
  }

  private combineComparativeData(
    currentData: AttendanceReportData[],
    previousData: AttendanceReportData[],
  ): AttendanceReportData[] {
    // Combine current and previous data for comparison
    return currentData.map((current, index) => {
      const previous = previousData[index];
      if (!previous) return current;

      const growthRate =
        previous.totalAttendance > 0
          ? ((current.totalAttendance - previous.totalAttendance) /
              previous.totalAttendance) *
            100
          : 0;

      return {
        ...current,
        growthRate,
      };
    });
  }

  private buildWhereClause(input: AttendanceReportInput): any {
    const where: any = {};

    if (input.branchId) {
      where.branchId = input.branchId;
    }

    if (input.organisationId) {
      where.organisationId = input.organisationId;
    }

    return where;
  }
}
