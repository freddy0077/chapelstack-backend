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
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SmsService = SmsService_1 = class SmsService {
    prisma;
    configService;
    async countSentLast30Days() {
        return 0;
    }
    logger = new common_1.Logger(SmsService_1.name);
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async sendSms(input) {
        try {
            const { branchId, organisationId, ...rest } = input;
            const data = {
                body: rest.message,
                senderNumber: this.configService.get('SMS_SENDER_NUMBER') || 'CHURCH',
                recipients: rest.recipients,
                status: client_1.MessageStatus.SENDING,
            };
            if (branchId) {
                data.branch = { connect: { id: branchId } };
            }
            if (organisationId) {
                data.organisation = { connect: { id: organisationId } };
            }
            const smsMessage = await this.prisma.smsMessage.create({ data });
            this.logger.log(`[MOCK] Sending SMS to ${input.recipients.join(', ')}: ${input.message}`);
            await this.prisma.smsMessage.update({
                where: { id: smsMessage.id },
                data: {
                    status: client_1.MessageStatus.SENT,
                    sentAt: new Date(),
                },
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
            return false;
        }
    }
    async getSms(branchId, organisationId) {
        try {
            const where = {};
            if (branchId) {
                where.branchId = branchId;
            }
            if (organisationId) {
                where.organisationId = organisationId;
            }
            const messages = await this.prisma.smsMessage.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });
            return messages.map((message) => ({
                ...message,
                status: message.status,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to get SMS messages: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
    async getSmsMessage(id) {
        try {
            const message = await this.prisma.smsMessage.findUnique({
                where: { id },
            });
            if (!message) {
                throw new Error(`SMS message with ID ${id} not found`);
            }
            return {
                ...message,
                status: message.status,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get SMS message: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], SmsService);
//# sourceMappingURL=sms.service.js.map