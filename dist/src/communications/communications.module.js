"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const email_service_1 = require("./services/email.service");
const sms_service_1 = require("./services/sms.service");
const notification_service_1 = require("./services/notification.service");
const template_service_1 = require("./services/template.service");
const stats_service_1 = require("./services/stats.service");
const email_resolver_1 = require("./resolvers/email.resolver");
const sms_resolver_1 = require("./resolvers/sms.resolver");
const notification_resolver_1 = require("./resolvers/notification.resolver");
const template_resolver_1 = require("./resolvers/template.resolver");
const stats_resolver_1 = require("./resolvers/stats.resolver");
const all_messages_resolver_1 = require("./resolvers/all-messages.resolver");
const config_1 = require("@nestjs/config");
let CommunicationsModule = class CommunicationsModule {
};
exports.CommunicationsModule = CommunicationsModule;
exports.CommunicationsModule = CommunicationsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, config_1.ConfigModule],
        providers: [
            email_service_1.EmailService,
            sms_service_1.SmsService,
            notification_service_1.NotificationService,
            template_service_1.TemplateService,
            stats_service_1.StatsService,
            email_resolver_1.EmailResolver,
            sms_resolver_1.SmsResolver,
            notification_resolver_1.NotificationResolver,
            template_resolver_1.TemplateResolver,
            stats_resolver_1.StatsResolver,
            all_messages_resolver_1.AllMessagesResolver,
        ],
        exports: [
            email_service_1.EmailService,
            sms_service_1.SmsService,
            notification_service_1.NotificationService,
            template_service_1.TemplateService,
            stats_service_1.StatsService,
        ],
    })
], CommunicationsModule);
//# sourceMappingURL=communications.module.js.map