import { Injectable, Logger, HttpException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = process.env.BACKUP_DIR || './backups';

  constructor(private readonly prisma: PrismaService) {
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Get backup settings
   */
  async getBackupSettings(branchId: string) {
    let settings = await this.prisma.backupSettings.findUnique({
      where: { branchId },
    });

    if (!settings) {
      settings = await this.createDefaultSettings(branchId);
    }

    return settings;
  }

  /**
   * Update backup settings
   */
  async updateBackupSettings(branchId: string, data: any, userId: string) {
    const existing = await this.prisma.backupSettings.findUnique({
      where: { branchId },
    });

    let settings;
    if (existing) {
      settings = await this.prisma.backupSettings.update({
        where: { branchId },
        data,
      });
    } else {
      settings = await this.prisma.backupSettings.create({
        data: {
          branchId,
          ...data,
        },
      });
    }

    await this.logSettingsChange(branchId, userId, 'UPDATE', data);
    this.logger.log(`Backup settings updated for branch ${branchId}`);

    return settings;
  }

  /**
   * Create manual backup
   */
  async createBackup(branchId: string, userId: string) {
    this.logger.log(`Starting manual backup for branch ${branchId}`);

    const backup = await this.prisma.backup.create({
      data: {
        branchId,
        filename: this.generateBackupFilename(branchId),
        fileSize: 0,
        storageLocation: 'LOCAL',
        backupType: 'MANUAL',
        status: 'PENDING',
        createdById: userId,
      },
    });

    // Start backup process asynchronously
    this.performBackup(backup.id, branchId).catch((error) => {
      this.logger.error(`Backup failed for ${backup.id}:`, error);
    });

    return backup;
  }

  /**
   * Perform the actual backup
   */
  private async performBackup(backupId: string, branchId: string) {
    try {
      // Update status to IN_PROGRESS
      await this.prisma.backup.update({
        where: { id: backupId },
        data: { status: 'IN_PROGRESS' },
      });

      const backup = await this.prisma.backup.findUnique({
        where: { id: backupId },
      });

      if (!backup) {
        throw new Error('Backup not found');
      }

      const filePath = path.join(this.backupDir, backup.filename);

      // Get backup settings
      const settings = await this.getBackupSettings(branchId);

      // Export database (PostgreSQL example)
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      // Parse database URL
      const dbUrl = new URL(databaseUrl);
      const dbName = dbUrl.pathname.slice(1);
      const dbHost = dbUrl.hostname;
      const dbPort = dbUrl.port || '5432';
      const dbUser = dbUrl.username;
      const dbPassword = dbUrl.password;

      // Create pg_dump command
      const dumpCommand = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -F c -b -v -f "${filePath}" ${dbName}`;

      // Execute backup
      await execAsync(dumpCommand);

      // Get file size
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      // Calculate checksum
      const checksum = await this.calculateChecksum(filePath);

      // Encrypt if required
      if (settings.encryptBackups) {
        await this.encryptBackupFile(filePath, settings.encryptionKey);
      }

      // Get table counts
      const recordCount = await this.getRecordCounts();

      // Update backup record
      await this.prisma.backup.update({
        where: { id: backupId },
        data: {
          status: 'COMPLETED',
          fileSize: fileSize,
          completedAt: new Date(),
          checksum,
          recordCount,
          tablesBackedUp: Object.keys(recordCount),
        },
      });

      // Update backup settings with last backup info
      await this.prisma.backupSettings.update({
        where: { branchId },
        data: {
          lastBackupAt: new Date(),
          lastBackupStatus: 'SUCCESS',
        },
      });

      // Clean up old backups
      await this.cleanupOldBackups(branchId);

      this.logger.log(`Backup completed successfully: ${backupId}`);
    } catch (error: any) {
      this.logger.error(`Backup failed for ${backupId}:`, error);

      await this.prisma.backup.update({
        where: { id: backupId },
        data: {
          status: 'FAILED',
          errorDetails: { message: error.message },
          completedAt: new Date(),
        },
      });

      await this.prisma.backupSettings.update({
        where: { branchId },
        data: {
          lastBackupAt: new Date(),
          lastBackupStatus: 'FAILED',
        },
      });
    }
  }

  /**
   * List backups for a branch
   */
  async listBackups(branchId: string, limit: number = 50) {
    return await this.prisma.backup.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        createdBy: {
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
   * Delete a backup
   */
  async deleteBackup(backupId: string, userId: string) {
    const backup = await this.prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      throw new HttpException('Backup not found', 404);
    }

    // Delete file
    const filePath = path.join(this.backupDir, backup.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete record
    await this.prisma.backup.delete({
      where: { id: backupId },
    });

    await this.logSettingsChange(backup.branchId, userId, 'DELETE', {
      backupId,
      filename: backup.filename,
    });

    this.logger.log(`Backup deleted: ${backupId}`);
    return true;
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupId: string, userId: string) {
    const backup = await this.prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      throw new HttpException('Backup not found', 404);
    }

    if (backup.status !== 'COMPLETED') {
      throw new HttpException('Cannot restore from incomplete backup', 400);
    }

    this.logger.log(`Starting restore from backup: ${backupId}`);

    const filePath = path.join(this.backupDir, backup.filename);

    if (!fs.existsSync(filePath)) {
      throw new HttpException('Backup file not found', 404);
    }

    try {
      // Get backup settings
      const settings = await this.getBackupSettings(backup.branchId);

      // Decrypt if encrypted
      if (settings.encryptBackups) {
        await this.decryptBackupFile(filePath, settings.encryptionKey);
      }

      // Verify checksum
      const checksum = await this.calculateChecksum(filePath);
      if (checksum !== backup.checksum) {
        throw new Error('Backup file checksum mismatch - file may be corrupted');
      }

      // Parse database URL
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      const dbUrl = new URL(databaseUrl);
      const dbName = dbUrl.pathname.slice(1);
      const dbHost = dbUrl.hostname;
      const dbPort = dbUrl.port || '5432';
      const dbUser = dbUrl.username;
      const dbPassword = dbUrl.password;

      // Create pg_restore command
      const restoreCommand = `PGPASSWORD="${dbPassword}" pg_restore -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "${filePath}"`;

      // Execute restore
      await execAsync(restoreCommand);

      await this.logSettingsChange(backup.branchId, userId, 'UPDATE', {
        action: 'RESTORE_BACKUP',
        backupId,
        filename: backup.filename,
      });

      this.logger.log(`Backup restored successfully: ${backupId}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Restore failed for ${backupId}:`, error);
      throw new HttpException(`Restore failed: ${error.message}`, 500);
    }
  }

  /**
   * Automatic backup cron job (runs daily at 2 AM)
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleAutomaticBackups() {
    this.logger.log('Running automatic backups...');

    const settings = await this.prisma.backupSettings.findMany({
      where: {
        autoBackup: true,
        frequency: 'DAILY',
      },
    });

    for (const setting of settings) {
      try {
        await this.createBackup(setting.branchId, 'system');
      } catch (error) {
        this.logger.error(
          `Automatic backup failed for branch ${setting.branchId}:`,
          error,
        );
      }
    }
  }

  /**
   * Generate backup filename
   */
  private generateBackupFilename(branchId: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `backup-${branchId}-${timestamp}.dump`;
  }

  /**
   * Calculate file checksum
   */
  private async calculateChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Encrypt backup file
   */
  private async encryptBackupFile(filePath: string, key: string | null) {
    // Implement file encryption
    // This is a placeholder
  }

  /**
   * Decrypt backup file
   */
  private async decryptBackupFile(filePath: string, key: string | null) {
    // Implement file decryption
    // This is a placeholder
  }

  /**
   * Get record counts for all tables
   */
  private async getRecordCounts(): Promise<any> {
    // Get counts for major tables
    const counts: any = {};

    try {
      counts.users = await this.prisma.user.count();
      counts.members = await this.prisma.member.count();
      counts.events = await this.prisma.event.count();
      counts.contributions = await this.prisma.contribution.count();
      counts.transactions = await this.prisma.transaction.count();
      // Add more tables as needed
    } catch (error) {
      this.logger.error('Failed to get record counts:', error);
    }

    return counts;
  }

  /**
   * Clean up old backups based on retention policy
   */
  private async cleanupOldBackups(branchId: string) {
    const settings = await this.getBackupSettings(branchId);

    // Get old backups
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - settings.retentionDays);

    const oldBackups = await this.prisma.backup.findMany({
      where: {
        branchId,
        createdAt: { lt: cutoffDate },
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'asc' },
    });

    // Delete old backups
    for (const backup of oldBackups) {
      try {
        await this.deleteBackup(backup.id, 'system');
      } catch (error) {
        this.logger.error(`Failed to delete old backup ${backup.id}:`, error);
      }
    }

    // Also enforce max backups limit
    const allBackups = await this.prisma.backup.findMany({
      where: {
        branchId,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (allBackups.length > settings.maxBackups) {
      const backupsToDelete = allBackups.slice(settings.maxBackups);
      for (const backup of backupsToDelete) {
        try {
          await this.deleteBackup(backup.id, 'system');
        } catch (error) {
          this.logger.error(`Failed to delete excess backup ${backup.id}:`, error);
        }
      }
    }
  }

  /**
   * Create default backup settings
   */
  private async createDefaultSettings(branchId: string) {
    return await this.prisma.backupSettings.create({
      data: {
        branchId,
        autoBackup: true,
        frequency: 'DAILY',
        time: '02:00',
        storageType: 'LOCAL',
        retentionDays: 30,
        maxBackups: 10,
        encryptBackups: true,
        notifyOnSuccess: true,
        notifyOnFailure: true,
      },
    });
  }

  /**
   * Log settings changes
   */
  private async logSettingsChange(
    branchId: string,
    userId: string,
    action: string,
    data: any,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      await this.prisma.settingsAuditLog.create({
        data: {
          branchId,
          userId,
          userEmail: user?.email || 'system',
          settingType: 'BACKUP',
          action,
          newValue: JSON.stringify(data),
        },
      });
    } catch (error) {
      this.logger.error('Failed to log settings change:', error);
    }
  }
}
