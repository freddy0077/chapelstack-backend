import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsAuditService {
  private readonly logger = new Logger(SettingsAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get audit logs for a branch
   */
  async getAuditLogs(
    branchId: string,
    filters?: {
      settingType?: string;
      action?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: any = { branchId };

    if (filters?.settingType) {
      where.settingType = filters.settingType;
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const logs = await this.prisma.settingsAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const total = await this.prisma.settingsAuditLog.count({ where });

    return {
      logs,
      total,
      limit: filters?.limit || 100,
      offset: filters?.offset || 0,
    };
  }

  /**
   * Get audit logs by setting type
   */
  async getLogsBySettingType(
    branchId: string,
    settingType: string,
    limit: number = 50,
  ) {
    return await this.prisma.settingsAuditLog.findMany({
      where: {
        branchId,
        settingType,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get audit logs by user
   */
  async getLogsByUser(branchId: string, userId: string, limit: number = 50) {
    return await this.prisma.settingsAuditLog.findMany({
      where: {
        branchId,
        userId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(branchId: string, hours: number = 24) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return await this.prisma.settingsAuditLog.findMany({
      where: {
        branchId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(branchId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.prisma.settingsAuditLog.findMany({
      where: {
        branchId,
        createdAt: { gte: since },
      },
      select: {
        settingType: true,
        action: true,
        userId: true,
        createdAt: true,
      },
    });

    // Calculate statistics
    const stats = {
      totalChanges: logs.length,
      bySettingType: {} as Record<string, number>,
      byAction: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      byDay: {} as Record<string, number>,
    };

    for (const log of logs) {
      // By setting type
      stats.bySettingType[log.settingType] =
        (stats.bySettingType[log.settingType] || 0) + 1;

      // By action
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

      // By user
      stats.byUser[log.userId] = (stats.byUser[log.userId] || 0) + 1;

      // By day
      const day = log.createdAt.toISOString().split('T')[0];
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    }

    return stats;
  }

  /**
   * Export audit logs to CSV
   */
  async exportAuditLogs(branchId: string, filters?: any): Promise<string> {
    const { logs } = await this.getAuditLogs(branchId, {
      ...filters,
      limit: 10000, // Export up to 10k records
    });

    // Generate CSV
    const headers = [
      'Date/Time',
      'Setting Type',
      'Action',
      'User',
      'User Email',
      'Field Changed',
      'Old Value',
      'New Value',
      'IP Address',
    ];

    const rows = logs.map((log) => [
      log.createdAt.toISOString(),
      log.settingType,
      log.action,
      log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown',
      log.userEmail,
      log.fieldChanged || '',
      log.oldValue || '',
      log.newValue || '',
      log.ipAddress || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');

    return csv;
  }

  /**
   * Clean up old audit logs (retention policy)
   */
  async cleanupOldLogs(branchId: string, retentionDays: number = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.settingsAuditLog.deleteMany({
      where: {
        branchId,
        createdAt: { lt: cutoffDate },
      },
    });

    this.logger.log(
      `Cleaned up ${result.count} old audit logs for branch ${branchId}`,
    );

    return result.count;
  }

  /**
   * Get change history for a specific field
   */
  async getFieldHistory(
    branchId: string,
    settingType: string,
    fieldName: string,
    limit: number = 50,
  ) {
    return await this.prisma.settingsAuditLog.findMany({
      where: {
        branchId,
        settingType,
        fieldChanged: fieldName,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get most active users
   */
  async getMostActiveUsers(branchId: string, limit: number = 10) {
    const logs = await this.prisma.settingsAuditLog.groupBy({
      by: ['userId', 'userEmail'],
      where: { branchId },
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: limit,
    });

    return logs.map((log) => ({
      userId: log.userId,
      userEmail: log.userEmail,
      changeCount: log._count.userId,
    }));
  }

  /**
   * Get most changed settings
   */
  async getMostChangedSettings(branchId: string, limit: number = 10) {
    const logs = await this.prisma.settingsAuditLog.groupBy({
      by: ['settingType'],
      where: { branchId },
      _count: { settingType: true },
      orderBy: { _count: { settingType: 'desc' } },
      take: limit,
    });

    return logs.map((log) => ({
      settingType: log.settingType,
      changeCount: log._count.settingType,
    }));
  }
}
