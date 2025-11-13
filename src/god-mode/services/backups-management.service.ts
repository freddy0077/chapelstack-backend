import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateBackupInput {
  name: string;
  type: string;
  retentionDays: number;
  description?: string;
}

export interface ScheduleBackupInput {
  frequency: string;
  retentionDays: number;
  description?: string;
}

@Injectable()
export class BackupsManagementService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all backups with pagination
   */
  async getBackups(skip: number = 0, take: number = 10) {
    const [backups, total] = await Promise.all([
      this.prisma.backup.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.backup.count(),
    ]);

    return {
      backups,
      total,
      skip,
      take,
    };
  }

  /**
   * Get backup by ID
   */
  async getBackupById(id: string) {
    const backup = await this.prisma.backup.findUnique({
      where: { id },
    });

    if (!backup) {
      throw new NotFoundException(`Backup with ID ${id} not found`);
    }

    return backup;
  }

  /**
   * Get backup statistics
   */
  async getBackupStats() {
    const [totalBackups, lastBackup] = await Promise.all([
      this.prisma.backup.count(),
      this.prisma.backup.findFirst({
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
      }),
    ]);

    const backups = await this.prisma.backup.findMany({
      select: { fileSize: true },
    });

    const totalSize = backups.reduce((sum, b) => sum + (b.fileSize || 0), 0);
    const storageQuota = 1099511627776; // 1TB default
    const storageUsed = totalSize;

    return {
      totalBackups,
      totalSize,
      lastBackupDate: lastBackup?.completedAt,
      nextScheduledBackup: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
      storageUsed,
      storageQuota,
    };
  }

  /**
   * Create new backup
   */
  async createBackup(input: CreateBackupInput) {
    // Validate backup type
    const validTypes = ['FULL', 'INCREMENTAL', 'DIFFERENTIAL'];
    if (!validTypes.includes(input.type)) {
      throw new BadRequestException(`Invalid backup type: ${input.type}`);
    }

    // Create backup
    const backup = await this.prisma.backup.create({
      data: {
        filename: input.name,
        backupType: input.type,
        status: 'PENDING',
        fileSize: 0,
        storageLocation: '/backups',
        description: input.description,
        branchId: 'default-branch', // Should come from context
      },
    });

    // Simulate backup process (in real implementation, this would be async)
    // For now, mark as completed immediately
    const completedBackup = await this.prisma.backup.update({
      where: { id: backup.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        fileSize: Math.floor(Math.random() * 10737418240) + 1073741824, // 1-10GB
      },
    });

    return completedBackup;
  }

  /**
   * Delete backup
   */
  async deleteBackup(id: string) {
    // Verify backup exists
    const backup = await this.prisma.backup.findUnique({
      where: { id },
    });

    if (!backup) {
      throw new NotFoundException(`Backup with ID ${id} not found`);
    }

    await this.prisma.backup.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Backup deleted successfully`,
    };
  }

  /**
   * Restore backup
   */
  async restoreBackup(id: string) {
    // Verify backup exists
    const backup = await this.prisma.backup.findUnique({
      where: { id },
    });

    if (!backup) {
      throw new NotFoundException(`Backup with ID ${id} not found`);
    }

    if (backup.status !== 'COMPLETED') {
      throw new BadRequestException(`Cannot restore backup with status: ${backup.status}`);
    }

    // Update backup status to indicate restore in progress
    const restoringBackup = await this.prisma.backup.update({
      where: { id },
      data: {
        status: 'RESTORING',
      },
    });

    // Simulate restore process (in real implementation, this would be async)
    // For now, mark as completed immediately
    const restoredBackup = await this.prisma.backup.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return restoredBackup;
  }

  /**
   * Download backup
   */
  async downloadBackup(id: string) {
    // Verify backup exists
    const backup = await this.prisma.backup.findUnique({
      where: { id },
    });

    if (!backup) {
      throw new NotFoundException(`Backup with ID ${id} not found`);
    }

    if (backup.status !== 'COMPLETED') {
      throw new BadRequestException(`Cannot download backup with status: ${backup.status}`);
    }

    // In real implementation, this would generate a download URL
    return {
      success: true,
      message: `Download started for backup: ${backup.filename}`,
      downloadUrl: `/api/backups/${id}/download`,
    };
  }

  /**
   * Schedule automatic backups
   */
  async scheduleBackup(input: ScheduleBackupInput) {
    // Validate frequency
    const validFrequencies = ['DAILY', 'WEEKLY', 'MONTHLY'];
    if (!validFrequencies.includes(input.frequency)) {
      throw new BadRequestException(`Invalid frequency: ${input.frequency}`);
    }

    // Create scheduled backup entry
    const backup = await this.prisma.backup.create({
      data: {
        filename: `Scheduled ${input.frequency} Backup`,
        backupType: 'FULL',
        status: 'SCHEDULED',
        fileSize: 0,
        storageLocation: '/backups',
        description: input.description || `Automatic ${input.frequency.toLowerCase()} backup`,
        branchId: 'default-branch', // Should come from context
      },
    });

    return backup;
  }

  /**
   * Cleanup expired backups
   */
  async cleanupExpiredBackups() {
    const now = new Date();
    const expiredBackups = await this.prisma.backup.findMany({
      where: {
        createdAt: {
          lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      },
    });

    for (const backup of expiredBackups) {
      await this.prisma.backup.delete({
        where: { id: backup.id },
      });
    }

    return {
      success: true,
      message: `Cleaned up ${expiredBackups.length} expired backups`,
    };
  }

  /**
   * Get backup by name
   */
  async getBackupByName(filename: string) {
    const backup = await this.prisma.backup.findFirst({
      where: { filename },
    });

    return backup;
  }

  /**
   * Get recent backups
   */
  async getRecentBackups(limit: number = 5) {
    const backups = await this.prisma.backup.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });

    return backups;
  }
}
