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
var ScheduledReportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledReportsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const reporting_service_1 = require("./reporting.service");
const mail_1 = require("../../mail");
const client_1 = require("@prisma/client");
let ScheduledReportsService = ScheduledReportsService_1 = class ScheduledReportsService {
    prisma;
    reportingService;
    schedulerRegistry;
    mailService;
    logger = new common_1.Logger(ScheduledReportsService_1.name);
    constructor(prisma, reportingService, schedulerRegistry, mailService) {
        this.prisma = prisma;
        this.reportingService = reportingService;
        this.schedulerRegistry = schedulerRegistry;
        this.mailService = mailService;
    }
    async create(createScheduledReportInput, userId) {
        try {
            const nextRunAt = this.calculateNextRunDate(new Date(), createScheduledReportInput.frequency);
            const report = await this.prisma.scheduledReport.create({
                data: {
                    ...createScheduledReportInput,
                    nextRunAt,
                    isActive: true,
                    createdById: userId,
                },
            });
            return this.mapToEntity(report);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to create scheduled report: ${errorMessage}`, errorStack);
            throw new common_1.InternalServerErrorException(`Failed to create scheduled report: ${errorMessage}`);
        }
    }
    async findAll(userId, branchId) {
        try {
            const where = {};
            if (branchId) {
                where.branchId = branchId;
            }
            where.OR = [{ createdById: userId }, { branchId: null }];
            const reports = await this.prisma.scheduledReport.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });
            return reports.map((report) => this.mapToEntity(report));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to fetch scheduled reports: ${errorMessage}`, errorStack);
            throw new common_1.InternalServerErrorException(`Failed to fetch scheduled reports: ${errorMessage}`);
        }
    }
    async findOne(id, userId) {
        try {
            const report = await this.prisma.scheduledReport.findFirst({
                where: {
                    id,
                    OR: [{ createdById: userId }, { branchId: null }],
                },
            });
            if (!report) {
                throw new common_1.NotFoundException(`Scheduled report with ID ${id} not found`);
            }
            return this.mapToEntity(report);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to fetch scheduled report: ${errorMessage}`, errorStack);
            throw new common_1.InternalServerErrorException(`Failed to fetch scheduled report: ${errorMessage}`);
        }
    }
    async update(updateScheduledReportInput, userId) {
        try {
            const existingReport = await this.prisma.scheduledReport.findFirst({
                where: {
                    id: updateScheduledReportInput.id,
                    OR: [{ createdById: userId }, { branchId: null }],
                },
            });
            if (!existingReport) {
                throw new Error(`Scheduled report with ID ${updateScheduledReportInput.id} not found or you don't have permission to update it`);
            }
            let nextRunAt = existingReport.nextRunAt;
            if (updateScheduledReportInput.frequency) {
                nextRunAt = this.calculateNextRunDate(new Date(), updateScheduledReportInput.frequency);
            }
            const updateData = {
                ...(updateScheduledReportInput.name && {
                    name: updateScheduledReportInput.name,
                }),
                ...(updateScheduledReportInput.reportType && {
                    reportType: updateScheduledReportInput.reportType,
                }),
                ...(updateScheduledReportInput.frequency && {
                    frequency: updateScheduledReportInput.frequency,
                }),
                ...(updateScheduledReportInput.recipientEmails && {
                    recipientEmails: updateScheduledReportInput.recipientEmails,
                }),
                ...(updateScheduledReportInput.outputFormat && {
                    outputFormat: updateScheduledReportInput.outputFormat,
                }),
                ...(updateScheduledReportInput.branchId !== undefined && {
                    branchId: updateScheduledReportInput.branchId,
                }),
                ...(updateScheduledReportInput.filterJson !== undefined && {
                    filterJson: updateScheduledReportInput.filterJson,
                }),
            };
            const updatedReport = await this.prisma.scheduledReport.update({
                where: { id: updateScheduledReportInput.id },
                data: {
                    ...updateData,
                    nextRunAt,
                },
            });
            return this.mapToEntity(updatedReport);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to update scheduled report: ${errorMessage}`, errorStack);
            throw new common_1.InternalServerErrorException(`Failed to update scheduled report: ${errorMessage}`);
        }
    }
    async remove(id, userId) {
        try {
            const existingReport = await this.prisma.scheduledReport.findFirst({
                where: {
                    id,
                    OR: [{ createdById: userId }, { branchId: null }],
                },
            });
            if (!existingReport) {
                throw new Error(`Scheduled report with ID ${id} not found or you don't have permission to delete it`);
            }
            await this.prisma.scheduledReport.delete({
                where: { id },
            });
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to delete scheduled report: ${errorMessage}`, errorStack);
            throw new common_1.InternalServerErrorException(`Failed to delete scheduled report: ${errorMessage}`);
        }
    }
    async toggleActive(id, isActive, userId) {
        try {
            const existingReport = await this.prisma.scheduledReport.findFirst({
                where: {
                    id,
                    OR: [{ createdById: userId }, { branchId: null }],
                },
            });
            if (!existingReport) {
                throw new Error(`Scheduled report with ID ${id} not found or you don't have permission to update it`);
            }
            const updatedReport = await this.prisma.scheduledReport.update({
                where: { id },
                data: { isActive },
            });
            return this.mapToEntity(updatedReport);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to toggle scheduled report active status: ${errorMessage}`, errorStack);
            throw new common_1.InternalServerErrorException(`Failed to toggle scheduled report active status: ${errorMessage}`);
        }
    }
    async runScheduledReports() {
        try {
            this.logger.log('Checking for scheduled reports to run...');
            const now = new Date();
            const reportsToRun = await this.prisma.scheduledReport.findMany({
                where: {
                    isActive: true,
                    nextRunAt: {
                        lte: now,
                    },
                },
            });
            if (reportsToRun.length > 0) {
                this.logger.log(`Found ${reportsToRun.length} reports to run`);
                for (const report of reportsToRun) {
                    await this.executeScheduledReport(report);
                }
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Error in scheduled reports execution: ${errorMessage}`, errorStack);
        }
    }
    async executeScheduledReport(report) {
        try {
            this.logger.log(`Executing scheduled report: ${report.name} (ID: ${report.id})`);
            let filter;
            if (report.filterJson) {
                filter = JSON.parse(report.filterJson);
            }
            else if (report.branchId) {
                filter = { branchId: report.branchId };
            }
            const reportData = await this.reportingService.generateReport(report.reportType, filter, report.outputFormat);
            let fileUrl;
            if (report.outputFormat !== 'JSON') {
                fileUrl = await this.reportingService.generateFileForReport(report.reportType, reportData.data || {}, report.outputFormat);
            }
            if (reportData) {
                await this.sendReportEmail(report, reportData, fileUrl);
            }
            const nextRunAt = this.calculateNextRunDate(new Date(), report.frequency);
            await this.prisma.scheduledReport.update({
                where: { id: report.id },
                data: {
                    lastRunAt: new Date(),
                    nextRunAt,
                },
            });
            this.logger.log(`Successfully executed scheduled report: ${report.name} (ID: ${report.id})`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to execute scheduled report ${report.id}: ${errorMessage}`, errorStack);
            try {
                const nextRunAt = this.calculateNextRunDate(new Date(), report.frequency);
                await this.prisma.scheduledReport.update({
                    where: { id: report.id },
                    data: {
                        lastRunAt: new Date(),
                        nextRunAt,
                    },
                });
            }
            catch (updateError) {
                const updateErrorMsg = updateError instanceof Error ? updateError.message : 'Unknown error';
                this.logger.error(`Failed to update report after execution failure: ${updateErrorMsg}`);
            }
        }
    }
    async sendReportEmail(report, reportData, fileUrl) {
        try {
            await this.mailService.sendScheduledReport({
                to: report.recipientEmails,
                subject: `Scheduled Report: ${report.name}`,
                reportName: report.name,
                reportData: reportData.data && typeof reportData.data === 'object'
                    ? { ...reportData.data }
                    : {},
                fileUrl,
            });
            this.logger.log(`Sent report email for ${report.name} to ${report.recipientEmails.join(', ')}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to send report email: ${errorMessage}`, errorStack);
        }
    }
    calculateNextRunDate(currentDate, frequency) {
        const now = new Date();
        const nextRun = new Date(now);
        switch (frequency) {
            case client_1.ReportFrequencyEnum.DAILY:
                nextRun.setDate(nextRun.getDate() + 1);
                break;
            case client_1.ReportFrequencyEnum.WEEKLY:
                nextRun.setDate(nextRun.getDate() + 7);
                break;
            case client_1.ReportFrequencyEnum.MONTHLY:
                nextRun.setMonth(nextRun.getMonth() + 1);
                break;
            case client_1.ReportFrequencyEnum.QUARTERLY:
                nextRun.setMonth(nextRun.getMonth() + 3);
                break;
            default:
                nextRun.setDate(nextRun.getDate() + 1);
        }
        return nextRun;
    }
    mapToEntity(report) {
        return {
            id: report.id,
            name: report.name,
            reportType: report.reportType,
            frequency: report.frequency,
            lastRunAt: report.lastRunAt,
            nextRunAt: report.nextRunAt,
            recipientEmails: report.recipientEmails,
            outputFormat: report.outputFormat,
            branchId: report.branchId,
            createdById: report.createdById,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
            isActive: report.isActive,
            filterJson: report.filterJson,
        };
    }
};
exports.ScheduledReportsService = ScheduledReportsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledReportsService.prototype, "runScheduledReports", null);
exports.ScheduledReportsService = ScheduledReportsService = ScheduledReportsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        reporting_service_1.ReportingService,
        schedule_1.SchedulerRegistry,
        mail_1.MailService])
], ScheduledReportsService);
//# sourceMappingURL=scheduled-reports.service.js.map