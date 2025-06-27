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
exports.SmsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const sms_service_1 = require("../services/sms.service");
const send_sms_input_1 = require("../dto/send-sms.input");
const sms_message_dto_1 = require("../dto/sms-message.dto");
let SmsResolver = class SmsResolver {
    smsService;
    constructor(smsService) {
        this.smsService = smsService;
    }
    async sendSms(input) {
        return this.smsService.sendSms(input);
    }
    async sms(branchId, organisationId) {
        return this.smsService.getSms(branchId, organisationId);
    }
    async smsById(id) {
        return this.smsService.getSmsMessage(id);
    }
};
exports.SmsResolver = SmsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_sms_input_1.SendSmsInput]),
    __metadata("design:returntype", Promise)
], SmsResolver.prototype, "sendSms", null);
__decorate([
    (0, graphql_1.Query)(() => [sms_message_dto_1.SmsMessageDto]),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID, nullable: true })),
    __param(1, (0, graphql_1.Args)('organisationId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SmsResolver.prototype, "sms", null);
__decorate([
    (0, graphql_1.Query)(() => sms_message_dto_1.SmsMessageDto),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SmsResolver.prototype, "smsById", null);
exports.SmsResolver = SmsResolver = __decorate([
    (0, graphql_1.Resolver)(() => sms_message_dto_1.SmsMessageDto),
    __metadata("design:paramtypes", [sms_service_1.SmsService])
], SmsResolver);
//# sourceMappingURL=sms.resolver.js.map