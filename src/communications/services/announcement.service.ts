import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/services/audit-log.service';

/**
 * Service for managing announcements and notice board
 */
@Injectable()
export class AnnouncementService {
  private readonly logger = new Logger(AnnouncementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Create a new announcement
   */
  async create(
    input: {
      title: string;
      content: string;
      category: string;
      priority: string;
      targetAudience: string;
      targetGroupIds?: string[];
      imageUrl?: string;
      attachmentUrl?: string;
      sendEmail?: boolean;
      sendPush?: boolean;
      displayOnBoard?: boolean;
      displayOnDashboard?: boolean;
      scheduledFor?: Date;
      expiresAt?: Date;
    },
    userId: string,
    branchId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      const announcement = await this.prisma.announcement.create({
        data: {
          title: input.title,
          content: input.content,
          category: input.category,
          priority: input.priority,
          targetAudience: input.targetAudience,
          targetGroupIds: input.targetGroupIds || [],
          imageUrl: input.imageUrl,
          attachmentUrl: input.attachmentUrl,
          sendEmail: input.sendEmail ?? true,
          sendPush: input.sendPush ?? true,
          displayOnBoard: input.displayOnBoard ?? true,
          displayOnDashboard: input.displayOnDashboard ?? true,
          scheduledFor: input.scheduledFor,
          expiresAt: input.expiresAt,
          status: input.scheduledFor ? 'SCHEDULED' : 'DRAFT',
          createdBy: userId,
          branchId,
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Audit log
      try {
        await this.auditLogService.create({
          action: 'CREATE',
          entityType: 'Announcement',
          entityId: announcement.id,
          description: `Created announcement: ${announcement.title}`,
          metadata: {
            category: announcement.category,
            priority: announcement.priority,
            status: announcement.status,
          },
          userId,
          branchId,
          ipAddress,
          userAgent,
        });
      } catch (auditError) {
        this.logger.error(`Failed to create audit log: ${auditError.message}`);
      }

      this.logger.log(`Announcement created: ${announcement.id} by user ${userId}`);
      return announcement;
    } catch (error) {
      this.logger.error(`Failed to create announcement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an announcement
   */
  async update(
    id: string,
    input: {
      title?: string;
      content?: string;
      category?: string;
      priority?: string;
      targetAudience?: string;
      targetGroupIds?: string[];
      imageUrl?: string;
      attachmentUrl?: string;
      sendEmail?: boolean;
      sendPush?: boolean;
      displayOnBoard?: boolean;
      displayOnDashboard?: boolean;
      scheduledFor?: Date;
      expiresAt?: Date;
    },
    userId: string,
    branchId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      // Check if announcement exists and user has permission
      const existing = await this.prisma.announcement.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Announcement with id ${id} not found`);
      }

      if (existing.branchId !== branchId) {
        throw new ForbiddenException('You do not have permission to update this announcement');
      }

      // Only allow updates to draft or scheduled announcements
      if (existing.status !== 'DRAFT' && existing.status !== 'SCHEDULED') {
        throw new ForbiddenException('Cannot update published or archived announcements');
      }

      const announcement = await this.prisma.announcement.update({
        where: { id },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.content && { content: input.content }),
          ...(input.category && { category: input.category }),
          ...(input.priority && { priority: input.priority }),
          ...(input.targetAudience && { targetAudience: input.targetAudience }),
          ...(input.targetGroupIds && { targetGroupIds: input.targetGroupIds }),
          ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
          ...(input.attachmentUrl !== undefined && { attachmentUrl: input.attachmentUrl }),
          ...(input.sendEmail !== undefined && { sendEmail: input.sendEmail }),
          ...(input.sendPush !== undefined && { sendPush: input.sendPush }),
          ...(input.displayOnBoard !== undefined && { displayOnBoard: input.displayOnBoard }),
          ...(input.displayOnDashboard !== undefined && { displayOnDashboard: input.displayOnDashboard }),
          ...(input.scheduledFor !== undefined && { scheduledFor: input.scheduledFor }),
          ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt }),
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Audit log
      try {
        await this.auditLogService.create({
          action: 'UPDATE',
          entityType: 'Announcement',
          entityId: announcement.id,
          description: `Updated announcement: ${announcement.title}`,
          metadata: {
            changes: input,
          },
          userId,
          branchId,
          ipAddress,
          userAgent,
        });
      } catch (auditError) {
        this.logger.error(`Failed to create audit log: ${auditError.message}`);
      }

      this.logger.log(`Announcement updated: ${announcement.id} by user ${userId}`);
      return announcement;
    } catch (error) {
      this.logger.error(`Failed to update announcement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete an announcement
   */
  async delete(
    id: string,
    userId: string,
    branchId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    try {
      const existing = await this.prisma.announcement.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Announcement with id ${id} not found`);
      }

      if (existing.branchId !== branchId) {
        throw new ForbiddenException('You do not have permission to delete this announcement');
      }

      await this.prisma.announcement.delete({
        where: { id },
      });

      // Audit log
      try {
        await this.auditLogService.create({
          action: 'DELETE',
          entityType: 'Announcement',
          entityId: id,
          description: `Deleted announcement: ${existing.title}`,
          metadata: {
            title: existing.title,
            category: existing.category,
          },
          userId,
          branchId,
          ipAddress,
          userAgent,
        });
      } catch (auditError) {
        this.logger.error(`Failed to create audit log: ${auditError.message}`);
      }

      this.logger.log(`Announcement deleted: ${id} by user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete announcement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Publish an announcement
   */
  async publish(
    id: string,
    userId: string,
    branchId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      const existing = await this.prisma.announcement.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Announcement with id ${id} not found`);
      }

      if (existing.branchId !== branchId) {
        throw new ForbiddenException('You do not have permission to publish this announcement');
      }

      const announcement = await this.prisma.announcement.update({
        where: { id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Audit log
      try {
        await this.auditLogService.create({
          action: 'PUBLISH',
          entityType: 'Announcement',
          entityId: announcement.id,
          description: `Published announcement: ${announcement.title}`,
          metadata: {
            publishedAt: announcement.publishedAt,
          },
          userId,
          branchId,
          ipAddress,
          userAgent,
        });
      } catch (auditError) {
        this.logger.error(`Failed to create audit log: ${auditError.message}`);
      }

      this.logger.log(`Announcement published: ${announcement.id} by user ${userId}`);
      return announcement;
    } catch (error) {
      this.logger.error(`Failed to publish announcement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Schedule an announcement
   */
  async schedule(
    id: string,
    scheduledFor: Date,
    userId: string,
    branchId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      const existing = await this.prisma.announcement.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Announcement with id ${id} not found`);
      }

      if (existing.branchId !== branchId) {
        throw new ForbiddenException('You do not have permission to schedule this announcement');
      }

      const announcement = await this.prisma.announcement.update({
        where: { id },
        data: {
          status: 'SCHEDULED',
          scheduledFor,
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Audit log
      try {
        await this.auditLogService.create({
          action: 'SCHEDULE',
          entityType: 'Announcement',
          entityId: announcement.id,
          description: `Scheduled announcement: ${announcement.title} for ${scheduledFor}`,
          metadata: {
            scheduledFor,
          },
          userId,
          branchId,
          ipAddress,
          userAgent,
        });
      } catch (auditError) {
        this.logger.error(`Failed to create audit log: ${auditError.message}`);
      }

      this.logger.log(`Announcement scheduled: ${announcement.id} for ${scheduledFor}`);
      return announcement;
    } catch (error) {
      this.logger.error(`Failed to schedule announcement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Archive an announcement
   */
  async archive(
    id: string,
    userId: string,
    branchId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      const existing = await this.prisma.announcement.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Announcement with id ${id} not found`);
      }

      if (existing.branchId !== branchId) {
        throw new ForbiddenException('You do not have permission to archive this announcement');
      }

      const announcement = await this.prisma.announcement.update({
        where: { id },
        data: {
          status: 'ARCHIVED',
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Audit log
      try {
        await this.auditLogService.create({
          action: 'ARCHIVE',
          entityType: 'Announcement',
          entityId: announcement.id,
          description: `Archived announcement: ${announcement.title}`,
          userId,
          branchId,
          ipAddress,
          userAgent,
        });
      } catch (auditError) {
        this.logger.error(`Failed to create audit log: ${auditError.message}`);
      }

      this.logger.log(`Announcement archived: ${announcement.id} by user ${userId}`);
      return announcement;
    } catch (error) {
      this.logger.error(`Failed to archive announcement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all announcements for a branch with filters
   */
  async findAll(
    branchId: string,
    filters?: {
      status?: string;
      category?: string;
      priority?: string;
      search?: string;
    },
    limit: number = 50,
    offset: number = 0,
  ) {
    try {
      const where: any = {
        branchId,
      };

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.category) {
        where.category = filters.category;
      }

      if (filters?.priority) {
        where.priority = filters.priority;
      }

      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { content: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [announcements, total] = await Promise.all([
        this.prisma.announcement.findMany({
          where,
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            _count: {
              select: {
                reads: true,
                deliveries: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          skip: offset,
        }),
        this.prisma.announcement.count({ where }),
      ]);

      return {
        announcements,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error(`Failed to find announcements: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find one announcement by ID
   */
  async findOne(id: string) {
    try {
      const announcement = await this.prisma.announcement.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              reads: true,
              deliveries: true,
            },
          },
        },
      });

      if (!announcement) {
        throw new NotFoundException(`Announcement with id ${id} not found`);
      }

      return announcement;
    } catch (error) {
      this.logger.error(`Failed to find announcement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get published announcements for notice board
   */
  async getPublished(branchId: string, limit: number = 50, offset: number = 0) {
    try {
      const now = new Date();

      const [announcements, total] = await Promise.all([
        this.prisma.announcement.findMany({
          where: {
            branchId,
            status: 'PUBLISHED',
            displayOnBoard: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: [
            { priority: 'desc' },
            { publishedAt: 'desc' },
          ],
          take: limit,
          skip: offset,
        }),
        this.prisma.announcement.count({
          where: {
            branchId,
            status: 'PUBLISHED',
            displayOnBoard: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
        }),
      ]);

      return {
        announcements,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error(`Failed to get published announcements: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark announcement as read by user
   */
  async markAsRead(announcementId: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.announcementRead.upsert({
        where: {
          announcementId_userId: {
            announcementId,
            userId,
          },
        },
        create: {
          announcementId,
          userId,
        },
        update: {
          readAt: new Date(),
        },
      });

      this.logger.log(`Announcement ${announcementId} marked as read by user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to mark announcement as read: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get delivery status for an announcement
   */
  async getDeliveryStatus(id: string) {
    try {
      const deliveries = await this.prisma.announcementDelivery.findMany({
        where: { announcementId: id },
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

      const stats = {
        total: deliveries.length,
        emailSent: deliveries.filter(d => d.emailSent).length,
        emailOpened: deliveries.filter(d => d.emailOpened).length,
        pushSent: deliveries.filter(d => d.pushSent).length,
        linkClicked: deliveries.filter(d => d.linkClicked).length,
        emailErrors: deliveries.filter(d => d.emailError).length,
        pushErrors: deliveries.filter(d => d.pushError).length,
      };

      return {
        deliveries,
        stats,
      };
    } catch (error) {
      this.logger.error(`Failed to get delivery status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get engagement metrics for an announcement
   */
  async getEngagementMetrics(id: string) {
    try {
      const announcement = await this.prisma.announcement.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              reads: true,
              deliveries: true,
            },
          },
        },
      });

      if (!announcement) {
        throw new NotFoundException(`Announcement with id ${id} not found`);
      }

      const deliveries = await this.prisma.announcementDelivery.findMany({
        where: { announcementId: id },
      });

      const emailSent = deliveries.filter(d => d.emailSent).length;
      const emailOpened = deliveries.filter(d => d.emailOpened).length;
      const pushSent = deliveries.filter(d => d.pushSent).length;
      const linkClicked = deliveries.filter(d => d.linkClicked).length;

      return {
        totalReads: announcement._count.reads,
        totalDeliveries: announcement._count.deliveries,
        emailSent,
        emailOpened,
        emailOpenRate: emailSent > 0 ? (emailOpened / emailSent) * 100 : 0,
        pushSent,
        linkClicked,
        clickRate: deliveries.length > 0 ? (linkClicked / deliveries.length) * 100 : 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get engagement metrics: ${error.message}`);
      throw error;
    }
  }
}
