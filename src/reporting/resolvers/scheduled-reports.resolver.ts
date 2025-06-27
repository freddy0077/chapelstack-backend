import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ScheduledReportsService } from '../services/scheduled-reports.service';
import { ScheduledReport } from '../entities/scheduled-report.entity';
import { CreateScheduledReportInput } from '../dto/create-scheduled-report.input';
import { UpdateScheduledReportInput } from '../dto/update-scheduled-report.input';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { Permission } from '../../auth/enums/permission.enum';

@Resolver(() => ScheduledReport)
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class ScheduledReportsResolver {
  constructor(
    private readonly scheduledReportsService: ScheduledReportsService,
  ) {}

  @Mutation(() => ScheduledReport)
  @RequirePermissions(Permission.MANAGE_REPORTS)
  async createScheduledReport(
    @Args('input') createScheduledReportInput: CreateScheduledReportInput,
    @Context() context: any,
  ): Promise<ScheduledReport> {
    try {
      const userId = context.req.user.id;
      return await this.scheduledReportsService.create(
        createScheduledReportInput,
        userId,
      );
    } catch (error) {
      throw new Error(`Failed to create scheduled report: ${error.message}`);
    }
  }

  @Query(() => [ScheduledReport])
  @RequirePermissions(Permission.VIEW_REPORTS)
  async scheduledReports(
    @Args('branchId', { nullable: true }) branchId: string,
    @Context() context: any,
  ): Promise<ScheduledReport[]> {
    try {
      const userId = context.req.user.id;
      return await this.scheduledReportsService.findAll(userId, branchId);
    } catch (error) {
      throw new Error(`Failed to fetch scheduled reports: ${error.message}`);
    }
  }

  @Query(() => ScheduledReport)
  @RequirePermissions(Permission.VIEW_REPORTS)
  async scheduledReport(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<ScheduledReport> {
    try {
      const userId = context.req.user.id;
      return await this.scheduledReportsService.findOne(id, userId);
    } catch (error) {
      throw new Error(`Failed to fetch scheduled report: ${error.message}`);
    }
  }

  @Mutation(() => ScheduledReport)
  @RequirePermissions(Permission.MANAGE_REPORTS)
  async updateScheduledReport(
    @Args('input') updateScheduledReportInput: UpdateScheduledReportInput,
    @Context() context: any,
  ): Promise<ScheduledReport> {
    try {
      const userId = context.req.user.id;
      return await this.scheduledReportsService.update(
        updateScheduledReportInput,
        userId,
      );
    } catch (error) {
      throw new Error(`Failed to update scheduled report: ${error.message}`);
    }
  }

  @Mutation(() => Boolean)
  @RequirePermissions(Permission.MANAGE_REPORTS)
  async deleteScheduledReport(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<boolean> {
    try {
      const userId = context.req.user.id;
      return await this.scheduledReportsService.remove(id, userId);
    } catch (error) {
      throw new Error(`Failed to delete scheduled report: ${error.message}`);
    }
  }

  @Mutation(() => ScheduledReport)
  @RequirePermissions(Permission.MANAGE_REPORTS)
  async toggleScheduledReportActive(
    @Args('id') id: string,
    @Args('isActive') isActive: boolean,
    @Context() context: any,
  ): Promise<ScheduledReport> {
    try {
      const userId = context.req.user.id;
      return await this.scheduledReportsService.toggleActive(
        id,
        isActive,
        userId,
      );
    } catch (error) {
      throw new Error(
        `Failed to toggle scheduled report status: ${error.message}`,
      );
    }
  }
}
