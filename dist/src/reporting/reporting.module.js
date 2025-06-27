"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const reporting_service_1 = require("./services/reporting.service");
const member_reports_service_1 = require("./services/member-reports.service");
const attendance_reports_service_1 = require("./services/attendance-reports.service");
const financial_reports_service_1 = require("./services/financial-reports.service");
const reporting_resolver_1 = require("./resolvers/reporting.resolver");
const dashboard_service_1 = require("./services/dashboard.service");
const dashboard_resolver_1 = require("./resolvers/dashboard.resolver");
const content_module_1 = require("../content/content.module");
const communications_module_1 = require("../communications/communications.module");
const common_2 = require("@nestjs/common");
const onboarding_module_1 = require("../onboarding/onboarding.module");
const branches_module_1 = require("../branches/branches.module");
const members_module_1 = require("../members/members.module");
let ReportingModule = class ReportingModule {
};
exports.ReportingModule = ReportingModule;
exports.ReportingModule = ReportingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            content_module_1.ContentModule,
            communications_module_1.CommunicationsModule,
            (0, common_2.forwardRef)(() => onboarding_module_1.OnboardingModule),
            branches_module_1.BranchesModule,
            members_module_1.MembersModule,
        ],
        providers: [
            reporting_service_1.ReportingService,
            member_reports_service_1.MemberReportsService,
            attendance_reports_service_1.AttendanceReportsService,
            financial_reports_service_1.FinancialReportsService,
            dashboard_service_1.DashboardService,
            reporting_resolver_1.ReportingResolver,
            dashboard_resolver_1.DashboardResolver,
        ],
        exports: [
            reporting_service_1.ReportingService,
            member_reports_service_1.MemberReportsService,
            attendance_reports_service_1.AttendanceReportsService,
            financial_reports_service_1.FinancialReportsService,
            dashboard_service_1.DashboardService,
        ],
    })
], ReportingModule);
//# sourceMappingURL=reporting.module.js.map