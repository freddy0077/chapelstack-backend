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
exports.FormsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const forms_service_1 = require("../services/forms.service");
const form_entity_1 = require("../entities/form.entity");
const create_form_input_1 = require("../dto/create-form.input");
const update_form_input_1 = require("../dto/update-form.input");
const form_filter_input_1 = require("../dto/form-filter.input");
const form_field_entity_1 = require("../entities/form-field.entity");
const form_submission_entity_1 = require("../entities/form-submission.entity");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
let FormsResolver = class FormsResolver {
    formsService;
    constructor(formsService) {
        this.formsService = formsService;
    }
    async createForm(createFormInput) {
        return this.formsService.create(createFormInput);
    }
    async forms(filter) {
        return this.formsService.findAll(filter);
    }
    async form(id) {
        return this.formsService.findOne(id);
    }
    async publicForm(slug) {
        const form = await this.formsService.findBySlug(slug);
        if (form.status !== 'PUBLISHED' || !form.isPublic) {
            throw new Error('Form not found or not available');
        }
        return form;
    }
    async updateForm(updateFormInput) {
        return this.formsService.update(updateFormInput.id, updateFormInput);
    }
    async removeForm(id) {
        return this.formsService.remove(id);
    }
    async publishForm(id) {
        return this.formsService.publishForm(id);
    }
    async archiveForm(id) {
        return this.formsService.archiveForm(id);
    }
    async fields(form) {
        return this.formsService.getFormFields(form.id);
    }
    async submissions(form) {
        const submissions = await this.formsService.getFormSubmissions(form.id);
        return submissions.map((submission) => ({
            ...submission,
            status: submission.status,
            form: null,
            fieldValues: null,
        }));
    }
};
exports.FormsResolver = FormsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => form_entity_1.Form),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'create', subject: 'Form' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_form_input_1.CreateFormInput]),
    __metadata("design:returntype", Promise)
], FormsResolver.prototype, "createForm", null);
__decorate([
    (0, graphql_1.Query)(() => [form_entity_1.Form]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'Form' }),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_filter_input_1.FormFilterInput]),
    __metadata("design:returntype", Promise)
], FormsResolver.prototype, "forms", null);
__decorate([
    (0, graphql_1.Query)(() => form_entity_1.Form),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'Form' }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormsResolver.prototype, "form", null);
__decorate([
    (0, graphql_1.Query)(() => form_entity_1.Form),
    __param(0, (0, graphql_1.Args)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormsResolver.prototype, "publicForm", null);
__decorate([
    (0, graphql_1.Mutation)(() => form_entity_1.Form),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'update', subject: 'Form' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_form_input_1.UpdateFormInput]),
    __metadata("design:returntype", Promise)
], FormsResolver.prototype, "updateForm", null);
__decorate([
    (0, graphql_1.Mutation)(() => form_entity_1.Form),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'delete', subject: 'Form' }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormsResolver.prototype, "removeForm", null);
__decorate([
    (0, graphql_1.Mutation)(() => form_entity_1.Form),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'update', subject: 'Form' }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormsResolver.prototype, "publishForm", null);
__decorate([
    (0, graphql_1.Mutation)(() => form_entity_1.Form),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'update', subject: 'Form' }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormsResolver.prototype, "archiveForm", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [form_field_entity_1.FormField]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_entity_1.Form]),
    __metadata("design:returntype", Promise)
], FormsResolver.prototype, "fields", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [form_submission_entity_1.FormSubmission]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_entity_1.Form]),
    __metadata("design:returntype", Promise)
], FormsResolver.prototype, "submissions", null);
exports.FormsResolver = FormsResolver = __decorate([
    (0, graphql_1.Resolver)(() => form_entity_1.Form),
    __metadata("design:paramtypes", [forms_service_1.FormsService])
], FormsResolver);
//# sourceMappingURL=forms.resolver.js.map