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
var TemplateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TemplateService = TemplateService_1 = class TemplateService {
    prisma;
    logger = new common_1.Logger(TemplateService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTemplate(input) {
        try {
            const { branchId, organisationId, ...rest } = input;
            const data = { ...rest };
            if (branchId) {
                data.branch = { connect: { id: branchId } };
            }
            if (organisationId) {
                data.organisation = { connect: { id: organisationId } };
            }
            const template = await this.prisma.emailTemplate.create({ data });
            return template;
        }
        catch (error) {
            this.logger.error(`Failed to create email template: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateTemplate(id, input) {
        try {
            const { id: _, branchId, organisationId, ...rest } = input;
            const data = { ...rest };
            if (branchId) {
                data.branch = { connect: { id: branchId } };
            }
            if (organisationId) {
                data.organisation = { connect: { id: organisationId } };
            }
            const template = await this.prisma.emailTemplate.update({
                where: { id },
                data,
            });
            return template;
        }
        catch (error) {
            this.logger.error(`Failed to update email template: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getTemplates(branchId, organisationId) {
        try {
            const where = {};
            if (branchId) {
                where.branchId = branchId;
            }
            if (organisationId) {
                where.organisationId = organisationId;
            }
            const templates = await this.prisma.emailTemplate.findMany({
                where,
                orderBy: { name: 'asc' },
            });
            return templates;
        }
        catch (error) {
            this.logger.error(`Failed to get email templates: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getTemplate(id) {
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
    async deleteTemplate(id) {
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
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = TemplateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplateService);
//# sourceMappingURL=template.service.js.map