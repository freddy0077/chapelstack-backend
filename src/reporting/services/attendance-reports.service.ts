import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportFilterInput, DateRangeInput } from '../dto/report-filter.input';
import { AttendanceTrendData } from '../entities/attendance-trend-data.entity';

@Injectable()
export class AttendanceReportsService {
  constructor(private prisma: PrismaService) {}

  async getAttendanceSummaryReport(filter: ReportFilterInput): Promise<any> {
    const { branchId, organisationId, dateRange, eventTypeId } = filter;

    // Build the where clause based on filters
    const where: any = {};

    if (branchId) {
      where.branchId = branchId;
    }

    if (organisationId) {
      where.organisationId = organisationId;
    }

    // Since eventType doesn't exist, we'll modify this
    // If we need to filter by event type, we would need to adjust this
    // based on the actual schema structure

    if (dateRange) {
      where.checkInTime = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      };
    }

    // Query the database for attendance records
    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where,
      include: {
        session: {
          select: {
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        checkInTime: 'asc',
      },
    });

    // Fetch branch info if needed
    let branchName = '';
    if (branchId && attendanceRecords.length > 0) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
        select: { name: true },
      });
      branchName = branch?.name || '';
    }

    // Group by session type and calculate totals
    const sessionTypeSummary: Record<
      string,
      { count: number; events: Record<string, number> }
    > = {};
    let totalAttendance = 0;

    attendanceRecords.forEach((record) => {
      const sessionType = record.session?.type || 'Unknown';
      if (!sessionTypeSummary[sessionType]) {
        sessionTypeSummary[sessionType] = {
          count: 0,
          events: {},
        };
      }

      const sessionName = record.session?.name || 'Unknown';
      if (!sessionTypeSummary[sessionType].events[sessionName]) {
        sessionTypeSummary[sessionType].events[sessionName] = 0;
      }

      // Assuming each record represents one attendance
      const attendanceCount = 1;
      sessionTypeSummary[sessionType].count += attendanceCount;
      sessionTypeSummary[sessionType].events[sessionName] += attendanceCount;
      totalAttendance += attendanceCount;
    });

    // Convert to array format
    const eventTypes = Object.entries(sessionTypeSummary).map(
      ([name, data]) => ({
        name,
        count: data.count,
        percentage:
          totalAttendance > 0 ? (data.count / totalAttendance) * 100 : 0,
        events: Object.entries(data.events).map(([eventName, count]) => ({
          name: eventName,
          count,
          percentage: data.count > 0 ? (count / data.count) * 100 : 0,
        })),
      }),
    );

    return {
      totalAttendance,
      eventTypes,
      dateRange: {
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
      },
      branchId,
      organisationId,
      branchName,
    };
  }

  async getAttendanceTrendReport(
    branchId?: string,
    organisationId?: string,
    eventTypeId?: string,
    dateRange?: DateRangeInput,
  ): Promise<AttendanceTrendData> {
    // Build the where clause based on filters
    const where: any = {};

    if (branchId) {
      where.branchId = branchId;
    }

    if (organisationId) {
      where.organisationId = organisationId;
    }

    // We can't filter by eventTypeId directly since it doesn't exist
    // We could filter by session type if needed

    const startDate =
      dateRange?.startDate ||
      new Date(new Date().setMonth(new Date().getMonth() - 6));
    const endDate = dateRange?.endDate || new Date();

    where.checkInTime = {
      gte: startDate,
      lte: endDate,
    };

    // Get branch name
    const branch = branchId
      ? await this.prisma.branch.findUnique({
          where: { id: branchId },
          select: { name: true },
        })
      : null;

    // Query the database for attendance records
    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where,
      select: {
        checkInTime: true,
      },
      orderBy: {
        checkInTime: 'asc',
      },
    });

    // Group by week or month depending on the date range
    const isLongPeriod =
      endDate.getTime() - startDate.getTime() > 90 * 24 * 60 * 60 * 1000; // 90 days
    const groupedData: Record<string, { date: Date; count: number }> = {};

    attendanceRecords.forEach((record) => {
      let key;
      if (isLongPeriod) {
        // Group by month
        key = `${record.checkInTime.getFullYear()}-${record.checkInTime.getMonth() + 1}`;
      } else {
        // Group by week
        const weekNumber = Math.floor(
          (record.checkInTime.getTime() - startDate.getTime()) /
            (7 * 24 * 60 * 60 * 1000),
        );
        key = `week-${weekNumber}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          date: new Date(record.checkInTime),
          count: 0,
        };
      }

      // Each record counts as 1 attendance
      groupedData[key].count += 1;
    });

    // Convert to array and calculate percent changes
    const trendData = Object.values(groupedData).map((data, index, array) => {
      const previousData = index > 0 ? array[index - 1] : { count: 0 };
      const percentChange =
        previousData.count > 0
          ? ((data.count - previousData.count) / previousData.count) * 100
          : undefined; // Changed from null to undefined to match AttendanceDataPoint type

      return {
        date: data.date,
        count: data.count,
        percentChange,
      };
    });

    // Calculate total and average attendance
    const totalAttendance = trendData.reduce(
      (sum, data) => sum + data.count,
      0,
    );
    const averageAttendance =
      trendData.length > 0 ? totalAttendance / trendData.length : 0;

    // Calculate percent change from previous period
    let percentChangeFromPreviousPeriod: number | undefined = undefined;
    if (trendData.length > 1) {
      const currentPeriodTotal = trendData
        .slice(Math.floor(trendData.length / 2))
        .reduce((sum, data) => sum + Number(data.count), 0);
      const previousPeriodTotal = trendData
        .slice(0, Math.floor(trendData.length / 2))
        .reduce((sum, data) => sum + Number(data.count), 0);

      if (previousPeriodTotal > 0) {
        percentChangeFromPreviousPeriod =
          ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) *
          100;
      }
    }

    // Get event type name if eventTypeId is provided
    let eventTypeName = '';
    if (eventTypeId) {
      const sessionType = await this.prisma.attendanceSession.findFirst({
        where: { id: eventTypeId },
        select: { type: true },
      });
      eventTypeName = sessionType?.type || '';
    }

    return {
      branchId,
      organisationId,
      branchName: branch?.name,
      eventTypeId,
      eventTypeName,
      startDate,
      endDate,
      totalAttendance,
      averageAttendance,
      percentChangeFromPreviousPeriod,
      trendData,
    };
  }
}
