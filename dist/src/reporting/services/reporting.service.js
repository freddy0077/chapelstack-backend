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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const report_filter_input_1 = require("../dto/report-filter.input");
const member_reports_service_1 = require("../services/member-reports.service");
const attendance_reports_service_1 = require("../services/attendance-reports.service");
const financial_reports_service_1 = require("../services/financial-reports.service");
let ReportingService = class ReportingService {
    prisma;
    memberReportsService;
    attendanceReportsService;
    financialReportsService;
    constructor(prisma, memberReportsService, attendanceReportsService, financialReportsService) {
        this.prisma = prisma;
        this.memberReportsService = memberReportsService;
        this.attendanceReportsService = attendanceReportsService;
        this.financialReportsService = financialReportsService;
    }
    async generateReport(reportType, filter = {}, outputFormat = report_filter_input_1.OutputFormat.JSON) {
        let data;
        const safeFilter = filter || {};
        switch (reportType) {
            case 'MEMBER_LIST':
                data = await this.memberReportsService.getMemberListReport(safeFilter);
                break;
            case 'MEMBER_DEMOGRAPHICS':
                data = await this.memberReportsService.getMemberDemographicsReport(safeFilter.branchId, safeFilter.organisationId, safeFilter.dateRange);
                break;
            case 'ATTENDANCE_SUMMARY':
                data =
                    await this.attendanceReportsService.getAttendanceSummaryReport(safeFilter);
                break;
            case 'ATTENDANCE_TREND':
                data = await this.attendanceReportsService.getAttendanceTrendReport(safeFilter.branchId, safeFilter.organisationId, safeFilter.eventTypeId, safeFilter.dateRange);
                break;
            case 'FINANCIAL_CONTRIBUTIONS':
                data =
                    await this.financialReportsService.getContributionsReport(safeFilter);
                break;
            default:
                throw new Error(`Unsupported report type: ${reportType}`);
        }
        let downloadUrl;
        if (outputFormat !== report_filter_input_1.OutputFormat.JSON) {
            downloadUrl = await this.generateFileForReport(reportType, data, outputFormat);
        }
        return {
            reportType,
            data: outputFormat === report_filter_input_1.OutputFormat.JSON ? data : undefined,
            downloadUrl,
            format: outputFormat,
            generatedAt: new Date(),
            message: `${reportType} report generated successfully`,
        };
    }
    async generateFileForReport(reportType, data, format) {
        await Promise.resolve();
        const timestamp = new Date().getTime();
        const extension = format.toLowerCase();
        return `/reports/${reportType.toLowerCase()}_${timestamp}.${extension}`;
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        member_reports_service_1.MemberReportsService,
        attendance_reports_service_1.AttendanceReportsService,
        financial_reports_service_1.FinancialReportsService])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map