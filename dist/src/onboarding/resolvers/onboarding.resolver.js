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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../../auth/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const onboarding_service_1 = require("../services/onboarding.service");
const setup_wizard_service_1 = require("../services/setup-wizard.service");
const data_import_service_1 = require("../services/data-import.service");
const onboarding_progress_entity_1 = require("../entities/onboarding-progress.entity");
const initial_branch_setup_input_1 = require("../dto/initial-branch-setup.input");
const initial_settings_input_1 = require("../dto/initial-settings.input");
const complete_onboarding_step_input_1 = require("../dto/complete-onboarding-step.input");
const import_result_output_1 = require("../dto/import-result.output");
const graphql_upload_1 = require("graphql-upload");
let OnboardingResolver = class OnboardingResolver {
    onboardingService;
    setupWizardService;
    dataImportService;
    constructor(onboardingService, setupWizardService, dataImportService) {
        this.onboardingService = onboardingService;
        this.setupWizardService = setupWizardService;
        this.dataImportService = dataImportService;
    }
    async onboardingProgress(branchId) {
        return this.onboardingService.getOnboardingProgress(branchId);
    }
    async initializeOnboarding(branchId) {
        return this.onboardingService.initializeOnboarding(branchId);
    }
    async completeOnboardingStep(input) {
        return this.onboardingService.completeOnboardingStep(input);
    }
    async resetOnboarding(branchId) {
        return this.onboardingService.resetOnboarding(branchId);
    }
    async initiateBranchSetup(input, user) {
        const branch = await this.setupWizardService.initiateBranchSetup(input);
        return branch.id;
    }
    async configureInitialSettings(branchId, input) {
        return this.setupWizardService.configureInitialSettings(branchId, input);
    }
    async createSuperAdminUser(email, password, firstName, lastName, organisationId, branchId) {
        const user = await this.setupWizardService.createSuperAdminUser(email, password, firstName, lastName, organisationId, branchId ?? undefined);
        return user.id;
    }
    async importMemberData(branchId, file, mappingJson) {
        return this.dataImportService.importMembers(file, branchId);
    }
    async importFinancialData(branchId, file, mappingJson, type) {
        const mapping = JSON.parse(mappingJson);
        return this.dataImportService.importFinancialData(branchId, file, mapping, type);
    }
    async generateMemberImportTemplate() {
        const templatePath = await this.dataImportService.generateMemberImportTemplate();
        return templatePath;
    }
    async generateFundsImportTemplate() {
        const templatePath = await this.dataImportService.generateFundsImportTemplate();
        return templatePath;
    }
};
exports.OnboardingResolver = OnboardingResolver;
__decorate([
    (0, graphql_1.Query)(() => onboarding_progress_entity_1.OnboardingProgress),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)({ action: 'read', subject: 'onboarding' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "onboardingProgress", null);
__decorate([
    (0, graphql_1.Mutation)(() => onboarding_progress_entity_1.OnboardingProgress),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)({ action: 'write', subject: 'onboarding' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "initializeOnboarding", null);
__decorate([
    (0, graphql_1.Mutation)(() => onboarding_progress_entity_1.OnboardingProgress),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)({ action: 'write', subject: 'onboarding' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [complete_onboarding_step_input_1.CompleteOnboardingStepInput]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "completeOnboardingStep", null);
__decorate([
    (0, graphql_1.Mutation)(() => onboarding_progress_entity_1.OnboardingProgress),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)({ action: 'write', subject: 'onboarding' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "resetOnboarding", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_1.ID),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [initial_branch_setup_input_1.InitialBranchSetupInput, Object]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "initiateBranchSetup", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)({ action: 'write', subject: 'onboarding' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, initial_settings_input_1.InitialSettingsInput]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "configureInitialSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_1.ID),
    __param(0, (0, graphql_1.Args)('email')),
    __param(1, (0, graphql_1.Args)('password')),
    __param(2, (0, graphql_1.Args)('firstName')),
    __param(3, (0, graphql_1.Args)('lastName')),
    __param(4, (0, graphql_1.Args)('organisationId', { type: () => graphql_1.ID })),
    __param(5, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "createSuperAdminUser", null);
__decorate([
    (0, graphql_1.Mutation)(() => import_result_output_1.ImportResult),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)({ action: 'write', subject: 'onboarding' }, { action: 'write', subject: 'members' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('file', { type: () => graphql_upload_1.GraphQLUpload })),
    __param(2, (0, graphql_1.Args)('mapping', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_a = typeof graphql_upload_1.FileUpload !== "undefined" && graphql_upload_1.FileUpload) === "function" ? _a : Object, String]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "importMemberData", null);
__decorate([
    (0, graphql_1.Mutation)(() => import_result_output_1.ImportResult),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)({ action: 'write', subject: 'onboarding' }, { action: 'write', subject: 'finances' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('file', { type: () => graphql_upload_1.GraphQLUpload })),
    __param(2, (0, graphql_1.Args)('mapping', { type: () => String })),
    __param(3, (0, graphql_1.Args)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof graphql_upload_1.FileUpload !== "undefined" && graphql_upload_1.FileUpload) === "function" ? _b : Object, String, String]),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "importFinancialData", null);
__decorate([
    (0, graphql_1.Query)(() => String),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "generateMemberImportTemplate", null);
__decorate([
    (0, graphql_1.Query)(() => String),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OnboardingResolver.prototype, "generateFundsImportTemplate", null);
exports.OnboardingResolver = OnboardingResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [onboarding_service_1.OnboardingService,
        setup_wizard_service_1.SetupWizardService,
        data_import_service_1.DataImportService])
], OnboardingResolver);
//# sourceMappingURL=onboarding.resolver.js.map