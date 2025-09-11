import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as os from 'os';
import { FinancialReportsService } from './financial-reports.service';

@Injectable()
export class BranchDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financialReportsService: FinancialReportsService,
  ) {}

  // Branch Overview (for a single branch)
  async getBranchOverview(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { organisation: true },
    });
    if (!branch) {
      throw new Error(`Branch not found for id: ${branchId}`);
    }
    const admins = await this.prisma.user.findMany({
      where: {
        roles: { some: { name: { in: ['admin', 'branch_admin'] } } },
        userBranches: { some: { branchId } },
      },
    });
    return {
      id: branch.id,
      name: branch.name,
      organisation: branch.organisation?.name,
      isActive: branch.isActive,
      admins: admins.map((a) => ({
        id: a.id,
        name: (a.firstName || '') + ' ' + (a.lastName || ''),
      })),
    };
  }

  // Member Summary (for a single branch)
  async getMemberSummary(branchId: string) {
    // Get total active members (excluding deactivated)
    const totalMembers = await this.prisma.member.count({
      where: {
        branchId,
        isDeactivated: false,
      },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // New members this month
    const newMembersThisMonth = await this.prisma.member.count({
      where: {
        branchId,
        isDeactivated: false,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    // Get historical trends for the past 12 months
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthlyTrends: Array<{
      month: number;
      year: number;
      totalMembers: number;
      newMembers: number;
    }> = [];

    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const startOfTargetMonth = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        1,
      );
      const endOfTargetMonth = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const membersCount = await this.prisma.member.count({
        where: {
          branchId,
          isDeactivated: false,
          createdAt: { lte: endOfTargetMonth },
        },
      });

      const newMembersInMonth = await this.prisma.member.count({
        where: {
          branchId,
          isDeactivated: false,
          createdAt: { gte: startOfTargetMonth, lte: endOfTargetMonth },
        },
      });

      monthlyTrends.push({
        month: targetDate.getMonth() + 1,
        year: targetDate.getFullYear(),
        totalMembers: membersCount,
        newMembers: newMembersInMonth,
      });
    }

    // Calculate growth rate (current month vs previous month)
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const previousMonthTotal = await this.prisma.member.count({
      where: {
        branchId,
        isDeactivated: false,
        createdAt: { lte: previousMonthEnd },
      },
    });

    const growthRate =
      previousMonthTotal > 0
        ? ((totalMembers - previousMonthTotal) / previousMonthTotal) * 100
        : 0;

    return {
      total: totalMembers,
      newMembersThisMonth,
      growthRate: Math.round(growthRate * 100) / 100, // Round to 2 decimal places
      monthlyTrends,
    };
  }

  // Financial Overview (for a single branch) - Using Transaction Model Only
  async getFinancialOverview(branchId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Get total contributions (CONTRIBUTION type transactions) for current month
    const currentMonthContributions = await this.prisma.transaction.aggregate({
      where: {
        branchId,
        type: 'CONTRIBUTION',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    // Get total expenses (EXPENSE type transactions) for current month
    const currentMonthExpenses = await this.prisma.transaction.aggregate({
      where: {
        branchId,
        type: 'EXPENSE',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    const totalContributions = Number(
      currentMonthContributions._sum.amount || 0,
    );
    const totalExpenses = Number(currentMonthExpenses._sum.amount || 0);

    // Get breakdown by transaction categories/descriptions
    const contributionBreakdown = await this.prisma.transaction.groupBy({
      by: ['description'],
      where: {
        branchId,
        type: 'CONTRIBUTION',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
      _count: true,
    });

    // Map common contribution types
    const getContributionByType = (type: string) => {
      const found = contributionBreakdown.find((item) =>
        item.description?.toLowerCase().includes(type.toLowerCase()),
      );
      return Number(found?._sum?.amount || 0);
    };

    const tithes = getContributionByType('tithe');
    const offering = getContributionByType('offering');
    const donation = getContributionByType('donation');
    const pledge = getContributionByType('pledge');
    const specialContribution = getContributionByType('special');

    // Calculate previous month for growth rate
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const previousMonthContributions = await this.prisma.transaction.aggregate({
      where: {
        branchId,
        type: 'CONTRIBUTION',
        date: { gte: startOfPrevMonth, lte: endOfPrevMonth },
      },
      _sum: { amount: true },
    });

    const previousTotal = Number(previousMonthContributions._sum.amount || 0);
    const growthRate =
      previousTotal > 0
        ? ((totalContributions - previousTotal) / previousTotal) * 100
        : 0;

    // Get 12-month trends using Transaction model
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthlyTrends: {
      month: number;
      year: number;
      contributions: number;
      expenses: number;
      netIncome: number;
    }[] = [];

    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const startOfTargetMonth = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        1,
      );
      const endOfTargetMonth = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const [monthlyContributions, monthlyExpenses] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            branchId,
            type: 'CONTRIBUTION',
            date: { gte: startOfTargetMonth, lte: endOfTargetMonth },
          },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            branchId,
            type: 'EXPENSE',
            date: { gte: startOfTargetMonth, lte: endOfTargetMonth },
          },
          _sum: { amount: true },
        }),
      ]);

      const monthContributions = Number(monthlyContributions._sum.amount || 0);
      const monthExpenses = Number(monthlyExpenses._sum.amount || 0);

      monthlyTrends.push({
        month: targetDate.getMonth() + 1,
        year: targetDate.getFullYear(),
        contributions: monthContributions,
        expenses: monthExpenses,
        netIncome: monthContributions - monthExpenses,
      });
    }

    return {
      totalContributions,
      totalExpenses,
      tithes,
      offering,
      donation,
      pledge,
      specialContribution,
      growthRate: Math.round(growthRate * 100) / 100,
      netIncome: totalContributions - totalExpenses,
      monthlyTrends,
    };
  }

  // Attendance Overview (for a single branch)
  async getAttendanceOverview(branchId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Total attendance records for current month
    const totalAttendance = await this.prisma.attendanceRecord.count({
      where: {
        branchId,
        checkInTime: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    // Get unique attendees for current month
    const uniqueAttendeesThisMonth = await this.prisma.attendanceRecord.groupBy(
      {
        by: ['memberId'],
        where: {
          branchId,
          checkInTime: { gte: startOfMonth, lte: endOfMonth },
          memberId: { not: null },
        },
        _count: { memberId: true },
      },
    );

    // Get historical trends for the past 12 months
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthlyTrends: {
      month: number;
      year: number;
      totalAttendance: number;
      uniqueAttendees: number;
    }[] = [];

    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const startOfTargetMonth = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        1,
      );
      const endOfTargetMonth = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const monthlyAttendance = await this.prisma.attendanceRecord.count({
        where: {
          branchId,
          checkInTime: { gte: startOfTargetMonth, lte: endOfTargetMonth },
        },
      });

      const uniqueAttendees = await this.prisma.attendanceRecord.groupBy({
        by: ['memberId'],
        where: {
          branchId,
          checkInTime: { gte: startOfTargetMonth, lte: endOfTargetMonth },
          memberId: { not: null },
        },
        _count: { memberId: true },
      });

      monthlyTrends.push({
        month: targetDate.getMonth() + 1,
        year: targetDate.getFullYear(),
        totalAttendance: monthlyAttendance,
        uniqueAttendees: uniqueAttendees.length,
      });
    }

    // Calculate average attendance over the past 12 months
    const totalAttendanceRecords = monthlyTrends.reduce(
      (sum, trend) => sum + trend.totalAttendance,
      0,
    );
    const averageAttendance =
      monthlyTrends.length > 0
        ? Math.round(totalAttendanceRecords / monthlyTrends.length)
        : 0;

    // Calculate growth rate (current month vs previous month)
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const previousMonthAttendance = await this.prisma.attendanceRecord.count({
      where: {
        branchId,
        checkInTime: { gte: previousMonthStart, lte: previousMonthEnd },
      },
    });

    const growthRate =
      previousMonthAttendance > 0
        ? ((totalAttendance - previousMonthAttendance) /
            previousMonthAttendance) *
          100
        : 0;

    return {
      totalAttendance,
      uniqueAttendeesThisMonth: uniqueAttendeesThisMonth.length,
      averageAttendance,
      growthRate: Math.round(growthRate * 100) / 100, // Round to 2 decimal places
      monthlyTrends,
    };
  }

  // Sacraments Overview (for a single branch)
  async getSacramentsOverview(branchId: string) {
    // Get total sacraments count (excluding deactivated members)
    const totalSacraments = await this.prisma.sacramentalRecord.count({
      where: {
        branchId,
        member: { isDeactivated: false },
      },
    });

    // Get breakdown by sacrament type
    const sacramentsByType = await this.prisma.sacramentalRecord.groupBy({
      by: ['sacramentType'],
      where: {
        branchId,
        member: { isDeactivated: false },
      },
      _count: true,
    });

    // Get monthly trends for current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const monthlyTrends = await this.prisma.sacramentalRecord.groupBy({
      by: ['dateOfSacrament'],
      where: {
        branchId,
        member: { isDeactivated: false },
        dateOfSacrament: { gte: startOfYear, lte: endOfYear },
      },
      _count: true,
    });

    // Process monthly trends data
    const monthlyData = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthRecords = monthlyTrends.filter(
        (record) => record.dateOfSacrament.getMonth() + 1 === month,
      );
      return {
        month: month,
        count: monthRecords.reduce((sum, record) => sum + record._count, 0),
      };
    });

    // Format sacrament breakdown
    const breakdown = sacramentsByType.map((item) => ({
      type: item.sacramentType,
      count: item._count,
    }));

    return {
      totalSacraments,
      breakdown,
      monthlyTrends: monthlyData,
    };
  }

  // Activity Engagement (for a single branch)
  async getActivityEngagement(branchId: string) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get recent events
    const recentEvents = await this.prisma.event.findMany({
      where: { branchId, startDate: { lte: now } },
      orderBy: { startDate: 'desc' },
      take: 5,
    });

    // Get upcoming events
    const upcomingEvents = await this.prisma.event.findMany({
      where: { branchId, startDate: { gt: now } },
      orderBy: { startDate: 'asc' },
      take: 5,
    });

    // Get recent activities from the past 7 days
    const [
      recentMembers,
      recentContributions,
      recentSacraments,
      recentAttendance,
    ] = await Promise.all([
      // New members in the past 7 days
      this.prisma.member.findMany({
        where: {
          branchId,
          isDeactivated: false,
          createdAt: { gte: sevenDaysAgo },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Recent contributions in the past 7 days
      this.prisma.transaction.findMany({
        where: {
          branchId,
          type: 'CONTRIBUTION',
          date: { gte: sevenDaysAgo },
        },
        select: {
          id: true,
          amount: true,
          date: true,
          description: true,
        },
        orderBy: { date: 'desc' },
        take: 5,
      }),

      // Recent sacraments in the past 7 days
      this.prisma.sacramentalRecord.findMany({
        where: {
          branchId,
          dateOfSacrament: { gte: sevenDaysAgo },
          member: { isDeactivated: false },
        },
        select: {
          id: true,
          sacramentType: true,
          dateOfSacrament: true,
          member: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { dateOfSacrament: 'desc' },
        take: 5,
      }),

      // Recent attendance records in the past 7 days
      this.prisma.attendanceRecord.count({
        where: {
          branchId,
          checkInTime: { gte: sevenDaysAgo },
        },
      }),
    ]);

    // Calculate activity summary
    const activitySummary = {
      newMembersCount: recentMembers.length,
      contributionsCount: recentContributions.length,
      sacramentsCount: recentSacraments.length,
      attendanceRecordsCount: recentAttendance,
      totalActivities:
        recentMembers.length +
        recentContributions.length +
        recentSacraments.length,
    };

    return {
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        title: e.title,
        startDate: e.startDate,
      })),
      upcomingEvents: upcomingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        startDate: e.startDate,
      })),
      recentMembers: recentMembers.map((m) => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        joinedAt: m.createdAt,
      })),
      recentContributions: recentContributions.map((c) => ({
        id: c.id,
        amount: c.amount,
        date: c.date,
        type: c.description || 'General Contribution',
      })),
      recentSacraments: recentSacraments.map((s) => ({
        id: s.id,
        type: s.sacramentType,
        date: s.dateOfSacrament,
        memberName: `${s.member.firstName} ${s.member.lastName}`,
      })),
      activitySummary,
    };
  }

  // System Health (shared)
  async getSystemHealth() {
    const dbStart = Date.now();
    let dbStatus = 'OK';
    let dbLatency = 0;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStart;
    } catch (e) {
      dbStatus = 'ERROR';
      dbLatency = -1;
    }
    const mem = process.memoryUsage();
    const cpus = os.cpus();
    const cpuUser =
      cpus.reduce((acc, c) => acc + c.times.user, 0) / cpus.length;
    const cpuSystem =
      cpus.reduce((acc, c) => acc + c.times.sys, 0) / cpus.length;
    return {
      timestamp: new Date(),
      database: {
        status: dbStatus,
        latency: dbLatency,
      },
      system: {
        totalMemory: Math.round(os.totalmem() / 1024 / 1024),
        freeMemory: Math.round(os.freemem() / 1024 / 1024),
        memoryUsage: {
          rss: Math.round(mem.rss / 1024 / 1024),
          heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
          heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
          external: Math.round(mem.external / 1024 / 1024),
        },
        cpuUsage: {
          user: Math.round(cpuUser / 1000),
          system: Math.round(cpuSystem / 1000),
        },
        systemUptime: Math.round(os.uptime()),
        processUptime: Math.round(process.uptime()),
        platform: process.platform,
        nodeVersion: process.version,
      },
    };
  }

  // Announcements (for a single branch)
  async getAnnouncements(branchId: string) {
    const announcements = await this.prisma.event.findMany({
      where: { branchId, category: 'ANNOUNCEMENT' },
      orderBy: { startDate: 'desc' },
      take: 5,
    });
    return { announcements };
  }

  // Main Branch Dashboard Data
  async getBranchDashboardData(branchId: string) {
    const [
      branchInfo,
      memberStats,
      financeStats,
      attendanceStats,
      sacramentStats,
      activityStats,
      systemStatus,
      branchAnnouncements,
    ] = await Promise.all([
      this.getBranchOverview(branchId),
      this.getMemberSummary(branchId),
      this.getFinancialOverview(branchId),
      this.getAttendanceOverview(branchId),
      this.getSacramentsOverview(branchId),
      this.getActivityEngagement(branchId),
      this.getSystemHealth(),
      this.getAnnouncements(branchId),
    ]);
    return {
      branchInfo,
      memberStats,
      financeStats,
      attendanceStats,
      sacramentStats,
      activityStats,
      systemStatus,
      branchAnnouncements,
    };
  }
}
