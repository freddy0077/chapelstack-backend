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
exports.ReportingResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const reporting_service_1 = require("../services/reporting.service");
const report_output_entity_1 = require("../entities/report-output.entity");
const report_filter_input_1 = require("../dto/report-filter.input");
const member_demographics_data_entity_1 = require("../entities/member-demographics-data.entity");
const attendance_trend_data_entity_1 = require("../entities/attendance-trend-data.entity");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
const member_reports_service_1 = require("../services/member-reports.service");
const attendance_reports_service_1 = require("../services/attendance-reports.service");
let ReportingResolver = class ReportingResolver {
    reportingService;
    memberReportsService;
    attendanceReportsService;
    constructor(reportingService, memberReportsService, attendanceReportsService) {
        this.reportingService = reportingService;
        this.memberReportsService = memberReportsService;
        this.attendanceReportsService = attendanceReportsService;
    }
    async generateReport(input) {
        return this.reportingService.generateReport(input.reportType, input.filter, input.outputFormat || report_filter_input_1.OutputFormat.JSON);
    }
    async memberDemographicsReport(branchId, organisationId, dateRange) {
        return await this.memberReportsService.getMemberDemographicsReport(branchId, organisationId, dateRange);
    }
    async attendanceTrendReport(branchId, organisationId, eventTypeId, dateRange) {
        return await this.attendanceReportsService.getAttendanceTrendReport(branchId, organisationId, eventTypeId, dateRange);
    }
};
exports.ReportingResolver = ReportingResolver;
__decorate([
    (0, graphql_1.Query)(() => report_output_entity_1.ReportOutput),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'generate', subject: 'reports' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_filter_input_1.ReportRequestInput]),
    __metadata("design:returntype", Promise)
], ReportingResolver.prototype, "generateReport", null);
__decorate([
    (0, graphql_1.Query)(() => member_demographics_data_entity_1.MemberDemographicsData),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'view', subject: 'reports.members' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID, nullable: true })),
    __param(1, (0, graphql_1.Args)('organisationId', { type: () => graphql_1.ID, nullable: true })),
    __param(2, (0, graphql_1.Args)('dateRange', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, report_filter_input_1.DateRangeInput]),
    __metadata("design:returntype", Promise)
], ReportingResolver.prototype, "memberDemographicsReport", null);
__decorate([
    (0, graphql_1.Query)(() => attendance_trend_data_entity_1.AttendanceTrendData),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'view', subject: 'reports.attendance' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID, nullable: true })),
    __param(1, (0, graphql_1.Args)('organisationId', { type: () => graphql_1.ID, nullable: true })),
    __param(2, (0, graphql_1.Args)('eventTypeId', { type: () => graphql_1.ID, nullable: true })),
    __param(3, (0, graphql_1.Args)('dateRange', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, report_filter_input_1.DateRangeInput]),
    __metadata("design:returntype", Promise)
], ReportingResolver.prototype, "attendanceTrendReport", null);
exports.ReportingResolver = ReportingResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [reporting_service_1.ReportingService,
        member_reports_service_1.MemberReportsService,
        attendance_reports_service_1.AttendanceReportsService])
], ReportingResolver);
//# sourceMappingURL=reporting.resolver.js.map