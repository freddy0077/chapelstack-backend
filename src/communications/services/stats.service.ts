import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MessageStatus } from '@prisma/client';
import {
  CommunicationStatsEntity,
  MessageStatusCount,
  MessageTimeSeriesData,
  CommunicationChannelStats,
  RecipientGroupStats,
} from '../entities/communication-stats.entity';
import {
  MessagePerformanceEntity,
  MessagePerformanceMetrics,
} from '../entities/message-performance.entity';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCommunicationStats(
    branchId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<CommunicationStatsEntity> {
    // Set default date range if not provided (last 30 days)
    const end = endDate || new Date();
    const start =
      startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Build filter conditions
    const dateFilter = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    const branchFilter = branchId ? { branchId } : {};
    const filter = { ...dateFilter, ...branchFilter };

    // Get email stats
    const emailCount = await this.prisma.emailMessage.count({
      where: filter,
    });

    const emailStatusCounts = await this.getStatusCounts('email', filter);

    // Get SMS stats
    const smsCount = await this.prisma.smsMessage.count({
      where: filter,
    });

    const smsStatusCounts = await this.getStatusCounts('sms', filter);

    // Get notification stats
    const notificationCount = await this.prisma.notification.count({
      where: {
        createdAt: dateFilter.createdAt,
      },
    });

    // Get active templates
    const activeTemplates = await this.prisma.emailTemplate.count({
      where: {
        ...branchFilter,
        isActive: true,
      },
    });

    // Get messages by date (time series data)
    const messagesByDate = await this.getMessagesByDate(start, end, branchId);

    // Calculate delivery rate (delivered / sent)
    const deliveredEmails =
      emailStatusCounts.find(
        (item) =>
          item.status === MessageStatus.DELIVERED ||
          item.status === MessageStatus.SENT,
      )?.count || 0;

    const deliveredSms =
      smsStatusCounts.find((item) => item.status === MessageStatus.DELIVERED)
        ?.count || 0;

    const totalSent = emailCount + smsCount;
    const deliveryRate =
      totalSent > 0
        ? Math.round(((deliveredEmails + deliveredSms) / totalSent) * 100)
        : 0;

    return {
      totalEmailsSent: emailCount,
      totalSmsSent: smsCount,
      totalNotifications: notificationCount,
      emailStatusCounts,
      smsStatusCounts,
      messagesByDate,
      activeTemplates,
      deliveryRate,
      averageResponseTime: undefined, // Would require additional tracking data
    };
  }

  async getChannelStats(
    branchId?: string,
    startDate?: Date,
    endDate?: Date,
    channels?: string[],
  ): Promise<CommunicationChannelStats[]> {
    // Set default date range if not provided (last 30 days)
    const end = endDate || new Date();
    const start =
      startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Build filter conditions
    const dateFilter = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    const branchFilter = branchId ? { branchId } : {};
    const filter = { ...dateFilter, ...branchFilter };

    // Get email stats
    const emailCount = await this.prisma.emailMessage.count({
      where: filter,
    });

    const deliveredEmails = await this.prisma.emailMessage.count({
      where: {
        ...filter,
        status: {
          in: [MessageStatus.DELIVERED, MessageStatus.SENT],
        },
      },
    });

    // Get SMS stats
    const smsCount = await this.prisma.smsMessage.count({
      where: filter,
    });

    const deliveredSms = await this.prisma.smsMessage.count({
      where: {
        ...filter,
        status: MessageStatus.DELIVERED,
      },
    });

    // Get notification stats
    const notificationCount = await this.prisma.notification.count({
      where: {
        createdAt: dateFilter.createdAt,
      },
    });

    const readNotifications = await this.prisma.notification.count({
      where: {
        createdAt: dateFilter.createdAt,
        isRead: true,
      },
    });

    const result: CommunicationChannelStats[] = [];

    if (!channels || channels.includes('Email')) {
      result.push({
        channel: 'Email',
        messagesSent: emailCount,
        deliveryRate:
          emailCount > 0 ? Math.round((deliveredEmails / emailCount) * 100) : 0,
        openRate: undefined, // Would require tracking pixel or similar
      });
    }

    if (!channels || channels.includes('SMS')) {
      result.push({
        channel: 'SMS',
        messagesSent: smsCount,
        deliveryRate:
          smsCount > 0 ? Math.round((deliveredSms / smsCount) * 100) : 0,
        openRate: undefined, // Not applicable for SMS
      });
    }

    if (!channels || channels.includes('In-App Notification')) {
      result.push({
        channel: 'In-App Notification',
        messagesSent: notificationCount,
        deliveryRate: 100, // In-app notifications are always "delivered"
        openRate:
          notificationCount > 0
            ? Math.round((readNotifications / notificationCount) * 100)
            : 0,
      });
    }

    return result;
  }

  async getRecipientGroupStats(
    branchId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<RecipientGroupStats[]> {
    // This is a placeholder implementation
    // In a real implementation, you would analyze the recipients of messages
    // and group them by member type, ministry, etc.

    // For now, we'll return some sample data
    const dateFilter =
      startDate && endDate
        ? { createdAt: { gte: startDate, lte: endDate } }
        : {};

    const branchFilter = branchId ? { branchId } : {};
    const filter = { ...dateFilter, ...branchFilter };

    return [
      {
        groupName: 'All Members',
        recipientCount: await this.prisma.member.count({
          where: branchId ? { branchId } : {},
        }),
        messagesSent: await this.getTotalMessagesSentToGroup('all', branchId),
      },
      {
        groupName: 'Active Members',
        recipientCount: await this.prisma.member.count({
          where: {
            ...(branchId ? { branchId } : {}),
            status: 'ACTIVE',
          },
        }),
        messagesSent: await this.getTotalMessagesSentToGroup(
          'active',
          branchId,
        ),
      },
      {
        groupName: 'Ministry Leaders',
        recipientCount: await this.prisma.groupMember.count({
          where: {
            role: 'LEADER',
            ...(branchId ? { ministry: { branchId } } : {}),
          },
        }),
        messagesSent: await this.getTotalMessagesSentToGroup(
          'leaders',
          branchId,
        ),
      },
    ];
  }

  async getMessagePerformanceMetrics(
    branchId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<MessagePerformanceEntity> {
    // Set default date range if not provided (last 30 days)
    const end = endDate || new Date();
    const start =
      startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Build filter conditions
    const dateFilter = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    const branchFilter = branchId ? { branchId } : {};
    const filter = { ...dateFilter, ...branchFilter };

    // Get all email templates
    const templates = await this.prisma.emailTemplate.findMany({
      where: branchFilter,
      select: {
        id: true,
        name: true,
      },
    });

    // Calculate metrics for each template
    const templateMetrics: MessagePerformanceMetrics[] = [];
    let totalSent = 0;
    let totalDelivered = 0;

    for (const template of templates) {
      const sent = await this.prisma.emailMessage.count({
        where: {
          ...filter,
          templateId: template.id,
        },
      });

      const delivered = await this.prisma.emailMessage.count({
        where: {
          ...filter,
          templateId: template.id,
          status: {
            in: [MessageStatus.DELIVERED, MessageStatus.SENT],
          },
        },
      });

      // In a real implementation, you would track opens, clicks, and responses
      // For now, we'll simulate this data
      const openRate = Math.random() * 0.7; // 0-70% open rate
      const opened = Math.floor(delivered * openRate);
      const clickRate = Math.random() * 0.3; // 0-30% click rate
      const responseRate = Math.random() * 0.1; // 0-10% response rate

      totalSent += sent;
      totalDelivered += delivered;

      if (sent > 0) {
        templateMetrics.push({
          templateName: template.name,
          totalSent: sent,
          delivered,
          deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
          opened,
          openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
          clickRate: delivered > 0 ? clickRate * 100 : 0,
          responseRate: delivered > 0 ? responseRate * 100 : 0,
          averageResponseTime: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
        });
      }
    }

    // Add metrics for templates without a template (direct emails)
    const directSent = await this.prisma.emailMessage.count({
      where: {
        ...filter,
        templateId: null,
      },
    });

    const directDelivered = await this.prisma.emailMessage.count({
      where: {
        ...filter,
        templateId: null,
        status: {
          in: [MessageStatus.DELIVERED, MessageStatus.SENT],
        },
      },
    });

    if (directSent > 0) {
      const openRate = Math.random() * 0.6; // 0-60% open rate for direct emails
      const opened = Math.floor(directDelivered * openRate);
      const clickRate = Math.random() * 0.2; // 0-20% click rate
      const responseRate = Math.random() * 0.15; // 0-15% response rate

      totalSent += directSent;
      totalDelivered += directDelivered;

      templateMetrics.push({
        templateName: 'Direct Emails (No Template)',
        totalSent: directSent,
        delivered: directDelivered,
        deliveryRate: directSent > 0 ? (directDelivered / directSent) * 100 : 0,
        opened,
        openRate: directDelivered > 0 ? (opened / directDelivered) * 100 : 0,
        clickRate: directDelivered > 0 ? clickRate * 100 : 0,
        responseRate: directDelivered > 0 ? responseRate * 100 : 0,
        averageResponseTime: `${Math.floor(Math.random() * 36)}h ${Math.floor(Math.random() * 60)}m`,
      });
    }

    // Sort by total sent (descending)
    templateMetrics.sort((a, b) => b.totalSent - a.totalSent);

    // Calculate overall metrics
    const overallDeliveryRate =
      totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const overallOpenRate =
      totalDelivered > 0
        ? (templateMetrics.reduce(
            (sum, metric) => sum + (metric.opened || 0),
            0,
          ) /
            totalDelivered) *
          100
        : 0;
    const overallResponseRate =
      totalDelivered > 0
        ? (templateMetrics.reduce(
            (sum, metric) =>
              sum + ((metric.responseRate || 0) * metric.delivered) / 100,
            0,
          ) /
            totalDelivered) *
          100
        : 0;

    return {
      templates: templateMetrics,
      overallDeliveryRate,
      overallOpenRate,
      overallResponseRate,
    };
  }

  // Helper methods
  private async getStatusCounts(
    messageType: 'email' | 'sms',
    filter: any,
  ): Promise<MessageStatusCount[]> {
    let statusCounts;
    if (messageType === 'email') {
      statusCounts = await this.prisma.emailMessage.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
        where: filter,
      });
    } else {
      statusCounts = await this.prisma.smsMessage.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
        where: filter,
      });
    }

    return statusCounts.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));
  }

  private async getMessagesByDate(
    startDate: Date,
    endDate: Date,
    branchId?: string,
  ): Promise<MessageTimeSeriesData[]> {
    // Generate date range
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // For each date, count messages
    const result: MessageTimeSeriesData[] = [];

    for (const date of dates) {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const branchFilter = branchId ? { branchId } : {};

      const emailCount = await this.prisma.emailMessage.count({
        where: {
          ...branchFilter,
          createdAt: {
            gte: date,
            lt: nextDay,
          },
        },
      });

      const smsCount = await this.prisma.smsMessage.count({
        where: {
          ...branchFilter,
          createdAt: {
            gte: date,
            lt: nextDay,
          },
        },
      });

      result.push({
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        count: emailCount + smsCount,
      });
    }

    return result;
  }

  private async getTotalMessagesSentToGroup(
    groupType: string,
    branchId?: string,
  ): Promise<number> {
    // This is a placeholder implementation
    // In a real implementation, you would query the database to find messages sent to specific groups

    // For demonstration purposes, we'll return some sample data
    const baseCount = Math.floor(Math.random() * 100) + 50;

    switch (groupType) {
      case 'all':
        return baseCount * 3;
      case 'active':
        return baseCount * 2;
      case 'leaders':
        return baseCount;
      default:
        return 0;
    }
  }
}
