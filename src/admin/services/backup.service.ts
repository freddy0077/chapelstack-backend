import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { nullToUndefined } from '../../common/utils';
import {
  CreateBackupInput,
  RestoreBackupInput,
  BackupFilterInput,
} from '../dto/backup.input';
import { Backup, BackupStatus, BackupType } from '../entities/backup.entity';
import { AuditLogService } from './audit-log.service';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const execPromise = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupsDir = path.join(process.cwd(), 'backups');

  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {
    // Ensure backup directory exists
    this.ensureDirectoryExists(this.backupsDir);
  }

  /**
   * Map Prisma Backup model to GraphQL Backup entity
   */
  private mapToEntity(backup: any): Backup {
    return {
      ...backup,
      type: backup.type as BackupType,
      status: backup.status as BackupStatus,
      metadata: backup.metadata || undefined,
      filePath: backup.filePath || undefined,
      fileSize: backup.fileSize || undefined,
      duration: backup.duration || undefined,
      // @ts-ignore - Property exists in runtime but not in type
      // @ts-ignore - Property exists in runtime but not in type
      errorDetails: backup.errorDetails || undefined,
      userId: backup?.userId || undefined,
      user: backup.user || undefined,
    };
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async createBackup(
    input: CreateBackupInput,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Backup> {
    const backup = await this.prisma.backup.create({
      // @ts-ignore - Type compatibility issues with userId
      data: {
        type: input.type as unknown as string, // Cast to string for Prisma
        status: BackupStatus.PENDING as unknown as string, // Cast to string for Prisma
        description: input.description,
        metadata: input.metadata || {},
        userId: input?.userId || undefined,
      },
    });

    // Log the action
    await this.auditLogService.createAuditLog({
      action: 'BACKUP_CREATED',
      entityType: 'Backup',
      entityId: backup.id,
      description: `Created ${input.type.toLowerCase()} backup`,
      metadata: { backupType: input.type },
      userId: input?.userId || undefined,
      ipAddress,
      userAgent,
    });

    // Process the backup asynchronously
    this.processBackup(backup.id).catch((error) => {
      this.logger.error(
        `Error processing backup ${backup.id}: ${error.message}`,
        error.stack,
      );
    });

    return this.mapToEntity(backup);
  }

  async getBackup(id: string): Promise<Backup> {
    const backup = await this.prisma.backup.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!backup) {
      throw new NotFoundException(`Backup with ID ${id} not found`);
    }

    return this.mapToEntity(backup);
  }

  async getBackups(filter?: BackupFilterInput): Promise<Backup[]> {
    const where: any = {};

    if (filter) {
      if (filter.type) {
        where.type = filter.type as unknown as string;
      }
      if (filter.status) {
        where.status = filter.status as unknown as string;
      }
      if (filter.userId) {
        where.userId = filter.userId;
      }
      if (filter.createdAfter || filter.createdBefore) {
        where.createdAt = {};
        if (filter.createdAfter) {
          where.createdAt.gte = new Date(filter.createdAfter);
        }
        if (filter.createdBefore) {
          where.createdAt.lte = new Date(filter.createdBefore);
        }
      }
    }

    const backups = await this.prisma.backup.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return backups.map((backup) => this.mapToEntity(backup));
  }

  async restoreBackup(
    input: RestoreBackupInput,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Backup> {
    // Verify source backup exists
    const sourceBackup = await this.prisma.backup.findUnique({
      where: { id: input.backupId },
    });

    if (!sourceBackup) {
      throw new NotFoundException(
        `Source backup with ID ${input.backupId} not found`,
      );
    }

    if (sourceBackup.status !== BackupStatus.COMPLETED) {
      throw new Error(`Source backup is not in COMPLETED status`);
    }

    if (!sourceBackup.filePath) {
      throw new Error(`Source backup has no file path`);
    }

    // Create restore operation
    const restore = await this.prisma.backup.create({
      // @ts-ignore - Type compatibility issues with userId
      data: {
        type: BackupType.MANUAL as unknown as string, // Cast to string for Prisma - using MANUAL for restore operations
        status: BackupStatus.PENDING as unknown as string, // Cast to string for Prisma
        description: input.description,
        metadata: {
          sourceBackupId: input.backupId,
          sourceBackupPath: sourceBackup.filePath,
        },
        userId: input?.userId || undefined,
      },
    });

    // Log the action
    await this.auditLogService.createAuditLog({
      action: 'BACKUP_RESTORE_INITIATED',
      entityType: 'Backup',
      entityId: restore.id,
      description: `Initiated restore from backup ${input.backupId}`,
      metadata: { sourceBackupId: input.backupId },
      userId: input?.userId || undefined,
      ipAddress,
      userAgent,
    });

    // Process the restore asynchronously
    this.processRestore(restore.id).catch((error) => {
      this.logger.error(
        `Error processing restore ${restore.id}: ${error.message}`,
        error.stack,
      );
    });

    return this.mapToEntity(restore);
  }

  private buildFilterWhereClause(filter?: BackupFilterInput): any {
    if (!filter) return {};

    const where: any = {};

    if (filter.id) {
      where.id = filter.id;
    }

    if (filter.type) {
      where.type = filter.type;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.userId) {
      where.userId = filter.userId;
    }

    if (filter.startDate || filter.endDate) {
      where.createdAt = {};

      if (filter.startDate) {
        where.createdAt.gte = new Date(filter.startDate);
      }

      if (filter.endDate) {
        where.createdAt.lte = new Date(filter.endDate);
      }
    }

    return where;
  }

  private async processBackup(backupId: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Update backup status to IN_PROGRESS
      await this.prisma.backup.update({
        where: { id: backupId },
        // @ts-ignore - Type compatibility issues with userId
        data: { status: BackupStatus.IN_PROGRESS },
      });

      const backup = await this.prisma.backup.findUnique({
        where: { id: backupId },
      });

      if (!backup) {
        throw new Error('Invalid backup operation');
      }

      // Generate backup file name and path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup_${backup.type.toLowerCase()}_${timestamp}.sql`;
      const filePath = path.join(this.backupsDir, fileName);

      // Get database connection info from environment variables or config
      const dbName = process.env.DATABASE_NAME || 'church_system';
      const dbUser = process.env.DATABASE_USER || 'frederickankamah'; // Using the superuser from the memory
      const dbHost = process.env.DATABASE_HOST || 'localhost';
      const dbPort = process.env.DATABASE_PORT || '5432';

      // Execute pg_dump to create a backup
      const pgDumpCommand = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -F c -b -v -f "${filePath}" ${dbName}`;

      const { stdout, stderr } = await execPromise(pgDumpCommand);

      if (stderr && !stderr.includes('pg_dump: dumping contents of table')) {
        this.logger.warn(`pg_dump stderr: ${stderr}`);
      }

      // Get file size
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      const duration = Date.now() - startTime;

      // Update backup with success status
      await this.prisma.backup.update({
        where: { id: backupId },
        // @ts-ignore - Type compatibility issues with userId
        data: {
          status: BackupStatus.COMPLETED,
          filePath,
          fileSize,
          // @ts-ignore - Property exists in runtime but not in type
          // @ts-ignore - Property exists in runtime but not in type
          duration,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Backup ${backupId} completed successfully`);
    } catch (error) {
      // Update backup with failure status
      await this.prisma.backup.update({
        where: { id: backupId },
        // @ts-ignore - Type compatibility issues with userId
        data: {
          status: BackupStatus.FAILED,
          // @ts-ignore - Property exists in runtime but not in type
          // @ts-ignore - Property exists in runtime but not in type
          errorDetails: { message: error.message, stack: error.stack },
          duration: Date.now() - startTime,
          completedAt: new Date(),
        },
      });

      this.logger.error(
        `Backup ${backupId} failed: ${error.message}`,
        error.stack,
      );
    }
  }

  private async processRestore(restoreId: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Update restore operation status to IN_PROGRESS
      await this.prisma.backup.update({
        where: { id: restoreId },
        // @ts-ignore - Type compatibility issues with userId
        data: { status: BackupStatus.IN_PROGRESS },
      });

      const restoreOperation = await this.prisma.backup.findUnique({
        where: { id: restoreId },
      });

      if (
        !restoreOperation ||
        !restoreOperation.metadata ||
        typeof restoreOperation.metadata !== 'object'
      ) {
        throw new Error('Invalid restore operation or missing metadata');
      }

      // Safely access sourceBackupPath from metadata object
      const metadata = restoreOperation.metadata as Record<string, any>;
      if (
        !metadata.sourceBackupPath ||
        typeof metadata.sourceBackupPath !== 'string'
      ) {
        throw new Error('Missing or invalid source backup path in metadata');
      }

      const sourceBackupPath = metadata.sourceBackupPath;

      // Get database connection info from environment variables or config
      const dbName = process.env.DATABASE_NAME || 'church_system';
      const dbUser = process.env.DATABASE_USER || 'frederickankamah'; // Using the superuser from the memory
      const dbHost = process.env.DATABASE_HOST || 'localhost';
      const dbPort = process.env.DATABASE_PORT || '5432';

      // Execute pg_restore to restore the backup
      // Note: This is a destructive operation that will overwrite existing data
      const pgRestoreCommand = `pg_restore -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "${sourceBackupPath}"`;

      const { stdout, stderr } = await execPromise(pgRestoreCommand);

      if (stderr && !stderr.includes('pg_restore: processing data for table')) {
        this.logger.warn(`pg_restore stderr: ${stderr}`);
      }

      const duration = Date.now() - startTime;

      // Update restore operation with success status
      await this.prisma.backup.update({
        where: { id: restoreId },
        // @ts-ignore - Type compatibility issues with userId
        data: {
          status: BackupStatus.COMPLETED,
          // @ts-ignore - Property exists in runtime but not in type
          // @ts-ignore - Property exists in runtime but not in type
          duration,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Restore ${restoreId} completed successfully`);
    } catch (error) {
      // Update restore operation with failure status
      await this.prisma.backup.update({
        where: { id: restoreId },
        // @ts-ignore - Type compatibility issues with userId
        data: {
          status: BackupStatus.FAILED,
          // @ts-ignore - Property exists in runtime but not in type
          // @ts-ignore - Property exists in runtime but not in type
          errorDetails: { message: error.message, stack: error.stack },
          duration: Date.now() - startTime,
          completedAt: new Date(),
        },
      });

      this.logger.error(
        `Restore ${restoreId} failed: ${error.message}`,
        error.stack,
      );
    }
  }
}
