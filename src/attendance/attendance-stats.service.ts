import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  AttendanceStatsInput,
  AttendanceStatsPeriod,
  AttendanceStatsType,
} from './dto/attendance-stats.input';

interface RawTotalAttendanceStatRow {
  period: string;
  total: string | number; // Raw from DB might be string
}

interface RawUniqueMembersStatRow {
  period: string;
  unique_members: string | number; // Raw from DB might be string
}

interface RawVisitorsStatRow {
  period: string;
  visitors: string | number; // Raw from DB might be string
}

@Injectable()
export class AttendanceStatsService {
  private readonly logger = new Logger(AttendanceStatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates attendance statistics based on the provided input parameters
   */
  async generateAttendanceStats(input: AttendanceStatsInput) {
    const { branchId, organisationId, startDate, endDate, period, statsTypes } = input;

    // Default to weekly period if not specified
    const groupByPeriod = period || AttendanceStatsPeriod.WEEKLY;

    // Default to total attendance if not specified
    const typesToGenerate = statsTypes?.length
      ? statsTypes
      : [AttendanceStatsType.TOTAL_ATTENDANCE];

    const results = {};

    // Generate each requested stat type
    for (const statType of typesToGenerate) {
      switch (statType) {
        case AttendanceStatsType.TOTAL_ATTENDANCE:
          results[statType] = await this.getTotalAttendance(
            startDate,
            endDate,
            groupByPeriod,
            branchId,
            organisationId,
            input.sessionTypeId,
          );
          break;

        case AttendanceStatsType.UNIQUE_MEMBERS:
          results[statType] = await this.getUniqueMembers(
            startDate,
            endDate,
            groupByPeriod,
            branchId,
            organisationId,
            input.sessionTypeId,
          );
          break;

        case AttendanceStatsType.VISITORS:
          results[statType] = await this.getVisitors(
            startDate,
            endDate,
            groupByPeriod,
            branchId,
            organisationId,
            input.sessionTypeId,
          );
          break;

        case AttendanceStatsType.FIRST_TIME_VISITORS:
          results[statType] = await this.getFirstTimeVisitors(
            startDate,
            endDate,
            groupByPeriod,
            branchId,
            organisationId,
          );
          break;

        case AttendanceStatsType.GROWTH_RATE:
          results[statType] = await this.getGrowthRate(
            startDate,
            endDate,
            groupByPeriod,
            branchId,
            organisationId,
            input.sessionTypeId,
          );
          break;

        case AttendanceStatsType.RETENTION_RATE:
          results[statType] = await this.getRetentionRate(
            startDate,
            endDate,
            groupByPeriod,
            branchId,
            organisationId,
          );
          break;
      }
    }

    // Add new analytics for dashboard
    results['BY_AGE_GROUP'] = await this.getAttendanceByAgeGroup(
      startDate,
      endDate,
      branchId,
      organisationId,
    );
    results['BY_GENDER'] = await this.getAttendanceByGender(
      startDate,
      endDate,
      branchId,
      organisationId,
    );
    results['BY_BRANCH'] = await this.getAttendanceByBranch(
      startDate,
      endDate,
      organisationId,
    );
    results['BY_EVENT_TYPE'] = await this.getAttendanceByEventType(
      startDate,
      endDate,
      branchId,
      organisationId,
    );
    results['FREQUENCY'] = await this.getAttendanceFrequency(
      startDate,
      endDate,
      branchId,
      organisationId,
    );

    // Add branchId and period info to the results for the response
    return {
      ...results,
      branchId,
      organisationId,
      startDate,
      endDate,
      period: groupByPeriod,
    };
  }

  /**
   * Gets total attendance grouped by the specified period
   */
  private async getTotalAttendance(
    startDate: string,
    endDate: string,
    period: AttendanceStatsPeriod,
    branchId?: string,
    organisationId?: string,
    sessionTypeId?: string,
  ): Promise<{ period: string; total: number }[]> {
    const dateFormat = this.getDateFormatForPeriod(period);

    const params: (string | undefined)[] = [dateFormat, startDate, endDate];
    let filterClause = '1=1';
    let sessionTypeClause = '';

    if (organisationId) {
      filterClause = `ats."organisationId" = $${params.length + 1}`;
      params.push(organisationId);
    } else if (branchId) {
      filterClause = `ats."branchId" = $${params.length + 1}`;
      params.push(branchId);
    }

    if (sessionTypeId) {
      sessionTypeClause = `AND ats."type" = $${params.length + 1}`;
      params.push(sessionTypeId);
    }
    const sql = `
  SELECT 
    TO_CHAR(ats.date, $1) as period,
    COUNT(ar.id) as total
  FROM "AttendanceSession" ats
  LEFT JOIN "AttendanceRecord" ar ON ats.id = ar."sessionId"
  WHERE ${filterClause}
    AND ats.date BETWEEN $2::timestamp AND $3::timestamp
    ${sessionTypeClause}
  GROUP BY period
  ORDER BY MIN(ats.date)
`;
    const stats: RawTotalAttendanceStatRow[] =
      await this.prisma.$queryRawUnsafe(sql, ...params);

    return stats.map((row: RawTotalAttendanceStatRow) => ({
      period: row.period,
      total:
        row.total !== undefined && row.total !== null ? Number(row.total) : 0,
    }));
  }

  /**
   * Gets unique members attendance grouped by the specified period
   */
  private async getUniqueMembers(
    startDate: string,
    endDate: string,
    period: AttendanceStatsPeriod,
    branchId?: string,
    organisationId?: string,
    sessionTypeId?: string,
  ): Promise<{ period: string; unique_members: number }[]> {
    const dateFormat = this.getDateFormatForPeriod(period);

    const params: (string | undefined)[] = [dateFormat, startDate, endDate];
    let filterClause = '1=1';
    let sessionTypeClause = '';

    if (organisationId) {
      filterClause = `ats."organisationId" = $${params.length + 1}`;
      params.push(organisationId);
    } else if (branchId) {
      filterClause = `ats."branchId" = $${params.length + 1}`;
      params.push(branchId);
    }

    if (sessionTypeId) {
      sessionTypeClause = `AND ats."type" = $${params.length + 1}`;
      params.push(sessionTypeId);
    }
    const sql = `
  SELECT 
    TO_CHAR(ats.date, $1) as period,
    COUNT(DISTINCT ar."memberId") as unique_members
  FROM "AttendanceSession" ats
  LEFT JOIN "AttendanceRecord" ar ON ats.id = ar."sessionId"
  WHERE ${filterClause}
    AND ats.date BETWEEN $2::timestamp AND $3::timestamp
    AND ar."memberId" IS NOT NULL
    ${sessionTypeClause}
  GROUP BY period
  ORDER BY MIN(ats.date)
`;
    const stats: RawUniqueMembersStatRow[] = await this.prisma.$queryRawUnsafe(
      sql,
      ...params,
    );

    return stats.map((row: RawUniqueMembersStatRow) => ({
      period: row.period,
      unique_members:
        row.unique_members !== undefined && row.unique_members !== null
          ? Number(row.unique_members)
          : 0,
    }));
  }

  /**
   * Gets visitor attendance grouped by the specified period
   */
  private async getVisitors(
    startDate: string,
    endDate: string,
    period: AttendanceStatsPeriod,
    branchId?: string,
    organisationId?: string,
    sessionTypeId?: string,
  ): Promise<{ period: string; visitors: number }[]> {
    const dateFormat = this.getDateFormatForPeriod(period);

    const params: (string | undefined)[] = [dateFormat, startDate, endDate];
    let filterClause = '1=1';
    let sessionTypeClause = '';

    if (organisationId) {
      filterClause = `ats."organisationId" = $${params.length + 1}`;
      params.push(organisationId);
    } else if (branchId) {
      filterClause = `ats."branchId" = $${params.length + 1}`;
      params.push(branchId);
    }

    if (sessionTypeId) {
      sessionTypeClause = `AND ats."type" = $${params.length + 1}`;
      params.push(sessionTypeId);
    }
    const sql = `
  SELECT 
    TO_CHAR(ats.date, $1) as period,
    COUNT(ar.id) as visitors
  FROM "AttendanceSession" ats
  LEFT JOIN "AttendanceRecord" ar ON ats.id = ar."sessionId"
  WHERE ${filterClause}
    AND ats.date BETWEEN $2::timestamp AND $3::timestamp
    AND ar."memberId" IS NULL
    AND ar."visitorName" IS NOT NULL
    ${sessionTypeClause}
  GROUP BY period
  ORDER BY MIN(ats.date)
`;
    const stats: RawVisitorsStatRow[] = await this.prisma.$queryRawUnsafe(
      sql,
      ...params,
    );

    return stats.map((row: RawVisitorsStatRow) => ({
      period: row.period,
      visitors:
        row.visitors !== undefined && row.visitors !== null
          ? Number(row.visitors)
          : 0,
    }));
  }

  /**
   * Gets first-time visitor attendance grouped by the specified period
   */
  private async getFirstTimeVisitors(
    startDate: string,
    endDate: string,
    period: AttendanceStatsPeriod,
    branchId?: string,
    organisationId?: string,
  ) {
    // This is a more complex query that would require tracking visitor history
    // For now, we'll return a placeholder implementation
    this.logger.log(
      `Getting first-time visitors for ${organisationId ? `organisation ${organisationId}` : `branch ${branchId}`} from ${startDate} to ${endDate} by ${period}`,
    );

    // In a real implementation, we would query the database
    await new Promise((resolve) => setTimeout(resolve, 10)); // Dummy await to satisfy linting

    return [{ period: 'Placeholder', first_time_visitors: 0 }];
  }

  /**
   * Calculates attendance growth rate compared to previous periods
   */
  private async getGrowthRate(
    startDate: string,
    endDate: string,
    period: AttendanceStatsPeriod,
    branchId?: string,
    organisationId?: string,
    sessionTypeId?: string,
  ) {
    // This would compare current period attendance with previous periods
    this.logger.log(
      `Calculating growth rate for ${organisationId ? `organisation ${organisationId}` : `branch ${branchId}`} from ${startDate} to ${endDate} by ${period}`,
    );

    if (sessionTypeId) {
      this.logger.log(`Filtering by session type: ${sessionTypeId}`);
    }

    // In a real implementation, we would query the database
    await new Promise((resolve) => setTimeout(resolve, 10)); // Dummy await to satisfy linting

    return [{ period: 'Placeholder', growth_rate: 0 }];
  }

  /**
   * Calculates member retention rate (percentage of members who continue attending)
   */
  private async getRetentionRate(
    startDate: string,
    endDate: string,
    period: AttendanceStatsPeriod,
    branchId?: string,
    organisationId?: string,
  ) {
    // This would track which members continue to attend over time
    this.logger.log(
      `Calculating retention rate for ${organisationId ? `organisation ${organisationId}` : `branch ${branchId}`} from ${startDate} to ${endDate} by ${period}`,
    );

    // In a real implementation, we would query the database
    await new Promise((resolve) => setTimeout(resolve, 10)); // Dummy await to satisfy linting

    return [{ period: 'Placeholder', retention_rate: 0 }];
  }

  /**
   * Gets attendance grouped by age group
   */
  private async getAttendanceByAgeGroup(
    startDate: string,
    endDate: string,
    branchId?: string,
    organisationId?: string,
  ) {
    // Example age groups: '<18', '18-25', '26-35', '36-50', '51-65', '65+'
    const ageGroups = [
      { label: '<18', min: 0, max: 17 },
      { label: '18-25', min: 18, max: 25 },
      { label: '26-35', min: 26, max: 35 },
      { label: '36-50', min: 36, max: 50 },
      { label: '51-65', min: 51, max: 65 },
      { label: '65+', min: 66, max: 200 },
    ];
    const now = new Date();
    const stats: { group: string; count: number }[] = [];

    const where: Prisma.AttendanceRecordWhereInput = {
      checkInTime: { gte: startDate, lte: endDate },
    };

    if (organisationId) {
      where.session = {
        organisationId: organisationId,
      };
    } else if (branchId) {
      where.session = {
        branchId: branchId,
      };
    }

    for (const group of ageGroups) {
      const minBirth = new Date(
        now.getFullYear() - group.max,
        now.getMonth(),
        now.getDate(),
      );
      const maxBirth = new Date(
        now.getFullYear() - group.min,
        now.getMonth(),
        now.getDate(),
      );
      const count = await this.prisma.attendanceRecord.count({
        where: {
          ...where,
          member: {
            dateOfBirth: { gte: minBirth, lte: maxBirth },
          },
        },
      });
      stats.push({ group: group.label, count });
    }
    return stats;
  }

  /**
   * Gets attendance grouped by gender
   */
  private async getAttendanceByGender(
    startDate: string,
    endDate: string,
    branchId?: string,
    organisationId?: string,
  ) {
    const genders = ['Male', 'Female', 'Other'];
    const stats: { group: string; count: number }[] = [];

    const where: Prisma.AttendanceRecordWhereInput = {
      checkInTime: { gte: startDate, lte: endDate },
    };

    if (organisationId) {
      where.session = {
        organisationId: organisationId,
      };
    } else if (branchId) {
      where.session = {
        branchId: branchId,
      };
    }

    for (const gender of genders) {
      const count = await this.prisma.attendanceRecord.count({
        where: {
          ...where,
          member: {
            gender: gender,
          },
        },
      });
      stats.push({ group: gender, count });
    }
    return stats;
  }

  /**
   * Gets attendance grouped by branch, within an organization
   */
  private async getAttendanceByBranch(
    startDate: string,
    endDate: string,
    organisationId?: string,
  ) {
    const where: Prisma.AttendanceRecordWhereInput = {
      checkInTime: { gte: startDate, lte: endDate },
      session: {
        organisationId: organisationId,
      },
    };

    const records = await this.prisma.attendanceRecord.findMany({
      where,
      include: {
        session: {
          select: {
            branch: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const stats: { [key: string]: number } = {};
    for (const record of records) {
      const branchName = record.session?.branch?.name || 'Unknown';
      stats[branchName] = (stats[branchName] || 0) + 1;
    }

    return Object.entries(stats).map(([group, count]) => ({ group, count }));
  }

  /**
   * Gets attendance grouped by event type
   */
  private async getAttendanceByEventType(
    startDate: string,
    endDate: string,
    branchId?: string,
    organisationId?: string,
  ) {
    const where: Prisma.AttendanceRecordWhereInput = {
      checkInTime: { gte: startDate, lte: endDate },
    };

    if (organisationId) {
      where.session = {
        organisationId: organisationId,
      };
    } else if (branchId) {
      where.session = {
        branchId: branchId,
      };
    }

    const records = await this.prisma.attendanceRecord.findMany({
      where,
      include: {
        session: {
          select: {
            type: true,
          },
        },
      },
    });

    const stats: { [key: string]: number } = {};
    for (const record of records) {
      const eventType = record.session?.type || 'Unknown';
      stats[eventType] = (stats[eventType] || 0) + 1;
    }

    return Object.entries(stats).map(([eventType, count]) => ({
      eventType,
      count,
    }));
  }

  /**
   * Gets attendance frequency (how many times members attended)
   */
  private async getAttendanceFrequency(
    startDate: string,
    endDate: string,
    branchId?: string,
    organisationId?: string,
  ) {
    const where: Prisma.AttendanceRecordWhereInput = {
      checkInTime: { gte: startDate, lte: endDate },
      memberId: { not: null },
    };

    if (organisationId) {
      where.session = {
        organisationId: organisationId,
      };
    } else if (branchId) {
      where.session = {
        branchId: branchId,
      };
    }

    const records = await this.prisma.attendanceRecord.groupBy({
      by: ['memberId'],
      _count: {
        id: true,
      },
      where,
    });

    const frequencyMap: { [key: number]: number } = {};
    for (const record of records) {
      const count = record._count.id;
      frequencyMap[count] = (frequencyMap[count] || 0) + 1;
    }

    return Object.entries(frequencyMap).map(([label, count]) => ({
      label: `${label} time(s)`,
      count,
    }));
  }

  /**
   * Returns the appropriate date format string for SQL based on the period
   */
  private getDateFormatForPeriod(period: AttendanceStatsPeriod): string {
    switch (period) {
      case AttendanceStatsPeriod.DAILY:
        return 'YYYY-MM-DD';
      case AttendanceStatsPeriod.WEEKLY:
        return 'IYYY-IW'; // ISO year and week
      case AttendanceStatsPeriod.MONTHLY:
        return 'YYYY-MM';
      case AttendanceStatsPeriod.QUARTERLY:
        return 'YYYY-"Q"Q';
      case AttendanceStatsPeriod.YEARLY:
        return 'YYYY';
      default:
        return 'YYYY-MM-DD';
    }
  }
}
