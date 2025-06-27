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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    async countUnread() {
        return 0;
    }
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createNotification(input) {
        try {
            const { userId, branchId, memberId, organisationId, ...rest } = input;
            const data = {
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
        }
        catch (error) {
            this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getNotifications(branchId, organisationId) {
        try {
            const where = {};
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
        }
        catch (error) {
            this.logger.error(`Failed to get notifications: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getUserNotifications(userId, includeRead = false) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get user notifications: ${error.message}`, error.stack);
            throw error;
        }
    }
    async markNotificationAsRead(id) {
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
        }
        catch (error) {
            this.logger.error(`Failed to mark notification as read: ${error.message}`, error.stack);
            throw error;
        }
    }
    async markAllNotificationsAsRead(userId) {
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
        }
        catch (error) {
            this.logger.error(`Failed to mark all notifications as read: ${error.message}`, error.stack);
            return false;
        }
    }
    async deleteNotification(id) {
        try {
            await this.prisma.notification.delete({
                where: { id },
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete notification: ${error.message}`, error.stack);
            return false;
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map