import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as os from 'os';

@Injectable()
export class SuperAdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

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
      organisations: organisations.map(org => {
        const branches = allBranches.filter(b => b.organisationId === org.id);
        // Admins: users with a role named 'super_admin' or 'admin' and matching organisationId
        const admins = allUsers.filter(u =>
          u.organisationId === org.id &&
          u.roles.some(r => r.name === 'super_admin' || r.name === 'admin')
        );
        return {
          id: org.id,
          name: org.name,
          branchCount: branches.length,
          adminCount: admins.length,
          branches: branches.map(b => ({ id: b.id, name: b.name })),
          admins: admins.map(a => ({ id: a.id, name: (a.firstName || '') + ' ' + (a.lastName || '') })),
        };
      }),
    };
  }

  // 2. Branches Summary
  async getBranchesSummary() {
    const branches = await this.prisma.branch.findMany({
      include: {
        organisation: true,
      },
    });
    return {
      total: branches.length,
      branches: branches.map(branch => ({
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
  async getFinancialOverview() {
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
      contributionTypes.map((ct) => [ct.name.toLowerCase(), ct.id])
    );

    // 2. Aggregate by type IDs
    const [
      tithes,
      offering,
      donation,
      pledge,
      specialContribution,
      expenses,
    ] = await Promise.all([
      this.prisma.contribution.aggregate({
        _sum: { amount: true },
        where: { contributionTypeId: typeIdMap['tithe'] },
      }),
      this.prisma.contribution.aggregate({
        _sum: { amount: true },
        where: { contributionTypeId: typeIdMap['offering'] },
      }),
      this.prisma.contribution.aggregate({
        _sum: { amount: true },
        where: { contributionTypeId: typeIdMap['donation'] },
      }),
      this.prisma.contribution.aggregate({
        _sum: { amount: true },
        where: { contributionTypeId: typeIdMap['pledge'] },
      }),
      this.prisma.contribution.aggregate({
        _sum: { amount: true },
        where: { contributionTypeId: typeIdMap['special contribution'] },
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
      }),
    ]);

    const totalContributions =
      (tithes._sum.amount || 0) +
      (offering._sum.amount || 0) +
      (donation._sum.amount || 0) +
      (pledge._sum.amount || 0) +
      (specialContribution._sum.amount || 0);

    return {
      totalContributions,
      tithes: tithes._sum.amount || 0,
      expenses: expenses._sum.amount || 0,
      pledge: pledge._sum.amount || 0,
      offering: offering._sum.amount || 0,
      donation: donation._sum.amount || 0,
      specialContribution: specialContribution._sum.amount || 0,
    };
  }

  // 5. Attendance Overview
  async getAttendanceOverview() {
    const totalAttendance = await this.prisma.attendanceRecord.count();
    // Add more stats as needed
    return { totalAttendance };
  }

  // 6. Sacraments Overview
  async getSacramentsOverview() {
    const totalSacraments = await this.prisma.sacramentalRecord.count();
    // Add more stats as needed
    return { totalSacraments };
  }

  // 7. Activity Engagement
  async getActivityEngagement() {
    const now = new Date();
    const recentEvents = await this.prisma.event.findMany({
      where: {
        startDate: { lte: now },
      },
      orderBy: { startDate: 'desc' },
      take: 5,
    });
    const upcomingEvents = await this.prisma.event.findMany({
      where: {
        startDate: { gt: now },
      },
      orderBy: { startDate: 'asc' },
      take: 5,
    });
    return {
      recentEvents: recentEvents.map(e => ({ id: e.id, title: e.title, startDate: e.startDate })),
      upcomingEvents: upcomingEvents.map(e => ({ id: e.id, title: e.title, startDate: e.startDate })),
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
    const cpuUser = cpus.reduce((acc, c) => acc + c.times.user, 0) / cpus.length;
    const cpuSystem = cpus.reduce((acc, c) => acc + c.times.sys, 0) / cpus.length;

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
  async getAnnouncements() {
    const announcements = await this.prisma.event.findMany({
      where: { category: 'ANNOUNCEMENT' },
      orderBy: { startDate: 'desc' },
      take: 5,
    });
    return { announcements };
  }
}
