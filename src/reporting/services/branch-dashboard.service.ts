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
    const totalMembers = await this.prisma.member.count({
      where: { branchId },
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
    const newMembersThisMonth = await this.prisma.member.count({
      where: {
        branchId,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });
    return { total: totalMembers, newMembersThisMonth };
  }

  // Financial Overview (for a single branch)
  async getFinancialOverview(branchId: string) {
    const contributionTypeNames = [
      'Tithe',
      'Offering',
      'Donation',
      'Pledge',
      'Special Contribution',
    ];
    const contributionTypes = await this.prisma.contributionType.findMany({
      where: { name: { in: contributionTypeNames } },
      select: { id: true, name: true },
    });
    const typeIdMap = Object.fromEntries(
      contributionTypes.map((ct) => [ct.name.toLowerCase(), ct.id]),
    );
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
    const [tithes, offering, donation, pledge, specialContribution, expenses] =
      await Promise.all([
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap['tithe'],
            branchId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap['offering'],
            branchId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap['donation'],
            branchId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap['pledge'],
            branchId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap['special contribution'],
            branchId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.expense.aggregate({
          _sum: { amount: true },
          where: {
            branchId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
      ]);
    const totalContributions =
      (tithes?._sum?.amount || 0) +
      (offering?._sum?.amount || 0) +
      (donation?._sum?.amount || 0) +
      (pledge?._sum?.amount || 0) +
      (specialContribution?._sum?.amount || 0);
    return {
      totalContributions,
      tithes: tithes?._sum?.amount || 0,
      expenses: Number(expenses?._sum?.amount || 0),
      pledge: pledge?._sum?.amount || 0,
      offering: offering?._sum?.amount || 0,
      donation: donation?._sum?.amount || 0,
      specialContribution: specialContribution?._sum?.amount || 0,
    };
  }

  // Attendance Overview (for a single branch)
  async getAttendanceOverview(branchId: string) {
    const totalAttendance = await this.prisma.attendanceRecord.count({
      where: { branchId },
    });
    return { totalAttendance };
  }

  // Sacraments Overview (for a single branch)
  async getSacramentsOverview(branchId: string) {
    const totalSacraments = await this.prisma.sacramentalRecord.count({
      where: { branchId },
    });
    return { totalSacraments };
  }

  // Activity Engagement (for a single branch)
  async getActivityEngagement(branchId: string) {
    const now = new Date();
    const recentEvents = await this.prisma.event.findMany({
      where: { branchId, startDate: { lte: now } },
      orderBy: { startDate: 'desc' },
      take: 5,
    });
    const upcomingEvents = await this.prisma.event.findMany({
      where: { branchId, startDate: { gt: now } },
      orderBy: { startDate: 'asc' },
      take: 5,
    });
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
