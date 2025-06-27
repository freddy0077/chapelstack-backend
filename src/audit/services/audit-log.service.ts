import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface CreateAuditLogInput {
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
  userId?: string;
  branchId?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAuditLogInput): Promise<any> {
    try {
      const auditLog = await this.prisma.auditLog.create({
        data: {
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          description: input.description,
          metadata: input.metadata as any,
          userId: input.userId,
          branchId: input.branchId,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      });

      return auditLog;
    } catch (error) {
      this.logger.error(
        `Error creating audit log: ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Don't throw the error to prevent audit logging failures from affecting the main operation
      return null;
    }
  }

  async findAll(
    skip = 0,
    take = 10,
    filters?: {
      action?: string;
      entityType?: string;
      entityId?: string;
      userId?: string;
      branchId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<any[]> {
    try {
      const where: any = {};

      if (filters?.action) {
        where.action = filters.action;
      }

      if (filters?.entityType) {
        where.entityType = filters.entityType;
      }

      if (filters?.entityId) {
        where.entityId = filters.entityId;
      }

      if (filters?.userId) {
        where.userId = filters.userId;
      }

      if (filters?.branchId) {
        where.branchId = filters.branchId;
      }

      if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters?.startDate) {
          where.createdAt.gte = filters.startDate;
        }
        if (filters?.endDate) {
          where.createdAt.lte = filters.endDate;
        }
      }

      const auditLogs = await this.prisma.auditLog.findMany({
        skip,
        take,
        where,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: true,
          branch: true,
        },
      });

      return auditLogs;
    } catch (error) {
      this.logger.error(
        `Error finding audit logs: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async count(filters?: {
    action?: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    branchId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    try {
      const where: any = {};

      if (filters?.action) {
        where.action = filters.action;
      }

      if (filters?.entityType) {
        where.entityType = filters.entityType;
      }

      if (filters?.entityId) {
        where.entityId = filters.entityId;
      }

      if (filters?.userId) {
        where.userId = filters.userId;
      }

      if (filters?.branchId) {
        where.branchId = filters.branchId;
      }

      if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters?.startDate) {
          where.createdAt.gte = filters.startDate;
        }
        if (filters?.endDate) {
          where.createdAt.lte = filters.endDate;
        }
      }

      return await this.prisma.auditLog.count({ where });
    } catch (error) {
      this.logger.error(
        `Error counting audit logs: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
