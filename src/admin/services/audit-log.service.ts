import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditLogInput } from '../dto/create-audit-log.input';
import { AuditLogFilterInput } from '../dto/audit-log-filter.input';
import { AuditLog } from '../entities/audit-log.entity';
import { Prisma } from '@prisma/client';
import { PaginationInput } from '../../common/dto/pagination.input';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new audit log entry
   */
  async create(createAuditLogInput: CreateAuditLogInput): Promise<AuditLog> {
    const auditLog = await this.prisma.auditLog.create({
      data: createAuditLogInput,
      include: {
        user: true,
        branch: true,
      },
    });

    return this.mapToEntity(auditLog);
  }

  /**
   * Find all audit logs with optional filtering and pagination
   */
  async findAll(
    paginationInput: PaginationInput,
    filterInput?: AuditLogFilterInput,
  ): Promise<{ items: AuditLog[]; totalCount: number; hasNextPage: boolean }> {
    const { skip = 0, take = 10 } = paginationInput;
    const where: Prisma.AuditLogWhereInput = {};

    if (filterInput) {
      if (filterInput.action) {
        where.action = filterInput.action;
      }
      if (filterInput.entityType) {
        where.entityType = filterInput.entityType;
      }
      if (filterInput.entityId) {
        where.entityId = filterInput.entityId;
      }
      if (filterInput.descriptionContains) {
        where.description = {
          contains: filterInput.descriptionContains,
          mode: 'insensitive',
        };
      }
      if (filterInput.userId) {
        where.userId = filterInput.userId;
      }
      if (filterInput.branchId) {
        where.branchId = filterInput.branchId;
      }
      if (filterInput.createdAfter || filterInput.createdBefore) {
        where.createdAt = {};
        if (filterInput.createdAfter) {
          where.createdAt.gte = new Date(filterInput.createdAfter);
        }
        if (filterInput.createdBefore) {
          where.createdAt.lte = new Date(filterInput.createdBefore);
        }
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
      items: auditLogs.map(this.mapToEntity),
      totalCount,
      hasNextPage: skip + take < totalCount,
    };
  }

  /**
   * Find a single audit log by ID
   */
  async findOne(id: string): Promise<AuditLog> {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: true,
        branch: true,
      },
    });

    if (!auditLog) {
      throw new Error(`Audit log with ID ${id} not found`);
    }

    return this.mapToEntity(auditLog);
  }

  /**
   * Map Prisma AuditLog to GraphQL AuditLog entity
   */
  /**
   * Create a new audit log entry (alias for create method)
   */
  async createAuditLog(
    createAuditLogInput: CreateAuditLogInput,
  ): Promise<AuditLog> {
    return this.create(createAuditLogInput);
  }

  /**
   * Map Prisma AuditLog to GraphQL AuditLog entity
   */
  private mapToEntity(auditLog: any): AuditLog {
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
