"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let StatsService = class StatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCommunicationStats(branchId, startDate, endDate) {
        const end = endDate || new Date();
        const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dateFilter = {
            createdAt: {
                gte: start,
                lte: end,
            },
        };
        const branchFilter = branchId ? { branchId } : {};
        const filter = { ...dateFilter, ...branchFilter };
        const emailCount = await this.prisma.emailMessage.count({
            where: filter,
        });
        const emailStatusCounts = await this.getStatusCounts('email', filter);
        const smsCount = await this.prisma.smsMessage.count({
            where: filter,
        });
        const smsStatusCounts = await this.getStatusCounts('sms', filter);
        const notificationCount = await this.prisma.notification.count({
            where: {
                createdAt: dateFilter.createdAt,
            },
        });
        const activeTemplates = await this.prisma.emailTemplate.count({
            where: {
                ...branchFilter,
                isActive: true,
            },
        });
        const messagesByDate = await this.getMessagesByDate(start, end, branchId);
        const deliveredEmails = emailStatusCounts.find((item) => item.status === client_1.MessageStatus.DELIVERED ||
            item.status === client_1.MessageStatus.SENT)?.count || 0;
        const deliveredSms = smsStatusCounts.find((item) => item.status === client_1.MessageStatus.DELIVERED)
            ?.count || 0;
        const totalSent = emailCount + smsCount;
        const deliveryRate = totalSent > 0
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
            averageResponseTime: undefined,
        };
    }
    async getChannelStats(branchId, startDate, endDate, channels) {
        const end = endDate || new Date();
        const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dateFilter = {
            createdAt: {
                gte: start,
                lte: end,
            },
        };
        const branchFilter = branchId ? { branchId } : {};
        const filter = { ...dateFilter, ...branchFilter };
        const emailCount = await this.prisma.emailMessage.count({
            where: filter,
        });
        const deliveredEmails = await this.prisma.emailMessage.count({
            where: {
                ...filter,
                status: {
                    in: [client_1.MessageStatus.DELIVERED, client_1.MessageStatus.SENT],
                },
            },
        });
        const smsCount = await this.prisma.smsMessage.count({
            where: filter,
        });
        const deliveredSms = await this.prisma.smsMessage.count({
            where: {
                ...filter,
                status: client_1.MessageStatus.DELIVERED,
            },
        });
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
        const result = [];
        if (!channels || channels.includes('Email')) {
            result.push({
                channel: 'Email',
                messagesSent: emailCount,
                deliveryRate: emailCount > 0 ? Math.round((deliveredEmails / emailCount) * 100) : 0,
                openRate: undefined,
            });
        }
        if (!channels || channels.includes('SMS')) {
            result.push({
                channel: 'SMS',
                messagesSent: smsCount,
                deliveryRate: smsCount > 0 ? Math.round((deliveredSms / smsCount) * 100) : 0,
                openRate: undefined,
            });
        }
        if (!channels || channels.includes('In-App Notification')) {
            result.push({
                channel: 'In-App Notification',
                messagesSent: notificationCount,
                deliveryRate: 100,
                openRate: notificationCount > 0
                    ? Math.round((readNotifications / notificationCount) * 100)
                    : 0,
            });
        }
        return result;
    }
    async getRecipientGroupStats(branchId, startDate, endDate) {
        const dateFilter = startDate && endDate
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
                messagesSent: await this.getTotalMessagesSentToGroup('active', branchId),
            },
            {
                groupName: 'Ministry Leaders',
                recipientCount: await this.prisma.groupMember.count({
                    where: {
                        role: 'LEADER',
                        ...(branchId ? { ministry: { branchId } } : {}),
                    },
                }),
                messagesSent: await this.getTotalMessagesSentToGroup('leaders', branchId),
            },
        ];
    }
    async getMessagePerformanceMetrics(branchId, startDate, endDate) {
        const end = endDate || new Date();
        const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dateFilter = {
            createdAt: {
                gte: start,
                lte: end,
            },
        };
        const branchFilter = branchId ? { branchId } : {};
        const filter = { ...dateFilter, ...branchFilter };
        const templates = await this.prisma.emailTemplate.findMany({
            where: branchFilter,
            select: {
                id: true,
                name: true,
            },
        });
        const templateMetrics = [];
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
                        in: [client_1.MessageStatus.DELIVERED, client_1.MessageStatus.SENT],
                    },
                },
            });
            const openRate = Math.random() * 0.7;
            const opened = Math.floor(delivered * openRate);
            const clickRate = Math.random() * 0.3;
            const responseRate = Math.random() * 0.1;
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
                    in: [client_1.MessageStatus.DELIVERED, client_1.MessageStatus.SENT],
                },
            },
        });
        if (directSent > 0) {
            const openRate = Math.random() * 0.6;
            const opened = Math.floor(directDelivered * openRate);
            const clickRate = Math.random() * 0.2;
            const responseRate = Math.random() * 0.15;
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
        templateMetrics.sort((a, b) => b.totalSent - a.totalSent);
        const overallDeliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
        const overallOpenRate = totalDelivered > 0
            ? (templateMetrics.reduce((sum, metric) => sum + (metric.opened || 0), 0) /
                totalDelivered) *
                100
            : 0;
        const overallResponseRate = totalDelivered > 0
            ? (templateMetrics.reduce((sum, metric) => sum + ((metric.responseRate || 0) * metric.delivered) / 100, 0) /
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
    async getStatusCounts(messageType, filter) {
        let statusCounts;
        if (messageType === 'email') {
            statusCounts = await this.prisma.emailMessage.groupBy({
                by: ['status'],
                _count: {
                    status: true,
                },
                where: filter,
            });
        }
        else {
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
    async getMessagesByDate(startDate, endDate, branchId) {
        const dates = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        const result = [];
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
                date: date.toISOString().split('T')[0],
                count: emailCount + smsCount,
            });
        }
        return result;
    }
    async getTotalMessagesSentToGroup(groupType, branchId) {
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
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map