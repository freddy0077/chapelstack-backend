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
exports.FormFieldsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const form_fields_service_1 = require("../services/form-fields.service");
const form_field_entity_1 = require("../entities/form-field.entity");
const create_form_field_input_1 = require("../dto/create-form-field.input");
const update_form_field_input_1 = require("../dto/update-form-field.input");
const form_entity_1 = require("../entities/form.entity");
const form_field_value_entity_1 = require("../entities/form-field-value.entity");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
let FormFieldsResolver = class FormFieldsResolver {
    formFieldsService;
    prisma;
    constructor(formFieldsService, prisma) {
        this.formFieldsService = formFieldsService;
        this.prisma = prisma;
    }
    async createFormField(createFormFieldInput) {
        return this.formFieldsService.create(createFormFieldInput);
    }
    async createFormFields(createFormFieldInputs) {
        return this.formFieldsService.createMany(createFormFieldInputs);
    }
    async formFields(formId) {
        return this.formFieldsService.findAll(formId);
    }
    async formField(id) {
        return this.formFieldsService.findOne(id);
    }
    async updateFormField(updateFormFieldInput) {
        return this.formFieldsService.update(updateFormFieldInput.id, updateFormFieldInput);
    }
    async removeFormField(id) {
        return this.formFieldsService.remove(id);
    }
    async reorderFormFields(formId, fieldIds) {
        return this.formFieldsService.reorderFields(formId, fieldIds);
    }
    async form(field) {
        const form = await this.prisma.form.findUnique({
            where: { id: field.formId },
        });
        if (!form)
            return null;
        return {
            ...form,
            fields: [],
            submissions: [],
            submissionCount: 0,
        };
    }
    async fieldValues(field) {
        const fieldValues = await this.prisma.formFieldValue.findMany({
            where: { fieldId: field.id },
        });
        return fieldValues.map((value) => ({
            ...value,
            field: null,
            submission: null,
        }));
    }
};
exports.FormFieldsResolver = FormFieldsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => form_field_entity_1.FormField),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'create', subject: 'FormField' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_form_field_input_1.CreateFormFieldInput]),
    __metadata("design:returntype", Promise)
], FormFieldsResolver.prototype, "createFormField", null);
__decorate([
    (0, graphql_1.Mutation)(() => [form_field_entity_1.FormField]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'create', subject: 'FormField' }),
    __param(0, (0, graphql_1.Args)('inputs', { type: () => [create_form_field_input_1.CreateFormFieldInput] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], FormFieldsResolver.prototype, "createFormFields", null);
__decorate([
    (0, graphql_1.Query)(() => [form_field_entity_1.FormField]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'FormField' }),
    __param(0, (0, graphql_1.Args)('formId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormFieldsResolver.prototype, "formFields", null);
__decorate([
    (0, graphql_1.Query)(() => form_field_entity_1.FormField),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'FormField' }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormFieldsResolver.prototype, "formField", null);
__decorate([
    (0, graphql_1.Mutation)(() => form_field_entity_1.FormField),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'update', subject: 'FormField' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_form_field_input_1.UpdateFormFieldInput]),
    __metadata("design:returntype", Promise)
], FormFieldsResolver.prototype, "updateFormField", null);
__decorate([
    (0, graphql_1.Mutation)(() => form_field_entity_1.FormField),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'delete', subject: 'FormField' }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormFieldsResolver.prototype, "removeFormField", null);
__decorate([
    (0, graphql_1.Mutation)(() => [form_field_entity_1.FormField]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'update', subject: 'FormField' }),
    __param(0, (0, graphql_1.Args)('formId')),
    __param(1, (0, graphql_1.Args)('fieldIds', { type: () => [String] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], FormFieldsResolver.prototype, "reorderFormFields", null);
__decorate([
    (0, graphql_1.ResolveField)(() => form_entity_1.Form),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_field_entity_1.FormField]),
    __metadata("design:returntype", Promise)
], FormFieldsResolver.prototype, "form", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [form_field_value_entity_1.FormFieldValue]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_field_entity_1.FormField]),
    __metadata("design:returntype", Promise)
], FormFieldsResolver.prototype, "fieldValues", null);
exports.FormFieldsResolver = FormFieldsResolver = __decorate([
    (0, graphql_1.Resolver)(() => form_field_entity_1.FormField),
    __metadata("design:paramtypes", [form_fields_service_1.FormFieldsService,
        prisma_service_1.PrismaService])
], FormFieldsResolver);
//# sourceMappingURL=form-fields.resolver.js.map