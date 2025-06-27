import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';
import * as process from 'process';

@Injectable()
export class SystemAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get system health information
   */
  async getSystemHealth() {
    // Get database health
    let dbStatus = 'healthy';
    let dbLatency = 0;
    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - startTime;
    } catch (_error) {
      dbStatus = 'unhealthy';
    }

    // Get system resource information
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const systemUptime = os.uptime();
    const processUptime = process.uptime();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    return {
      timestamp: new Date(),
      database: {
        status: dbStatus,
        latency: dbLatency,
      },
      system: {
        totalMemory,
        freeMemory,
        memoryUsage: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
        },
        cpuUsage: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        systemUptime,
        processUptime,
        platform: process.platform,
        nodeVersion: process.version,
      },
    };
  }

  /**
   * Create a system announcement
   */
  async createAnnouncement(
    title: string,
    content: string,
    startDate: Date,
    endDate: Date,
    targetRoleIds?: string[],
    targetBranchIds?: string[],
  ) {
    // Validate roles if provided
    if (targetRoleIds && targetRoleIds.length > 0) {
      const roles = await this.prisma.role.findMany({
        where: {
          id: {
            in: targetRoleIds,
          },
        },
      });

      if (roles.length !== targetRoleIds.length) {
        throw new NotFoundException('One or more target roles not found');
      }
    }

    // Validate branches if provided
    if (targetBranchIds && targetBranchIds.length > 0) {
      const branches = await this.prisma.branch.findMany({
        where: {
          id: {
            in: targetBranchIds,
          },
        },
      });

      if (branches.length !== targetBranchIds.length) {
        throw new NotFoundException('One or more target branches not found');
      }
    }

    // Store announcement in settings table
    const announcementData = {
      title,
      content,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      targetRoleIds: targetRoleIds || [],
      targetBranchIds: targetBranchIds || [],
      isActive: true,
    };

    // Use the settings table to store announcements
    return this.prisma.setting.create({
      data: {
        key: `announcement.${Date.now()}`,
        value: JSON.stringify(announcementData),
      },
    });
  }

  /**
   * Get all active announcements
   */
  async getActiveAnnouncements(userId?: string, branchId?: string) {
    const now = new Date();

    // Get all announcement settings
    const announcementSettings = await this.prisma.setting.findMany({
      where: {
        key: {
          startsWith: 'announcement.',
        },
      },
    });

    // Filter and parse announcements
    const announcements = announcementSettings
      .map((setting) => {
        try {
          return {
            id: setting.id,
            key: setting.key,
            ...JSON.parse(setting.value),
          };
        } catch (_error) {
          return null;
        }
      })
      .filter(
        (announcement): announcement is NonNullable<typeof announcement> =>
          announcement !== null,
      )
      .filter((announcement) => {
        // Check if announcement is active and within date range
        const startDate = new Date(announcement.startDate as string);
        const endDate = new Date(announcement.endDate as string);
        const isActive =
          announcement.isActive && startDate <= now && endDate >= now;

        if (!isActive) return false;

        // If no user or branch specified, return all active announcements
        if (!userId && !branchId) return true;

        // If no targeting, announcement is for everyone
        if (
          (!announcement.targetRoleIds ||
            announcement.targetRoleIds.length === 0) &&
          (!announcement.targetBranchIds ||
            announcement.targetBranchIds.length === 0)
        ) {
          return true;
        }

        // If user specified, check role targeting
        let userMatch = false;
        if (
          userId &&
          announcement.targetRoleIds &&
          announcement.targetRoleIds.length > 0
        ) {
          // This would require an additional query to check user roles
          // For now, we'll return true and let the resolver handle filtering
          userMatch = true;
        }

        // If branch specified, check branch targeting
        let branchMatch = false;
        if (
          branchId &&
          announcement.targetBranchIds &&
          announcement.targetBranchIds.length > 0 &&
          (announcement.targetBranchIds as string[]).includes(branchId)
        ) {
          branchMatch = true;
        }

        return userMatch || branchMatch;
      });

    return announcements;
  }

  /**
   * Update an announcement
   */
  async updateAnnouncement(
    id: string,
    title?: string,
    content?: string,
    startDate?: Date,
    endDate?: Date,
    targetRoleIds?: string[],
    targetBranchIds?: string[],
    isActive?: boolean,
  ) {
    const setting = await this.prisma.setting.findUnique({
      where: { id },
    });

    if (!setting || !setting.key.startsWith('announcement.')) {
      throw new NotFoundException('Announcement not found');
    }

    try {
      const announcement = JSON.parse(setting.value);

      // Update announcement data
      const updatedAnnouncement = {
        ...announcement,
        title: title !== undefined ? title : announcement.title,
        content: content !== undefined ? content : announcement.content,
        startDate:
          startDate !== undefined
            ? startDate.toISOString()
            : announcement.startDate,
        endDate:
          endDate !== undefined ? endDate.toISOString() : announcement.endDate,
        targetRoleIds:
          targetRoleIds !== undefined
            ? targetRoleIds
            : announcement.targetRoleIds,
        targetBranchIds:
          targetBranchIds !== undefined
            ? targetBranchIds
            : announcement.targetBranchIds,
        isActive: isActive !== undefined ? isActive : announcement.isActive,
      };

      // Update the setting
      const updatedSetting = await this.prisma.setting.update({
        where: { id },
        data: {
          value: JSON.stringify(updatedAnnouncement),
        },
      });

      return {
        id: updatedSetting.id,
        key: updatedSetting.key,
        ...updatedAnnouncement,
      };
    } catch (e) {
      throw new Error('Failed to parse announcement data');
    }
  }

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(id: string) {
    const setting = await this.prisma.setting.findUnique({
      where: { id },
    });

    if (!setting || !setting.key.startsWith('announcement.')) {
      throw new NotFoundException('Announcement not found');
    }

    await this.prisma.setting.delete({
      where: { id },
    });

    return { id, deleted: true };
  }
}
