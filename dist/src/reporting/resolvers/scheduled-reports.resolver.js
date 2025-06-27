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
exports.ScheduledReportsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const scheduled_reports_service_1 = require("../services/scheduled-reports.service");
const scheduled_report_entity_1 = require("../entities/scheduled-report.entity");
const create_scheduled_report_input_1 = require("../dto/create-scheduled-report.input");
const update_scheduled_report_input_1 = require("../dto/update-scheduled-report.input");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
const permission_enum_1 = require("../../auth/enums/permission.enum");
let ScheduledReportsResolver = class ScheduledReportsResolver {
    scheduledReportsService;
    constructor(scheduledReportsService) {
        this.scheduledReportsService = scheduledReportsService;
    }
    async createScheduledReport(createScheduledReportInput, context) {
        try {
            const userId = context.req.user.id;
            return await this.scheduledReportsService.create(createScheduledReportInput, userId);
        }
        catch (error) {
            throw new Error(`Failed to create scheduled report: ${error.message}`);
        }
    }
    async scheduledReports(branchId, context) {
        try {
            const userId = context.req.user.id;
            return await this.scheduledReportsService.findAll(userId, branchId);
        }
        catch (error) {
            throw new Error(`Failed to fetch scheduled reports: ${error.message}`);
        }
    }
    async scheduledReport(id, context) {
        try {
            const userId = context.req.user.id;
            return await this.scheduledReportsService.findOne(id, userId);
        }
        catch (error) {
            throw new Error(`Failed to fetch scheduled report: ${error.message}`);
        }
    }
    async updateScheduledReport(updateScheduledReportInput, context) {
        try {
            const userId = context.req.user.id;
            return await this.scheduledReportsService.update(updateScheduledReportInput, userId);
        }
        catch (error) {
            throw new Error(`Failed to update scheduled report: ${error.message}`);
        }
    }
    async deleteScheduledReport(id, context) {
        try {
            const userId = context.req.user.id;
            return await this.scheduledReportsService.remove(id, userId);
        }
        catch (error) {
            throw new Error(`Failed to delete scheduled report: ${error.message}`);
        }
    }
    async toggleScheduledReportActive(id, isActive, context) {
        try {
            const userId = context.req.user.id;
            return await this.scheduledReportsService.toggleActive(id, isActive, userId);
        }
        catch (error) {
            throw new Error(`Failed to toggle scheduled report status: ${error.message}`);
        }
    }
};
exports.ScheduledReportsResolver = ScheduledReportsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => scheduled_report_entity_1.ScheduledReport),
    (0, require_permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.MANAGE_REPORTS),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_scheduled_report_input_1.CreateScheduledReportInput, Object]),
    __metadata("design:returntype", Promise)
], ScheduledReportsResolver.prototype, "createScheduledReport", null);
__decorate([
    (0, graphql_1.Query)(() => [scheduled_report_entity_1.ScheduledReport]),
    (0, require_permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.VIEW_REPORTS),
    __param(0, (0, graphql_1.Args)('branchId', { nullable: true })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScheduledReportsResolver.prototype, "scheduledReports", null);
__decorate([
    (0, graphql_1.Query)(() => scheduled_report_entity_1.ScheduledReport),
    (0, require_permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.VIEW_REPORTS),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScheduledReportsResolver.prototype, "scheduledReport", null);
__decorate([
    (0, graphql_1.Mutation)(() => scheduled_report_entity_1.ScheduledReport),
    (0, require_permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.MANAGE_REPORTS),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_scheduled_report_input_1.UpdateScheduledReportInput, Object]),
    __metadata("design:returntype", Promise)
], ScheduledReportsResolver.prototype, "updateScheduledReport", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, require_permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.MANAGE_REPORTS),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScheduledReportsResolver.prototype, "deleteScheduledReport", null);
__decorate([
    (0, graphql_1.Mutation)(() => scheduled_report_entity_1.ScheduledReport),
    (0, require_permissions_decorator_1.RequirePermissions)(permission_enum_1.Permission.MANAGE_REPORTS),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('isActive')),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], ScheduledReportsResolver.prototype, "toggleScheduledReportActive", null);
exports.ScheduledReportsResolver = ScheduledReportsResolver = __decorate([
    (0, graphql_1.Resolver)(() => scheduled_report_entity_1.ScheduledReport),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [scheduled_reports_service_1.ScheduledReportsService])
], ScheduledReportsResolver);
//# sourceMappingURL=scheduled-reports.resolver.js.map