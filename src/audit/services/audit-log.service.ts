import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Audit Log Input DTO
 * Used for creating audit log entries
 */
export interface CreateAuditLogInput {
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

/**
 * Audit Log Filter Input
 * Used for filtering audit logs
 */
export interface AuditLogFilterInput {
  action?: string;
  entityType?: string;
  entityId?: string;
  descriptionContains?: string;
  userId?: string;
  branchId?: string;
  createdAfter?: Date | string;
  createdBefore?: Date | string;
}

/**
 * Pagination Input
 * Used for pagination support
 */
export interface PaginationInput {
  skip?: number;
  take?: number;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new audit log entry
   * Validates references and throws errors for visibility
   */
  async create(input: CreateAuditLogInput): Promise<any> {
    try {
      // 🔒 Validate required fields
      if (!input.action || !input.entityType || !input.description) {
        throw new Error(
          `Missing required audit log fields: action=${input.action}, entityType=${input.entityType}, description=${input.description}`,
        );
      }

      // 🔒 Validate userId exists if provided
      if (input.userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: input.userId },
        });
        if (!user) {
          throw new Error(
            `Cannot create audit log: User with id "${input.userId}" not found`,
          );
        }
      }

      // 🔒 Validate branchId exists if provided
      if (input.branchId) {
        const branch = await this.prisma.branch.findUnique({
          where: { id: input.branchId },
        });
        if (!branch) {
          throw new Error(
            `Cannot create audit log: Branch with id "${input.branchId}" not found`,
          );
        }
      }

      // Create the audit log
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
        include: {
          user: true,
          branch: true,
        },
      });

      this.logger.log(
        `✅ Audit log created: ${auditLog.action} on ${auditLog.entityType}`,
      );
      return this.mapToEntity(auditLog);
    } catch (error) {
      this.logger.error(
        `❌ Error creating audit log: ${(error as Error).message}`,
        (error as Error).stack,
      );
      // ✅ THROW ERROR so caller knows it failed
      throw error;
    }
  }

  /**
   * Find a single audit log by ID
   */
  async findOne(id: string): Promise<any> {
    try {
      const auditLog = await this.prisma.auditLog.findUnique({
        where: { id },
        include: {
          user: true,
          branch: true,
        },
      });

      if (!auditLog) {
        this.logger.warn(`Audit log with ID ${id} not found`);
        return null;
      }

      return this.mapToEntity(auditLog);
    } catch (error) {
      this.logger.error(
        `Error finding audit log: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Find all audit logs with filtering and pagination
   */
  async findAll(
    skip = 0,
    take = 10,
    filters?: AuditLogFilterInput,
  ): Promise<{ items: any[]; totalCount: number; hasNextPage: boolean }> {
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

      if (filters?.descriptionContains) {
        where.description = {
          contains: filters.descriptionContains,
          mode: 'insensitive',
        };
      }

      if (filters?.userId) {
        where.userId = filters.userId;
      }

      if (filters?.branchId) {
        where.branchId = filters.branchId;
      }

      if (filters?.createdAfter || filters?.createdBefore) {
        where.createdAt = {};
        if (filters?.createdAfter) {
          where.createdAt.gte = new Date(filters.createdAfter);
        }
        if (filters?.createdBefore) {
          where.createdAt.lte = new Date(filters.createdBefore);
        }
      }

      const [auditLogs, totalCount] = await this.prisma.$transaction([
        this.prisma.auditLog.findMany({
          skip,
          take,
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            user: true,
            branch: true,
          },
        }),
        this.prisma.auditLog.count({ where }),
      ]);

      return {
        items: auditLogs.map((log) => this.mapToEntity(log)),
        totalCount,
        hasNextPage: skip + take < totalCount,
      };
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

  /**
   * Map Prisma AuditLog to GraphQL AuditLog entity
   * Ensures all fields are properly formatted
   */
  private mapToEntity(auditLog: any): any {
    return {
      ...auditLog,
      metadata: auditLog.metadata || undefined,
      ipAddress: auditLog.ipAddress || undefined,
      userAgent: auditLog.userAgent || undefined,
      userId: auditLog.userId || undefined,
      user: auditLog.user || undefined,
      branchId: auditLog.branchId || undefined,
      branch: auditLog.branch || undefined,
      entityId: auditLog.entityId || undefined,
    };
  }
}
