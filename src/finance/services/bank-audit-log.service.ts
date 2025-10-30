import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditLogContext {
  userId: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  organisationId: string;
  branchId?: string;
}

export interface AuditLogEntry {
  entityType: 'BANK_ACCOUNT' | 'BANK_RECONCILIATION' | 'BANK_STATEMENT';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'RECONCILE' | 'UPLOAD' | 'DOWNLOAD';
  changes?: any;
}

@Injectable()
export class BankAuditLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry, context: AuditLogContext): Promise<void> {
    try {
      await this.prisma.bankAccountAuditLog.create({
        data: {
          entityType: entry.entityType,
          entityId: entry.entityId,
          action: entry.action,
          changes: entry.changes ? JSON.parse(JSON.stringify(entry.changes)) : null,
          userId: context.userId,
          userEmail: context.userEmail,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          organisationId: context.organisationId,
          branchId: context.branchId,
        },
      });
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Log bank account creation
   */
  async logBankAccountCreate(
    bankAccountId: string,
    data: any,
    context: AuditLogContext,
  ): Promise<void> {
    await this.log(
      {
        entityType: 'BANK_ACCOUNT',
        entityId: bankAccountId,
        action: 'CREATE',
        changes: { after: data },
      },
      context,
    );
  }

  /**
   * Log bank account update
   */
  async logBankAccountUpdate(
    bankAccountId: string,
    before: any,
    after: any,
    context: AuditLogContext,
  ): Promise<void> {
    await this.log(
      {
        entityType: 'BANK_ACCOUNT',
        entityId: bankAccountId,
        action: 'UPDATE',
        changes: { before, after },
      },
      context,
    );
  }

  /**
   * Log bank account deletion
   */
  async logBankAccountDelete(
    bankAccountId: string,
    data: any,
    context: AuditLogContext,
  ): Promise<void> {
    await this.log(
      {
        entityType: 'BANK_ACCOUNT',
        entityId: bankAccountId,
        action: 'DELETE',
        changes: { before: data },
      },
      context,
    );
  }

  /**
   * Log bank account view (for sensitive data access tracking)
   */
  async logBankAccountView(
    bankAccountId: string,
    context: AuditLogContext,
  ): Promise<void> {
    await this.log(
      {
        entityType: 'BANK_ACCOUNT',
        entityId: bankAccountId,
        action: 'VIEW',
      },
      context,
    );
  }

  /**
   * Log bank reconciliation
   */
  async logReconciliation(
    reconciliationId: string,
    bankAccountId: string,
    data: any,
    context: AuditLogContext,
  ): Promise<void> {
    await this.log(
      {
        entityType: 'BANK_RECONCILIATION',
        entityId: reconciliationId,
        action: 'RECONCILE',
        changes: { bankAccountId, ...data },
      },
      context,
    );
  }

  /**
   * Log bank statement upload
   */
  async logStatementUpload(
    statementId: string,
    bankAccountId: string,
    fileName: string,
    context: AuditLogContext,
  ): Promise<void> {
    await this.log(
      {
        entityType: 'BANK_STATEMENT',
        entityId: statementId,
        action: 'UPLOAD',
        changes: { bankAccountId, fileName },
      },
      context,
    );
  }

  /**
   * Get audit logs for an entity
   */
  async getLogsForEntity(
    entityType: string,
    entityId: string,
    limit: number = 50,
  ): Promise<any[]> {
    return this.prisma.bankAccountAuditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get audit logs for a user
   */
  async getLogsForUser(
    userId: string,
    organisationId: string,
    limit: number = 100,
  ): Promise<any[]> {
    return this.prisma.bankAccountAuditLog.findMany({
      where: {
        userId,
        organisationId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get audit logs for an organisation
   */
  async getLogsForOrganisation(
    organisationId: string,
    filters?: {
      entityType?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 100,
  ): Promise<any[]> {
    const where: any = { organisationId };

    if (filters?.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    return this.prisma.bankAccountAuditLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }
}
