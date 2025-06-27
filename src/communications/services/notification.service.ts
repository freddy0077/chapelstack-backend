import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationInput } from '../dto/create-notification.input';
import { NotificationDto } from '../dto/notification.dto';

@Injectable()
export class NotificationService {
  /**
   * Returns the number of unread notifications in the system.
   * TODO: Implement actual count logic.
   */
  async countUnread(): Promise<number> {
    // TODO: Implement actual count logic
    return 0;
  }

  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new notification for a user
   * @param input CreateNotificationInput
   * @returns Promise<NotificationDto>
   */
  async createNotification(
    input: CreateNotificationInput,
  ): Promise<NotificationDto> {
    try {
      const { userId, branchId, memberId, organisationId, ...rest } = input;
      const data: Prisma.NotificationCreateInput = {
        ...rest,
        user: { connect: { id: userId } },
      };

      if (branchId) {
        data.branch = { connect: { id: branchId } };
      }
      if (memberId) {
        data.Member = { connect: { id: memberId } };
      }
      if (organisationId) {
        data.organisation = { connect: { id: organisationId } };
      }

      const notification = await this.prisma.notification.create({ data });

      return {
        ...notification,
        branchId: notification.branchId ?? undefined,
        memberId: notification.memberId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all notifications, optionally filtered by branch and organisation
   * @param branchId Optional branch ID to filter notifications
   * @param organisationId Optional organisation ID to filter notifications
   * @returns Promise<NotificationDto[]>
   */
  async getNotifications(
    branchId?: string,
    organisationId?: string,
  ): Promise<NotificationDto[]> {
    try {
      const where: Prisma.NotificationWhereInput = {};
      if (branchId) {
        where.branchId = branchId;
      }
      if (organisationId) {
        where.organisationId = organisationId;
      }
      const notifications = await this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return notifications.map((n) => ({
        ...n,
        branchId: n.branchId ?? undefined,
        memberId: n.memberId,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get notifications: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   * @param userId User ID
   * @param includeRead Whether to include read notifications (default: false)
   * @returns Promise<NotificationDto[]>
   */
  async getUserNotifications(
    userId: string,
    includeRead = false,
  ): Promise<NotificationDto[]> {
    try {
      const where = {
        userId,
        ...(includeRead ? {} : { isRead: false }),
      };

      const notifications = await this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return notifications.map((n) => ({
        ...n,
        branchId: n.branchId ?? undefined,
        memberId: n.memberId,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get user notifications: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param id Notification ID
   * @returns Promise<NotificationDto>
   */
  async markNotificationAsRead(id: string): Promise<NotificationDto> {
    try {
      const notification = await this.prisma.notification.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return {
        ...notification,
        branchId: notification.branchId ?? undefined,
        memberId: notification.memberId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to mark notification as read: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Mark all notifications for a user as read
   * @param userId User ID
   * @returns Promise<boolean>
   */
  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      await this.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to mark all notifications as read: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Delete a notification
   * @param id Notification ID
   * @returns Promise<boolean>
   */
  async deleteNotification(id: string): Promise<boolean> {
    try {
      await this.prisma.notification.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete notification: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
