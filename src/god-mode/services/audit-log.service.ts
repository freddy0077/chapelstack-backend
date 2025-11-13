import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditLogFilter {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  take?: number;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filter: AuditLogFilter) {
    const { userId, action, entityType, startDate, endDate, skip = 0, take = 20 } = filter;

    const where: any = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      skip,
      take,
    };
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Get user audit trail
   */
  async getUserAuditTrail(userId: string, limit: number = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        description: true,
        metadata: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get entity audit trail
   */
  async getEntityAuditTrail(entityType: string, entityId: string, limit: number = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalLogs, createActions, updateActions, deleteActions, actionsByType] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.count({
        where: { ...where, action: 'CREATE' },
      }),
      this.prisma.auditLog.count({
        where: { ...where, action: 'UPDATE' },
      }),
      this.prisma.auditLog.count({
        where: { ...where, action: 'DELETE' },
      }),
      this.getActionsByType(where),
    ]);

    // Calculate success rate based on actions (all logged actions are considered successful)
    const successfulActions = totalLogs;
    const failedActions = 0;

    return {
      totalLogs,
      successfulActions,
      failedActions,
      successRate: totalLogs > 0 ? '100.00' : '0.00',
      actionsByType,
    };
  }

  /**
   * Get actions by type
   */
  private async getActionsByType(where: any) {
    const actions = await this.prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: true,
    });

    return actions.map((a) => ({
      action: a.action,
      count: a._count,
    }));
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(filter: AuditLogFilter, format: 'csv' | 'json' = 'csv') {
    const logs = await this.getAuditLogs({
      ...filter,
      take: 10000, // Max export limit
    });

    if (format === 'json') {
      return JSON.stringify(logs.logs, null, 2);
    }

    // CSV format
    const headers = ['ID', 'User', 'Action', 'Entity Type', 'Entity ID', 'Description', 'Timestamp'];
    const rows = logs.logs.map((log) => [
      log.id,
      log.user?.email || 'System',
      log.action,
      log.entityType,
      log.entityId,
      log.description,
      log.createdAt,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return csv;
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(query: string, skip: number = 0, take: number = 20) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        OR: [
          { action: { contains: query, mode: 'insensitive' } },
          { entityType: { contains: query, mode: 'insensitive' } },
          { entityId: { contains: query, mode: 'insensitive' } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
        ],
      },
      skip,
      take,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.prisma.auditLog.count({
      where: {
        OR: [
          { action: { contains: query, mode: 'insensitive' } },
          { entityType: { contains: query, mode: 'insensitive' } },
          { entityId: { contains: query, mode: 'insensitive' } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
        ],
      },
    });

    return {
      logs,
      total,
      skip,
      take,
    };
  }
}
