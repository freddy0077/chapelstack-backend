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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const notification_service_1 = require("../services/notification.service");
const create_notification_input_1 = require("../dto/create-notification.input");
const notification_dto_1 = require("../dto/notification.dto");
let NotificationResolver = class NotificationResolver {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async notifications(branchId, organisationId) {
        return this.notificationService.getNotifications(branchId, organisationId);
    }
    async userNotifications(userId, includeRead) {
        return this.notificationService.getUserNotifications(userId, includeRead);
    }
    async createNotification(input) {
        return this.notificationService.createNotification(input);
    }
    async markNotificationAsRead(notificationId) {
        return this.notificationService.markNotificationAsRead(notificationId);
    }
    async markAllNotificationsAsRead(userId) {
        return this.notificationService.markAllNotificationsAsRead(userId);
    }
    async deleteNotification(notificationId) {
        return this.notificationService.deleteNotification(notificationId);
    }
};
exports.NotificationResolver = NotificationResolver;
__decorate([
    (0, graphql_1.Query)(() => [notification_dto_1.NotificationDto]),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID, nullable: true })),
    __param(1, (0, graphql_1.Args)('organisationId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "notifications", null);
__decorate([
    (0, graphql_1.Query)(() => [notification_dto_1.NotificationDto]),
    __param(0, (0, graphql_1.Args)('userId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('includeRead', {
        type: () => Boolean,
        nullable: true,
        defaultValue: false,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "userNotifications", null);
__decorate([
    (0, graphql_1.Mutation)(() => notification_dto_1.NotificationDto),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_input_1.CreateNotificationInput]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "createNotification", null);
__decorate([
    (0, graphql_1.Mutation)(() => notification_dto_1.NotificationDto),
    __param(0, (0, graphql_1.Args)('notificationId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "markNotificationAsRead", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('userId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "markAllNotificationsAsRead", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('notificationId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "deleteNotification", null);
exports.NotificationResolver = NotificationResolver = __decorate([
    (0, graphql_1.Resolver)(() => notification_dto_1.NotificationDto),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationResolver);
//# sourceMappingURL=notification.resolver.js.map