import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SystemHealthMetrics {
  status: 'online' | 'offline';
  uptime: number;
  avgResponseTime: number;
  errorRate: number;
  databaseStatus: 'healthy' | 'degraded' | 'offline';
  databaseSize: string;
}

export interface KeyMetrics {
  totalUsers: number;
  userGrowth: number;
  totalOrganizations: number;
  organizationGrowth: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  systemLoad: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export interface DashboardOverview {
  systemHealth: SystemHealthMetrics;
  keyMetrics: KeyMetrics;
  recentActivities: any[];
  alerts: any[];
}

@Injectable()
export class GodModeDashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get complete dashboard overview for God Mode
   */
  async getDashboardOverview(): Promise<DashboardOverview> {
    const [systemHealth, keyMetrics, recentActivities, alerts] = await Promise.all([
      this.getSystemHealth(),
      this.getKeyMetrics(),
      this.getRecentActivities(),
      this.getAlerts(),
    ]);

    return {
      systemHealth,
      keyMetrics,
      recentActivities,
      alerts,
    };
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth(): Promise<SystemHealthMetrics> {
    const now = Date.now();
    const startTime = process.uptime() * 1000;
    const uptime = (now - startTime) / 1000 / 60; // in minutes

    // Calculate error rate from recent audit logs
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentLogs = await this.prisma.auditLog.count({
      where: {
        createdAt: {
          gte: lastHour,
        },
      },
    });

    // Estimate error rate (logs with error in action or description)
    const errorLogs = await this.prisma.auditLog.count({
      where: {
        createdAt: {
          gte: lastHour,
        },
        OR: [
          { action: { contains: 'ERROR' } },
          { description: { contains: 'error' } },
        ],
      },
    });

    const errorRate = recentLogs > 0 ? errorLogs / recentLogs : 0;

    return {
      status: 'online',
      uptime: Math.round(uptime * 10) / 10,
      avgResponseTime: 145, // Average response time in ms (can be enhanced with middleware tracking)
      errorRate: Math.round(errorRate * 10000) / 10000,
      databaseStatus: 'healthy',
      databaseSize: '2.5 GB', // Can be enhanced with actual database size query
    };
  }

  /**
   * Get key metrics
   */
  async getKeyMetrics(): Promise<KeyMetrics> {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      users,
      organizations,
      subscriptions,
      usersLastMonth,
      organizationsLastMonth,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.organisation.count(),
      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            lt: lastMonth,
          },
        },
      }),
      this.prisma.organisation.count({
        where: {
          createdAt: {
            lt: lastMonth,
          },
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          createdAt: {
            gte: lastMonth,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Calculate growth percentages
    const userGrowth =
      usersLastMonth > 0 ? ((users - usersLastMonth) / usersLastMonth) * 100 : 0;
    const organizationGrowth =
      organizationsLastMonth > 0
        ? ((organizations - organizationsLastMonth) / organizationsLastMonth) * 100
        : 0;

    // Get system load from OS
    const os = require('os');
    const cpuUsage = (os.loadavg()[0] / os.cpus().length) * 100;
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

    return {
      totalUsers: users,
      userGrowth: Math.round(userGrowth * 10) / 10,
      totalOrganizations: organizations,
      organizationGrowth: Math.round(organizationGrowth * 10) / 10,
      activeSubscriptions: subscriptions,
      monthlyRecurringRevenue: totalRevenue._sum.amount
        ? Number(totalRevenue._sum.amount)
        : 0,
      systemLoad: {
        cpu: Math.round(cpuUsage * 10) / 10,
        memory: Math.round(memoryUsage * 10) / 10,
        disk: 78, // Disk usage requires additional system calls, keeping as placeholder
      },
    };
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<any[]> {
    const auditLogs = await this.prisma.auditLog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        userId: true,
        action: true,
        entityType: true,
        entityId: true,
        description: true,
        metadata: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return auditLogs;
  }

  /**
   * Get system alerts
   */
  async getAlerts(): Promise<any[]> {
    const alerts: any[] = [];
    const os = require('os');

    // Check memory usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

    if (memoryUsage > 80) {
      alerts.push({
        id: 'memory-high',
        type: 'error',
        message: `Critical memory usage: ${Math.round(memoryUsage)}%`,
        severity: 'high',
        timestamp: new Date(),
      });
    } else if (memoryUsage > 70) {
      alerts.push({
        id: 'memory-warning',
        type: 'warning',
        message: `High memory usage: ${Math.round(memoryUsage)}%`,
        severity: 'medium',
        timestamp: new Date(),
      });
    }

    // Check CPU usage
    const cpuUsage = (os.loadavg()[0] / os.cpus().length) * 100;
    if (cpuUsage > 80) {
      alerts.push({
        id: 'cpu-high',
        type: 'error',
        message: `High CPU usage: ${Math.round(cpuUsage)}%`,
        severity: 'high',
        timestamp: new Date(),
      });
    }

    // Check for recent errors in audit logs
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const errorCount = await this.prisma.auditLog.count({
      where: {
        createdAt: {
          gte: lastHour,
        },
        OR: [
          { action: { contains: 'ERROR' } },
          { description: { contains: 'error' } },
        ],
      },
    });

    if (errorCount > 10) {
      alerts.push({
        id: 'errors-high',
        type: 'warning',
        message: `${errorCount} errors detected in the last hour`,
        severity: 'medium',
        timestamp: new Date(),
      });
    }

    // If no alerts, return a success message
    if (alerts.length === 0) {
      alerts.push({
        id: 'system-healthy',
        type: 'success',
        message: 'All systems operational',
        severity: 'low',
        timestamp: new Date(),
      });
    }

    return alerts;
  }

  /**
   * Get system statistics
   */
  async getSystemStatistics() {
    const [
      totalUsers,
      totalOrganizations,
      totalBranches,
      activeSubscriptions,
      totalMembers,
      totalTransactions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.organisation.count(),
      this.prisma.branch.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.member.count(),
      this.prisma.transaction.count(),
    ]);

    return {
      totalUsers,
      totalOrganizations,
      totalBranches,
      activeSubscriptions,
      totalMembers,
      totalTransactions,
    };
  }
}
