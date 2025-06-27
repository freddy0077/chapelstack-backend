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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const template_service_1 = require("./template.service");
let EmailService = EmailService_1 = class EmailService {
    prisma;
    configService;
    templateService;
    async countSentLast30Days() {
        return 0;
    }
    logger = new common_1.Logger(EmailService_1.name);
    constructor(prisma, configService, templateService) {
        this.prisma = prisma;
        this.configService = configService;
        this.templateService = templateService;
    }
    async sendEmail(input) {
        try {
            const { branchId, organisationId, templateId, ...rest } = input;
            let bodyHtml = rest.bodyHtml;
            let bodyText = rest.bodyText;
            let subject = rest.subject;
            if (templateId) {
                const template = await this.prisma.emailTemplate.findUnique({
                    where: { id: templateId },
                });
                if (!template) {
                    throw new Error(`Email template with ID ${templateId} not found`);
                }
                bodyHtml = template.bodyHtml;
                bodyText = template.bodyText || '';
                subject = template.subject;
                if (rest.templateData) {
                    Object.entries(rest.templateData).forEach(([key, value]) => {
                        const regex = new RegExp(`{{\s*${key}\s*}}`, 'g');
                        if (bodyHtml) {
                            bodyHtml = bodyHtml.replace(regex, String(value));
                        }
                        if (bodyText) {
                            bodyText = bodyText.replace(regex, String(value));
                        }
                        subject = subject.replace(regex, String(value));
                    });
                }
            }
            const data = {
                subject,
                bodyHtml: bodyHtml || '',
                bodyText,
                senderEmail: this.configService.get('EMAIL_SENDER') ||
                    'noreply@church.org',
                recipients: rest.recipients,
                status: 'SENDING',
            };
            if (branchId) {
                data.branch = { connect: { id: branchId } };
            }
            if (organisationId) {
                data.organisation = { connect: { id: organisationId } };
            }
            if (templateId) {
                data.template = { connect: { id: templateId } };
            }
            const emailMessage = await this.prisma.emailMessage.create({ data });
            this.logger.log(`[MOCK] Sending email to ${input.recipients.join(', ')} with subject: ${subject}`);
            await this.prisma.emailMessage.update({
                where: { id: emailMessage.id },
                data: {
                    status: 'SENT',
                    sentAt: new Date(),
                },
            });
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to send email: ${errorMessage}`, errorStack);
            return false;
        }
    }
    async createEmailTemplate(input) {
        try {
            const template = await this.prisma.emailTemplate.create({
                data: {
                    name: input.name,
                    description: input.description,
                    subject: input.subject,
                    bodyHtml: input.bodyHtml,
                    bodyText: input.bodyText,
                    isActive: input.isActive ?? true,
                    branchId: input.branchId,
                },
            });
            return template;
        }
        catch (error) {
            this.logger.error(`Failed to create email template: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateEmailTemplate(id, input) {
        try {
            const template = await this.prisma.emailTemplate.update({
                where: { id },
                data: {
                    name: input.name,
                    description: input.description,
                    subject: input.subject,
                    bodyHtml: input.bodyHtml,
                    bodyText: input.bodyText,
                    isActive: input.isActive,
                },
            });
            return template;
        }
        catch (error) {
            this.logger.error(`Failed to update email template: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getEmails(branchId, organisationId) {
        try {
            const where = {};
            if (branchId) {
                where.branchId = branchId;
            }
            if (organisationId) {
                where.organisationId = organisationId;
            }
            const emails = await this.prisma.emailMessage.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: { branch: true, template: true },
            });
            return emails.map((email) => ({
                ...email,
                bodyText: email.bodyText === null ? undefined : email.bodyText,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to get email messages: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getEmailTemplates(branchId, organisationId) {
        return this.templateService.getTemplates(branchId, organisationId);
    }
    async getEmailTemplate(id) {
        try {
            const template = await this.prisma.emailTemplate.findUnique({
                where: { id },
            });
            if (!template) {
                throw new Error(`Email template with ID ${id} not found`);
            }
            return template;
        }
        catch (error) {
            this.logger.error(`Failed to get email template: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteEmailTemplate(id) {
        try {
            await this.prisma.emailTemplate.delete({
                where: { id },
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete email template: ${error.message}`, error.stack);
            return false;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        template_service_1.TemplateService])
], EmailService);
//# sourceMappingURL=email.service.js.map