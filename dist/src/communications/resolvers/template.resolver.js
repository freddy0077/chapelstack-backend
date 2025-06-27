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
exports.TemplateResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const template_service_1 = require("../services/template.service");
const create_email_template_input_1 = require("../dto/create-email-template.input");
const update_email_template_input_1 = require("../dto/update-email-template.input");
const email_template_dto_1 = require("../dto/email-template.dto");
let TemplateResolver = class TemplateResolver {
    templateService;
    constructor(templateService) {
        this.templateService = templateService;
    }
    async templates(branchId, organisationId) {
        return this.templateService.getTemplates(branchId, organisationId);
    }
    async template(id) {
        return this.templateService.getTemplate(id);
    }
    async createTemplate(input) {
        return this.templateService.createTemplate(input);
    }
    async updateTemplate(id, input) {
        return this.templateService.updateTemplate(id, input);
    }
    async deleteTemplate(id) {
        return this.templateService.deleteTemplate(id);
    }
};
exports.TemplateResolver = TemplateResolver;
__decorate([
    (0, graphql_1.Query)(() => [email_template_dto_1.EmailTemplateDto]),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID, nullable: true })),
    __param(1, (0, graphql_1.Args)('organisationId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TemplateResolver.prototype, "templates", null);
__decorate([
    (0, graphql_1.Query)(() => email_template_dto_1.EmailTemplateDto),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateResolver.prototype, "template", null);
__decorate([
    (0, graphql_1.Mutation)(() => email_template_dto_1.EmailTemplateDto),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_email_template_input_1.CreateEmailTemplateInput]),
    __metadata("design:returntype", Promise)
], TemplateResolver.prototype, "createTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => email_template_dto_1.EmailTemplateDto),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_email_template_input_1.UpdateEmailTemplateInput]),
    __metadata("design:returntype", Promise)
], TemplateResolver.prototype, "updateTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateResolver.prototype, "deleteTemplate", null);
exports.TemplateResolver = TemplateResolver = __decorate([
    (0, graphql_1.Resolver)(() => email_template_dto_1.EmailTemplateDto),
    __metadata("design:paramtypes", [template_service_1.TemplateService])
], TemplateResolver);
//# sourceMappingURL=template.resolver.js.map