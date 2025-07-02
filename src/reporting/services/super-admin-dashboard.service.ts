import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as os from 'os';
import { FinancialReportsService } from './financial-reports.service';

@Injectable()
export class SuperAdminDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financialReportsService: FinancialReportsService,
  ) {}

  // 1. Organisation Overview
  async getOrganisationOverview() {
    const organisations = await this.prisma.organisation.findMany();
    // Fetch admins and branches for each organisation
    const allBranches = await this.prisma.branch.findMany();
    const allUsers = await this.prisma.user.findMany({
      include: { roles: true },
    });
    return {
      total: organisations.length,
      organisations: organisations.map((org) => {
        const branches = allBranches.filter((b) => b.organisationId === org.id);
        // Admins: users with a role named 'super_admin' or 'admin' and matching organisationId
        const admins = allUsers.filter(
          (u) =>
            u.organisationId === org.id &&
            u.roles.some((r) => r.name === 'super_admin' || r.name === 'admin'),
        );
        return {
          id: org.id,
          name: org.name,
          branchCount: branches.length,
          adminCount: admins.length,
          branches: branches.map((b) => ({ id: b.id, name: b.name })),
          admins: admins.map((a) => ({
            id: a.id,
            name: (a.firstName || '') + ' ' + (a.lastName || ''),
          })),
        };
      }),
    };
  }

  // 2. Branches Summary
  async getBranchesSummary(organisationId?: string) {
    const where = organisationId ? { organisationId } : undefined;
    const branches = await this.prisma.branch.findMany({
      where,
      include: {
        organisation: true,
      },
    });
    return {
      total: branches.length,
      branches: branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        organisation: branch.organisation?.name,
        isActive: branch.isActive,
        // Add health indicators as needed
      })),
    };
  }

  // 3. Member Summary
  async getMemberSummary() {
    const totalMembers = await this.prisma.member.count();
    // Growth trend, demographics, etc. would be aggregated here
    // For brevity, only total is returned
    return { total: totalMembers };
  }

  // 4. Financial Overview
  async getFinancialOverview(organisationId: string) {
    // 1. Fetch all contribution type IDs by name
    const contributionTypeNames = [
      'Tithe',
      'Offering',
      'Donation',
      'Pledge',
      'Special Contribution',
    ];
    const contributionTypes = await this.prisma.contributionType.findMany({
      where: {
        name: { in: contributionTypeNames },
      },
      select: { id: true, name: true },
    });
    const typeIdMap = Object.fromEntries(
      contributionTypes.map((ct) => [ct.name.toLowerCase(), ct.id]),
    );

    // Get start and end of current month
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

    // Recreate typeIdMap for individual contribution type aggregation
    const typeIdMap2 = Object.fromEntries(
      contributionTypes.map((ct) => [ct.name.toLowerCase(), ct.id]),
    );
    // 2. Aggregate by type IDs for current month only
    const [tithes, offering, donation, pledge, specialContribution, expenses] =
      await Promise.all([
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap2['tithe'],
            organisationId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap2['offering'],
            organisationId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap2['donation'],
            organisationId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap2['pledge'],
            organisationId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap2['special contribution'],
            organisationId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.expense.aggregate({
          _sum: { amount: true },
          where: {
            organisationId,
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

    // Fetch all branches under the organisation
    const branches = await this.prisma.branch.findMany({
      where: { organisationId },
      select: { id: true, name: true },
    });

    // For each branch, sum contributions for the current month
    const branchContributions = await Promise.all(
      branches.map(async (branch) => {
        const sum = await this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            branchId: branch.id,
            organisationId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        });
        return {
          branchId: branch.id,
          branchName: branch.name,
          totalGiven: sum._sum.amount || 0,
        };
      }),
    );

    // Sort by totalGiven descending
    branchContributions.sort((a, b) => b.totalGiven - a.totalGiven);

    // Return all branches (not just top 5)
    const topGivingBranches = branchContributions;

    // Calculate new members this month for the organisation
    const newMembersThisMonth = await this.prisma.member.count({
      where: {
        organisationId,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    // Member summary
    const memberSummary = {
      total: await this.prisma.member.count({ where: { organisationId } }),
      newMembersThisMonth,
    };

    return {
      memberSummary,
      financialOverview: {
        totalContributions,
        tithes: tithes?._sum?.amount || 0,
        expenses: Number(expenses?._sum?.amount || 0),
        pledge: pledge?._sum?.amount || 0,
        offering: offering?._sum?.amount || 0,
        donation: donation?._sum?.amount || 0,
        specialContribution: specialContribution?._sum?.amount || 0,
        topGivingBranches,
      },
    };
  }

  // 4. Super Admin Dashboard Data
  async getSuperAdminDashboardData(organisationId: string) {
    // Fetch all data in parallel for dashboard
    const [
      organisationOverview,
      branchesSummary,
      attendanceOverview,
      sacramentsOverview,
      activityEngagement,
      systemHealth,
      announcements,
    ] = await Promise.all([
      this.getOrganisationOverview(),
      this.getBranchesSummary(organisationId),
      this.getAttendanceOverview(organisationId),
      this.getSacramentsOverview(organisationId),
      this.getActivityEngagement(organisationId),
      this.getSystemHealth(),
      this.getAnnouncements(organisationId),
    ]);

    // Financials & member summary (org-specific)
    // 1. Fetch all contribution type IDs for org (both org-level and branch-level)
    const contributionTypeNames = [
      'Tithe',
      'Offering',
      'Donation',
      'Pledge',
      'Special Contribution',
    ];
    const contributionTypes = await this.prisma.contributionType.findMany({
      where: {
        organisationId,
        name: { in: contributionTypeNames },
      },
      select: { id: true, name: true },
    });
    const typeIdSet = new Set(contributionTypes.map((ct) => ct.id));
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

    // Recreate typeIdMap for individual contribution type aggregation
    const typeIdMap = Object.fromEntries(
      contributionTypes.map((ct) => [ct.name.toLowerCase(), ct.id]),
    );
    // Aggregate financials
    const [tithes, offering, donation, pledge, specialContribution, expenses] =
      await Promise.all([
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap['tithe'],
            organisationId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap['offering'],
            organisationId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap['donation'],
            organisationId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap['pledge'],
            organisationId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            contributionTypeId: typeIdMap['special contribution'],
            organisationId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            organisationId,
            type: 'EXPENSE',
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        }),
      ]);

    // Branches and top giving branches
    const branches = await this.prisma.branch.findMany({
      where: { organisationId },
      select: { id: true, name: true },
    });
    // For each branch, sum contributions for the current month (any contribution type belonging to org)
    const branchContributions = await Promise.all(
      branches.map(async (branch) => {
        const sum = await this.prisma.contribution.aggregate({
          _sum: { amount: true },
          where: {
            branchId: branch.id,
            organisationId,
            contributionTypeId: { in: Array.from(typeIdSet) },
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        });
        return {
          branchId: branch.id,
          branchName: branch.name,
          totalGiven: sum._sum.amount || 0,
        };
      }),
    );
    branchContributions.sort((a, b) => b.totalGiven - a.totalGiven);

    // Calculate new members this month for the organisation
    const newMembersThisMonth = await this.prisma.member.count({
      where: {
        organisationId,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    // Member summary
    const memberSummary = {
      total: await this.prisma.member.count({ where: { organisationId } }),
      newMembersThisMonth,
    };

    return {
      organisationOverview,
      branchesSummary,
      memberSummary,
      financialOverview: {
        totalContributions:
          (tithes?._sum?.amount || 0) +
          (offering?._sum?.amount || 0) +
          (donation?._sum?.amount || 0) +
          (pledge?._sum?.amount || 0) +
          (specialContribution?._sum?.amount || 0),
        tithes: tithes?._sum?.amount || 0,
        expenses: Number(expenses?._sum?.amount || 0),
        pledge: pledge?._sum?.amount || 0,
        offering: offering?._sum?.amount || 0,
        donation: donation?._sum?.amount || 0,
        specialContribution: specialContribution?._sum?.amount || 0,
        topGivingBranches: branchContributions,
      },
      attendanceOverview,
      sacramentsOverview,
      activityEngagement,
      systemHealth,
      announcements,
    };
  }

  // 5. Attendance Overview
  async getAttendanceOverview(organisationId?: string) {
    const where = organisationId ? { organisationId } : undefined;
    const totalAttendance = await this.prisma.attendanceRecord.count({ where });
    // Add more stats as needed
    return { totalAttendance };
  }

  // 6. Sacraments Overview
  async getSacramentsOverview(organisationId?: string) {
    const where = organisationId ? { organisationId } : undefined;
    const totalSacraments = await this.prisma.sacramentalRecord.count({ where });
    // Add more stats as needed
    return { totalSacraments };
  }

  // 7. Activity Engagement
  async getActivityEngagement(organisationId?: string) {
    const now = new Date();
    const whereRecent: any = { startDate: { lte: now } };
    const whereUpcoming: any = { startDate: { gt: now } };
    if (organisationId) {
      whereRecent.organisationId = organisationId;
      whereUpcoming.organisationId = organisationId;
    }
    const recentEvents = await this.prisma.event.findMany({
      where: whereRecent,
      orderBy: { startDate: 'desc' },
      take: 5,
    });
    const upcomingEvents = await this.prisma.event.findMany({
      where: whereUpcoming,
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

  // 8. System Health & Admin Tools
  async getSystemHealth() {
    // Database health check (ping)
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
    // Aggregate CPU usage (user/system)
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
        totalMemory: Math.round(os.totalmem() / 1024 / 1024), // MB
        freeMemory: Math.round(os.freemem() / 1024 / 1024), // MB
        memoryUsage: {
          rss: Math.round(mem.rss / 1024 / 1024),
          heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
          heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
          external: Math.round(mem.external / 1024 / 1024),
        },
        cpuUsage: {
          user: Math.round(cpuUser / 1000), // ms to seconds
          system: Math.round(cpuSystem / 1000),
        },
        systemUptime: Math.round(os.uptime()), // seconds
        processUptime: Math.round(process.uptime()), // seconds
        platform: process.platform,
        nodeVersion: process.version,
      },
    };
  }

  // 9. Announcements & Communication
  async getAnnouncements(organisationId?: string) {
    const where: any = { category: 'ANNOUNCEMENT' };
    if (organisationId) where.organisationId = organisationId;
    const announcements = await this.prisma.event.findMany({
      where,
      orderBy: { startDate: 'desc' },
      take: 5,
    });
    return { announcements };
  }
}
