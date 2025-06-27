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
exports.FormSubmissionsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const form_submissions_service_1 = require("../services/form-submissions.service");
const form_submission_entity_1 = require("../entities/form-submission.entity");
const create_form_submission_input_1 = require("../dto/create-form-submission.input");
const submission_filter_input_1 = require("../dto/submission-filter.input");
const form_entity_1 = require("../entities/form.entity");
const form_field_value_entity_1 = require("../entities/form-field-value.entity");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
const graphql_type_json_1 = require("graphql-type-json");
const user_entity_1 = require("../../users/entities/user.entity");
const branch_entity_1 = require("../../branches/entities/branch.entity");
let FormSubmissionsResolver = class FormSubmissionsResolver {
    formSubmissionsService;
    prisma;
    constructor(formSubmissionsService, prisma) {
        this.formSubmissionsService = formSubmissionsService;
        this.prisma = prisma;
    }
    async submitForm(createSubmissionInput) {
        try {
            const submission = await this.formSubmissionsService.create(createSubmissionInput);
            return {
                ...submission,
                status: submission.status,
                form: null,
                fieldValues: null,
            };
        }
        catch (error) {
            throw new Error(`Failed to submit form: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async formSubmissions(filter) {
        try {
            const submissions = await this.formSubmissionsService.findAll(filter);
            return submissions.map((submission) => ({
                ...submission,
                status: submission.status,
                form: null,
                fieldValues: null,
            }));
        }
        catch (error) {
            throw new Error(`Failed to fetch form submissions: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async formSubmission(id) {
        try {
            const submission = await this.formSubmissionsService.findOne(id);
            if (!submission) {
                throw new Error(`Form submission with ID ${id} not found`);
            }
            return {
                ...submission,
                status: submission.status,
                form: null,
                fieldValues: null,
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch form submission: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async removeFormSubmission(id) {
        try {
            const submission = await this.formSubmissionsService.remove(id);
            if (!submission) {
                throw new Error(`Form submission with ID ${id} not found`);
            }
            return {
                ...submission,
                status: submission.status,
                form: null,
                fieldValues: null,
            };
        }
        catch (error) {
            throw new Error(`Failed to remove form submission: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async exportFormSubmissions(formId) {
        try {
            const exportData = await this.formSubmissionsService.exportSubmissions(formId);
            if (Array.isArray(exportData)) {
                return { items: exportData };
            }
            return exportData;
        }
        catch (error) {
            throw new Error(`Failed to export form submissions: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async form(submission) {
        try {
            if (!submission.formId) {
                return null;
            }
            const form = await this.prisma.form.findUnique({
                where: { id: submission.formId },
            });
            return form;
        }
        catch (error) {
            console.error(`Error resolving form: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
    async fieldValues(submission) {
        try {
            if (!submission.id) {
                return [];
            }
            const fieldValues = await this.formSubmissionsService.getFieldValues(submission.id);
            return fieldValues.map((value) => ({
                ...value,
                submission: value.submissionId ? { id: value.submissionId } : null,
                field: null,
            }));
        }
        catch (error) {
            console.error(`Error resolving field values: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    async submittedBy(submission) {
        try {
            if (!submission.submittedById)
                return null;
            const user = await this.prisma.user.findUnique({
                where: { id: submission.submittedById },
            });
            if (!user)
                return null;
            return {
                ...user,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
            };
        }
        catch (error) {
            console.error(`Error resolving submittedBy: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
    async branch(submission) {
        try {
            if (!submission.branchId)
                return null;
            const branch = await this.prisma.branch.findUnique({
                where: { id: submission.branchId },
            });
            if (!branch)
                return null;
            return {
                ...branch,
                settings: null,
            };
        }
        catch (error) {
            console.error(`Error resolving branch: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
};
exports.FormSubmissionsResolver = FormSubmissionsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => form_submission_entity_1.FormSubmission),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_form_submission_input_1.CreateFormSubmissionInput]),
    __metadata("design:returntype", Promise)
], FormSubmissionsResolver.prototype, "submitForm", null);
__decorate([
    (0, graphql_1.Query)(() => [form_submission_entity_1.FormSubmission]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'FormSubmission' }),
    __param(0, (0, graphql_1.Args)('filter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submission_filter_input_1.SubmissionFilterInput]),
    __metadata("design:returntype", Promise)
], FormSubmissionsResolver.prototype, "formSubmissions", null);
__decorate([
    (0, graphql_1.Query)(() => form_submission_entity_1.FormSubmission),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'FormSubmission' }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormSubmissionsResolver.prototype, "formSubmission", null);
__decorate([
    (0, graphql_1.Mutation)(() => form_submission_entity_1.FormSubmission),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'delete', subject: 'FormSubmission' }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormSubmissionsResolver.prototype, "removeFormSubmission", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'FormSubmission' }),
    __param(0, (0, graphql_1.Args)('formId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormSubmissionsResolver.prototype, "exportFormSubmissions", null);
__decorate([
    (0, graphql_1.ResolveField)(() => form_entity_1.Form),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_submission_entity_1.FormSubmission]),
    __metadata("design:returntype", Promise)
], FormSubmissionsResolver.prototype, "form", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [form_field_value_entity_1.FormFieldValue]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_submission_entity_1.FormSubmission]),
    __metadata("design:returntype", Promise)
], FormSubmissionsResolver.prototype, "fieldValues", null);
__decorate([
    (0, graphql_1.ResolveField)(() => user_entity_1.User, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_submission_entity_1.FormSubmission]),
    __metadata("design:returntype", Promise)
], FormSubmissionsResolver.prototype, "submittedBy", null);
__decorate([
    (0, graphql_1.ResolveField)(() => branch_entity_1.Branch, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [form_submission_entity_1.FormSubmission]),
    __metadata("design:returntype", Promise)
], FormSubmissionsResolver.prototype, "branch", null);
exports.FormSubmissionsResolver = FormSubmissionsResolver = __decorate([
    (0, graphql_1.Resolver)(() => form_submission_entity_1.FormSubmission),
    __metadata("design:paramtypes", [form_submissions_service_1.FormSubmissionsService,
        prisma_service_1.PrismaService])
], FormSubmissionsResolver);
//# sourceMappingURL=form-submissions.resolver.js.map