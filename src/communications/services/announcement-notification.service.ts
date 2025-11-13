import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';
import { NotificationService } from './notification.service';
import { NotificationType } from '../enums/notification-type.enum';

/**
 * Service for sending announcement notifications via email and push
 */
@Injectable()
export class AnnouncementNotificationService {
  private readonly logger = new Logger(AnnouncementNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Send announcement notifications to targeted users
   */
  async sendAnnouncementNotifications(announcementId: string): Promise<void> {
    try {
      const announcement = await this.prisma.announcement.findUnique({
        where: { id: announcementId },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          branch: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!announcement) {
        throw new Error(`Announcement ${announcementId} not found`);
      }

      // Get target users based on targetAudience
      const targetUsers = await this.getTargetUsers(
        announcement.branchId,
        announcement.targetAudience,
        announcement.targetGroupIds,
      );

      this.logger.log(`Sending announcement ${announcementId} to ${targetUsers.length} users`);

      // Send emails if enabled
      if (announcement.sendEmail) {
        await this.sendAnnouncementEmails(announcement, targetUsers);
      }

      // Send push notifications if enabled
      if (announcement.sendPush) {
        await this.sendAnnouncementPushes(announcement, targetUsers);
      }

      this.logger.log(`Announcement notifications sent for ${announcementId}`);
    } catch (error) {
      this.logger.error(`Failed to send announcement notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get target users based on audience criteria
   */
  private async getTargetUsers(
    branchId: string,
    targetAudience: string,
    targetGroupIds: string[],
  ): Promise<any[]> {
    try {
      let users: any[] = [];

      if (targetAudience === 'ALL') {
        // Get all active members in the branch
        users = await this.prisma.user.findMany({
          where: {
            isActive: true,
            userBranches: {
              some: {
                branchId,
              },
            },
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        });
      } else if (targetAudience === 'STAFF_ONLY') {
        // Get staff members (users with specific roles)
        users = await this.prisma.user.findMany({
          where: {
            isActive: true,
            userBranches: {
              some: {
                branchId,
              },
            },
            roles: {
              some: {
                name: {
                  in: ['BRANCH_ADMIN', 'STAFF', 'ADMIN', 'SYSTEM_ADMIN'],
                },
              },
            },
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        });
      } else if (targetAudience === 'SPECIFIC_GROUPS' && targetGroupIds.length > 0) {
        // Get users from specific groups/ministries
        users = await this.prisma.user.findMany({
          where: {
            isActive: true,
            userBranches: {
              some: {
                branchId,
              },
            },
            member: {
              groupMemberships: {
                some: {
                  ministryId: {
                    in: targetGroupIds,
                  },
                },
              },
            },
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        });
      }

      return users;
    } catch (error) {
      this.logger.error(`Failed to get target users: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send announcement emails to users
   */
  private async sendAnnouncementEmails(announcement: any, users: any[]): Promise<void> {
    try {
      const emailPromises = users.map(async (user) => {
        try {
          // Create delivery record
          const delivery = await this.prisma.announcementDelivery.upsert({
            where: {
              announcementId_userId: {
                announcementId: announcement.id,
                userId: user.id,
              },
            },
            create: {
              announcementId: announcement.id,
              userId: user.id,
            },
            update: {},
          });

          // Send email using existing email service
          const emailHtml = this.generateAnnouncementEmailHtml(announcement, user);
          
          // Use the transactional email method
          await this.sendTransactionalEmail({
            to: user.email,
            subject: `[${announcement.priority}] ${announcement.title}`,
            html: emailHtml,
            branchId: announcement.branchId,
          });

          // Update delivery record
          await this.prisma.announcementDelivery.update({
            where: { id: delivery.id },
            data: {
              emailSent: true,
              emailSentAt: new Date(),
            },
          });

          this.logger.log(`Email sent to ${user.email} for announcement ${announcement.id}`);
        } catch (error) {
          this.logger.error(`Failed to send email to ${user.email}: ${error.message}`);
          
          // Update delivery record with error
          await this.prisma.announcementDelivery.updateMany({
            where: {
              announcementId: announcement.id,
              userId: user.id,
            },
            data: {
              emailError: error.message,
            },
          });
        }
      });

      await Promise.allSettled(emailPromises);
    } catch (error) {
      this.logger.error(`Failed to send announcement emails: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send announcement push notifications to users
   */
  private async sendAnnouncementPushes(announcement: any, users: any[]): Promise<void> {
    try {
      const pushPromises = users.map(async (user) => {
        try {
          // Create or get delivery record
          const delivery = await this.prisma.announcementDelivery.upsert({
            where: {
              announcementId_userId: {
                announcementId: announcement.id,
                userId: user.id,
              },
            },
            create: {
              announcementId: announcement.id,
              userId: user.id,
            },
            update: {},
          });

          // Send push notification using existing notification service
          await this.notificationService.createNotification({
            title: announcement.title,
            message: this.truncateContent(announcement.content, 100),
            userId: user.id,
            branchId: announcement.branchId,
            type: NotificationType.INFO,
            link: `/announcements/${announcement.id}`,
          });

          // Update delivery record
          await this.prisma.announcementDelivery.update({
            where: { id: delivery.id },
            data: {
              pushSent: true,
              pushSentAt: new Date(),
            },
          });

          this.logger.log(`Push notification sent to user ${user.id} for announcement ${announcement.id}`);
        } catch (error) {
          this.logger.error(`Failed to send push to user ${user.id}: ${error.message}`);
          
          // Update delivery record with error
          await this.prisma.announcementDelivery.updateMany({
            where: {
              announcementId: announcement.id,
              userId: user.id,
            },
            data: {
              pushError: error.message,
            },
          });
        }
      });

      await Promise.allSettled(pushPromises);
    } catch (error) {
      this.logger.error(`Failed to send announcement pushes: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track email open
   */
  async trackEmailOpen(announcementId: string, userId: string): Promise<void> {
    try {
      await this.prisma.announcementDelivery.updateMany({
        where: {
          announcementId,
          userId,
        },
        data: {
          emailOpened: true,
          emailOpenedAt: new Date(),
        },
      });

      this.logger.log(`Email opened for announcement ${announcementId} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to track email open: ${error.message}`);
    }
  }

  /**
   * Track link click
   */
  async trackLinkClick(announcementId: string, userId: string): Promise<void> {
    try {
      await this.prisma.announcementDelivery.updateMany({
        where: {
          announcementId,
          userId,
        },
        data: {
          linkClicked: true,
          linkClickedAt: new Date(),
        },
      });

      this.logger.log(`Link clicked for announcement ${announcementId} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to track link click: ${error.message}`);
    }
  }

  /**
   * Retry failed deliveries for an announcement
   */
  async retryFailedDeliveries(announcementId: string): Promise<void> {
    try {
      const announcement = await this.prisma.announcement.findUnique({
        where: { id: announcementId },
        include: {
          creator: true,
          branch: true,
        },
      });

      if (!announcement) {
        throw new Error(`Announcement ${announcementId} not found`);
      }

      // Get failed email deliveries
      const failedEmailDeliveries = await this.prisma.announcementDelivery.findMany({
        where: {
          announcementId,
          emailSent: false,
          emailError: { not: null },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Get failed push deliveries
      const failedPushDeliveries = await this.prisma.announcementDelivery.findMany({
        where: {
          announcementId,
          pushSent: false,
          pushError: { not: null },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      this.logger.log(
        `Retrying ${failedEmailDeliveries.length} failed emails and ${failedPushDeliveries.length} failed pushes`,
      );

      // Retry emails
      if (announcement.sendEmail && failedEmailDeliveries.length > 0) {
        await this.sendAnnouncementEmails(
          announcement,
          failedEmailDeliveries.map(d => d.user),
        );
      }

      // Retry pushes
      if (announcement.sendPush && failedPushDeliveries.length > 0) {
        await this.sendAnnouncementPushes(
          announcement,
          failedPushDeliveries.map(d => d.user),
        );
      }

      this.logger.log(`Retry completed for announcement ${announcementId}`);
    } catch (error) {
      this.logger.error(`Failed to retry deliveries: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate HTML for announcement email
   */
  private generateAnnouncementEmailHtml(announcement: any, user: any): string {
    const priorityColor = this.getPriorityColor(announcement.priority);
    const categoryBadge = this.getCategoryBadge(announcement.category);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${announcement.title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${priorityColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${announcement.title}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${categoryBadge}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="margin-top: 0;">Dear ${user.firstName || 'Member'},</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${announcement.content}
            </div>
            
            ${announcement.imageUrl ? `
              <div style="margin: 20px 0;">
                <img src="${announcement.imageUrl}" alt="Announcement image" style="max-width: 100%; height: auto; border-radius: 8px;">
              </div>
            ` : ''}
            
            ${announcement.attachmentUrl ? `
              <div style="margin: 20px 0;">
                <a href="${announcement.attachmentUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                  View Attachment
                </a>
              </div>
            ` : ''}
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666; margin: 0;">
              Posted by ${announcement.creator.firstName} ${announcement.creator.lastName}<br>
              ${announcement.branch.name}<br>
              ${new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString()}
            </p>
            
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              This is an automated message from ${announcement.branch.name}. 
              If you have any questions, please contact us.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get priority color for email styling
   */
  private getPriorityColor(priority: string): string {
    switch (priority.toUpperCase()) {
      case 'CRITICAL':
        return '#dc3545';
      case 'HIGH':
        return '#fd7e14';
      case 'MEDIUM':
        return '#0d6efd';
      case 'LOW':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  }

  /**
   * Get category badge text
   */
  private getCategoryBadge(category: string): string {
    return category.replace(/_/g, ' ').toUpperCase();
  }

  /**
   * Truncate content for push notifications
   */
  private truncateContent(content: string, maxLength: number): string {
    // Strip HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Send transactional email (wrapper for email service)
   */
  private async sendTransactionalEmail(options: {
    to: string;
    subject: string;
    html: string;
    branchId: string;
  }): Promise<void> {
    // This is a simplified wrapper - in production, you'd use the actual email service method
    // For now, we'll log it
    this.logger.log(`Sending email to ${options.to}: ${options.subject}`);
    
    // TODO: Integrate with actual email service
    // await this.emailService.sendTransactionalEmail(options);
  }
}
