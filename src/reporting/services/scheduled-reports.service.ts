import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportingService } from './reporting.service';
import { CreateScheduledReportInput } from '../dto/create-scheduled-report.input';
import { UpdateScheduledReportInput } from '../dto/update-scheduled-report.input';
import { ScheduledReport } from '../entities/scheduled-report.entity';
import { ReportFrequency } from '../enums/report-frequency.enum';
import { ReportFilterInput, OutputFormat } from '../dto/report-filter.input';
import { MailService } from '../../mail';
import { ReportOutput } from '../entities/report-output.entity';
import {
  Prisma,
  ScheduledReport as PrismaScheduledReport,
  ReportFrequencyEnum,
} from '@prisma/client';

@Injectable()
export class ScheduledReportsService {
  private readonly logger = new Logger(ScheduledReportsService.name);

  constructor(
    private prisma: PrismaService,
    private reportingService: ReportingService,
    private schedulerRegistry: SchedulerRegistry,
    private mailService: MailService,
  ) {}

  async create(
    createScheduledReportInput: CreateScheduledReportInput,
    userId: string,
  ): Promise<ScheduledReport> {
    try {
      const nextRunAt = this.calculateNextRunDate(
        new Date(),
        createScheduledReportInput.frequency as unknown as ReportFrequencyEnum,
      );

      const report = await this.prisma.scheduledReport.create({
        data: {
          ...createScheduledReportInput,
          nextRunAt,
          isActive: true,
          createdById: userId,
        },
      });

      return this.mapToEntity(report);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to create scheduled report: ${errorMessage}`,
        errorStack,
      );
      throw new InternalServerErrorException(
        `Failed to create scheduled report: ${errorMessage}`,
      );
    }
  }

  async findAll(userId: string, branchId?: string): Promise<ScheduledReport[]> {
    try {
      const where: Prisma.ScheduledReportWhereInput = {};

      if (branchId) {
        where.branchId = branchId;
      }

      where.OR = [{ createdById: userId }, { branchId: null }];

      const reports = await this.prisma.scheduledReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return reports.map((report) => this.mapToEntity(report));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to fetch scheduled reports: ${errorMessage}`,
        errorStack,
      );
      throw new InternalServerErrorException(
        `Failed to fetch scheduled reports: ${errorMessage}`,
      );
    }
  }

  async findOne(id: string, userId: string): Promise<ScheduledReport> {
    try {
      const report = await this.prisma.scheduledReport.findFirst({
        where: {
          id,
          OR: [{ createdById: userId }, { branchId: null }],
        },
      });

      if (!report) {
        throw new NotFoundException(`Scheduled report with ID ${id} not found`);
      }

      return this.mapToEntity(report);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to fetch scheduled report: ${errorMessage}`,
        errorStack,
      );
      throw new InternalServerErrorException(
        `Failed to fetch scheduled report: ${errorMessage}`,
      );
    }
  }

  async update(
    updateScheduledReportInput: UpdateScheduledReportInput,
    userId: string,
  ): Promise<ScheduledReport> {
    try {
      // First check if the user has permission to update this report
      const existingReport = await this.prisma.scheduledReport.findFirst({
        where: {
          id: updateScheduledReportInput.id,
          OR: [{ createdById: userId }, { branchId: null }],
        },
      });

      if (!existingReport) {
        throw new Error(
          `Scheduled report with ID ${updateScheduledReportInput.id} not found or you don't have permission to update it`,
        );
      }

      // Calculate next run time if frequency is updated
      let nextRunAt = existingReport.nextRunAt;
      if (updateScheduledReportInput.frequency) {
        nextRunAt = this.calculateNextRunDate(
          new Date(),
          updateScheduledReportInput.frequency as unknown as ReportFrequencyEnum,
        );
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to update scheduled report: ${errorMessage}`,
        errorStack,
      );
      throw new InternalServerErrorException(
        `Failed to update scheduled report: ${errorMessage}`,
      );
    }
  }

  async remove(id: string, userId: string): Promise<boolean> {
    try {
      // First check if the user has permission to delete this report
      const existingReport = await this.prisma.scheduledReport.findFirst({
        where: {
          id,
          OR: [{ createdById: userId }, { branchId: null }],
        },
      });

      if (!existingReport) {
        throw new Error(
          `Scheduled report with ID ${id} not found or you don't have permission to delete it`,
        );
      }

      await this.prisma.scheduledReport.delete({
        where: { id },
      });

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to delete scheduled report: ${errorMessage}`,
        errorStack,
      );
      throw new InternalServerErrorException(
        `Failed to delete scheduled report: ${errorMessage}`,
      );
    }
  }

  async toggleActive(
    id: string,
    isActive: boolean,
    userId: string,
  ): Promise<ScheduledReport> {
    try {
      // First check if the user has permission to update this report
      const existingReport = await this.prisma.scheduledReport.findFirst({
        where: {
          id,
          OR: [{ createdById: userId }, { branchId: null }],
        },
      });

      if (!existingReport) {
        throw new Error(
          `Scheduled report with ID ${id} not found or you don't have permission to update it`,
        );
      }

      const updatedReport = await this.prisma.scheduledReport.update({
        where: { id },
        data: { isActive },
      });

      return this.mapToEntity(updatedReport);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to toggle scheduled report active status: ${errorMessage}`,
        errorStack,
      );
      throw new InternalServerErrorException(
        `Failed to toggle scheduled report active status: ${errorMessage}`,
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async runScheduledReports(): Promise<void> {
    try {
      this.logger.log('Checking for scheduled reports to run...');

      // Find all active reports that are due to run (nextRunAt <= now)
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
        // Execute each report
        for (const report of reportsToRun) {
          await this.executeScheduledReport(report);
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error in scheduled reports execution: ${errorMessage}`,
        errorStack,
      );
    }
  }

  private async executeScheduledReport(
    report: PrismaScheduledReport,
  ): Promise<void> {
    try {
      this.logger.log(
        `Executing scheduled report: ${report.name} (ID: ${report.id})`,
      );

      // Parse the filter JSON if it exists
      let filter: ReportFilterInput | undefined;
      if (report.filterJson) {
        filter = JSON.parse(report.filterJson) as ReportFilterInput;
      } else if (report.branchId) {
        // Create a basic filter with just the branchId
        filter = { branchId: report.branchId };
      }

      // Generate the report
      const reportData = await this.reportingService.generateReport(
        report.reportType,
        filter as ReportFilterInput,
        report.outputFormat as unknown as OutputFormat,
      );

      // Generate a file if needed
      let fileUrl: string | undefined;
      if (report.outputFormat !== 'JSON') {
        fileUrl = await this.reportingService.generateFileForReport(
          report.reportType,
          reportData.data || {},
          report.outputFormat as unknown as OutputFormat,
        );
      }

      // Send the report via email
      if (reportData) {
        await this.sendReportEmail(report, reportData, fileUrl);
      }

      // Update the report's lastRunAt and calculate the next run time
      const nextRunAt = this.calculateNextRunDate(
        new Date(),
        report.frequency as unknown as ReportFrequencyEnum,
      );

      await this.prisma.scheduledReport.update({
        where: { id: report.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt,
        },
      });

      this.logger.log(
        `Successfully executed scheduled report: ${report.name} (ID: ${report.id})`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to execute scheduled report ${report.id}: ${errorMessage}`,
        errorStack,
      );

      // Update the lastRunAt even if it failed, and set the next run time
      try {
        const nextRunAt = this.calculateNextRunDate(
          new Date(),
          report.frequency as unknown as ReportFrequencyEnum,
        );

        await this.prisma.scheduledReport.update({
          where: { id: report.id },
          data: {
            lastRunAt: new Date(),
            nextRunAt,
          },
        });
      } catch (updateError: unknown) {
        const updateErrorMsg =
          updateError instanceof Error ? updateError.message : 'Unknown error';
        this.logger.error(
          `Failed to update report after execution failure: ${updateErrorMsg}`,
        );
      }
    }
  }

  private async sendReportEmail(
    report: PrismaScheduledReport,
    reportData: ReportOutput,
    fileUrl?: string,
  ): Promise<void> {
    try {
      // Send the email with report data
      await this.mailService.sendScheduledReport({
        to: report.recipientEmails,
        subject: `Scheduled Report: ${report.name}`,
        reportName: report.name,
        reportData:
          reportData.data && typeof reportData.data === 'object'
            ? { ...reportData.data }
            : {},
        fileUrl,
      });

      this.logger.log(
        `Sent report email for ${report.name} to ${report.recipientEmails.join(', ')}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to send report email: ${errorMessage}`,
        errorStack,
      );
      // Don't rethrow, just log the error
    }
  }

  private calculateNextRunDate(
    currentDate: Date,
    frequency: ReportFrequencyEnum,
  ): Date {
    const now = new Date();
    const nextRun = new Date(now);

    switch (frequency) {
      case ReportFrequencyEnum.DAILY:
        // Run at the same time tomorrow
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case ReportFrequencyEnum.WEEKLY:
        // Run on the same day next week
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case ReportFrequencyEnum.MONTHLY:
        // Run on the same day next month
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      case ReportFrequencyEnum.QUARTERLY:
        // Run in 3 months
        nextRun.setMonth(nextRun.getMonth() + 3);
        break;
      default:
        // Default to daily
        nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun;
  }

  private mapToEntity(report: PrismaScheduledReport): ScheduledReport {
    return {
      id: report.id,
      name: report.name,
      reportType: report.reportType,
      frequency: report.frequency as unknown as ReportFrequency,
      lastRunAt: report.lastRunAt,
      nextRunAt: report.nextRunAt,
      recipientEmails: report.recipientEmails,
      outputFormat: report.outputFormat as unknown as OutputFormat,
      branchId: report.branchId,
      createdById: report.createdById,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      isActive: report.isActive,
      filterJson: report.filterJson,
    };
  }
}
