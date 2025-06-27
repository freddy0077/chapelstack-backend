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
exports.EmailResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const email_service_1 = require("../services/email.service");
const send_email_input_1 = require("../dto/send-email.input");
const email_message_dto_1 = require("../dto/email-message.dto");
const create_email_template_input_1 = require("../dto/create-email-template.input");
const update_email_template_input_1 = require("../dto/update-email-template.input");
const email_template_dto_1 = require("../dto/email-template.dto");
let EmailResolver = class EmailResolver {
    emailService;
    constructor(emailService) {
        this.emailService = emailService;
    }
    async sendEmail(input) {
        return this.emailService.sendEmail(input);
    }
    async emails(branchId, organisationId) {
        return this.emailService.getEmails(branchId, organisationId);
    }
    async templates(branchId, organisationId) {
        return this.emailService.getEmailTemplates(branchId, organisationId);
    }
    async template(id) {
        return this.emailService.getEmailTemplate(id);
    }
    async createEmailTemplate(input) {
        return this.emailService.createEmailTemplate(input);
    }
    async updateEmailTemplate(id, input) {
        return this.emailService.updateEmailTemplate(id, input);
    }
    async deleteEmailTemplate(id) {
        return this.emailService.deleteEmailTemplate(id);
    }
};
exports.EmailResolver = EmailResolver;
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_email_input_1.SendEmailInput]),
    __metadata("design:returntype", Promise)
], EmailResolver.prototype, "sendEmail", null);
__decorate([
    (0, graphql_1.Query)(() => [email_message_dto_1.EmailMessageDto]),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID, nullable: true })),
    __param(1, (0, graphql_1.Args)('organisationId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailResolver.prototype, "emails", null);
__decorate([
    (0, graphql_1.Query)(() => [email_template_dto_1.EmailTemplateDto]),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID, nullable: true })),
    __param(1, (0, graphql_1.Args)('organisationId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailResolver.prototype, "templates", null);
__decorate([
    (0, graphql_1.Query)(() => email_template_dto_1.EmailTemplateDto),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailResolver.prototype, "template", null);
__decorate([
    (0, graphql_1.Mutation)(() => email_template_dto_1.EmailTemplateDto),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_email_template_input_1.CreateEmailTemplateInput]),
    __metadata("design:returntype", Promise)
], EmailResolver.prototype, "createEmailTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => email_template_dto_1.EmailTemplateDto),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_email_template_input_1.UpdateEmailTemplateInput]),
    __metadata("design:returntype", Promise)
], EmailResolver.prototype, "updateEmailTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailResolver.prototype, "deleteEmailTemplate", null);
exports.EmailResolver = EmailResolver = __decorate([
    (0, graphql_1.Resolver)(() => email_message_dto_1.EmailMessageDto),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailResolver);
//# sourceMappingURL=email.resolver.js.map