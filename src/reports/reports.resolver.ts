import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import {
  ReportTemplate,
  CreateReportTemplateInput,
  UpdateReportTemplateInput,
  ExecuteReportInput,
  ReportResult,
  ReportExecution,
  CreateScheduledReportInput,
  ScheduledReport,
  ReportCategory,
  ExportReportInput,
  ExportResult,
} from './dto/report.dto';

@Resolver()
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  // ==================== Report Templates ====================

  @Mutation(() => ReportTemplate)
  @UseGuards(GqlAuthGuard)
  async createReportTemplate(
    @Args('input') input: CreateReportTemplateInput,
    @CurrentUser() user: any,
  ): Promise<ReportTemplate> {
    return this.reportsService.createTemplate(input, user.id) as any;
  }

  @Query(() => [ReportTemplate])
  async reportTemplates(
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('category', { type: () => ReportCategory, nullable: true }) category?: ReportCategory,
  ): Promise<ReportTemplate[]> {
    return this.reportsService.getTemplates(organisationId, branchId, category) as any;
  }

  @Query(() => ReportTemplate, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async reportTemplate(@Args('id') id: string): Promise<ReportTemplate | null> {
    return this.reportsService.getTemplateById(id) as any;
  }

  @Mutation(() => ReportTemplate)
  async updateReportTemplate(
    @Args('id') id: string,
    @Args('input') input: UpdateReportTemplateInput,
  ): Promise<ReportTemplate> {
    return this.reportsService.updateTemplate(id, input) as any;
  }

  @Mutation(() => ReportTemplate)
  async deleteReportTemplate(@Args('id') id: string): Promise<ReportTemplate> {
    return this.reportsService.deleteTemplate(id) as any;
  }

  // ==================== Report Execution ====================

  @Mutation(() => ReportResult)
  @UseGuards(GqlAuthGuard)
  async executeReport(
    @Args('input') input: ExecuteReportInput,
    @CurrentUser() user: any,
  ): Promise<ReportResult> {
    // Normalize filters defensively at resolver level
    const parsedFilters = typeof (input as any)?.filters === 'string'
      ? JSON.parse((input as any).filters as any)
      : ((input as any)?.filters || {});
    const normalizedInput = { ...input, filters: parsedFilters } as ExecuteReportInput;
    try { console.debug('resolver.executeReport filters keys:', Object.keys(parsedFilters)); } catch {}
    return this.reportsService.executeReport(normalizedInput, user?.id || 'system');
  }

  @Query(() => [ReportExecution])
  @UseGuards(GqlAuthGuard)
  async reportHistory(
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('category', { type: () => ReportCategory, nullable: true })
    category?: ReportCategory,
  ): Promise<ReportExecution[]> {
    return this.reportsService.getReportHistory(
      organisationId,
      branchId,
      category,
    ) as any;
  }

  @Query(() => ReportExecution, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async reportExecution(@Args('id') id: string): Promise<ReportExecution> {
    return this.reportsService.getReportExecutionById(id) as any;
  }

  // ==================== Scheduled Reports ====================

  @Mutation(() => ScheduledReport)
  @UseGuards(GqlAuthGuard)
  async createScheduledReport(
    @Args('input') input: CreateScheduledReportInput,
    @CurrentUser() user: any,
  ): Promise<ScheduledReport> {
    return this.reportsService.createScheduledReport(input, user.id) as any;
  }

  @Query(() => [ScheduledReport])
  @UseGuards(GqlAuthGuard)
  async scheduledReports(
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
  ): Promise<ScheduledReport[]> {
    return this.reportsService.getScheduledReports(organisationId, branchId) as any;
  }
}
