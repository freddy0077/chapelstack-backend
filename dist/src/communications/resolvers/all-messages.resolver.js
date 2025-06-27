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
exports.AllMessagesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const message_union_1 = require("../unions/message-union");
const email_service_1 = require("../services/email.service");
const sms_service_1 = require("../services/sms.service");
const notification_service_1 = require("../services/notification.service");
const all_messages_filter_input_1 = require("../dto/all-messages-filter.input");
let AllMessagesResolver = class AllMessagesResolver {
    emailService;
    smsService;
    notificationService;
    constructor(emailService, smsService, notificationService) {
        this.emailService = emailService;
        this.smsService = smsService;
        this.notificationService = notificationService;
    }
    async allMessages(filter) {
        const branchId = filter?.branchId;
        const organisationId = filter?.organisationId;
        const startDate = filter?.startDate
            ? new Date(filter.startDate)
            : undefined;
        const endDate = filter?.endDate ? new Date(filter.endDate) : undefined;
        const types = filter?.types;
        const emails = types && !types.includes('email')
            ? []
            : await this.emailService.getEmails(branchId, organisationId);
        const sms = types && !types.includes('sms')
            ? []
            : await this.smsService.getSms(branchId, organisationId);
        const notifications = types && !types.includes('notification')
            ? []
            : await this.notificationService.getNotifications(branchId, organisationId);
        let all = [
            ...emails.map((m) => ({ ...m, _sortDate: m.sentAt || m.createdAt })),
            ...sms.map((m) => ({ ...m, _sortDate: m.sentAt || m.createdAt })),
            ...notifications.map((m) => ({ ...m, _sortDate: m.createdAt })),
        ];
        if (startDate) {
            all = all.filter((m) => new Date(m._sortDate) >= startDate);
        }
        if (endDate) {
            all = all.filter((m) => new Date(m._sortDate) <= endDate);
        }
        all.sort((a, b) => new Date(b._sortDate).getTime() - new Date(a._sortDate).getTime());
        return all;
    }
};
exports.AllMessagesResolver = AllMessagesResolver;
__decorate([
    (0, graphql_1.Query)(() => [message_union_1.MessageUnion]),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [all_messages_filter_input_1.AllMessagesFilterInput]),
    __metadata("design:returntype", Promise)
], AllMessagesResolver.prototype, "allMessages", null);
exports.AllMessagesResolver = AllMessagesResolver = __decorate([
    (0, graphql_1.Resolver)(() => message_union_1.MessageUnion),
    __metadata("design:paramtypes", [email_service_1.EmailService,
        sms_service_1.SmsService,
        notification_service_1.NotificationService])
], AllMessagesResolver);
//# sourceMappingURL=all-messages.resolver.js.map