import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReportingService } from '../services/reporting.service';
import { ReportOutput } from '../entities/report-output.entity';
import { ReportRequestInput, OutputFormat } from '../dto/report-filter.input';
import { DateRangeInput } from '../../common/dto/date-range.input';
import { MemberDemographicsData } from '../entities/member-demographics-data.entity';
import { AttendanceTrendData } from '../entities/attendance-trend-data.entity';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { MemberReportsService } from '../services/member-reports.service';
import { AttendanceReportsService } from '../services/attendance-reports.service';

@Resolver()
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class ReportingResolver {
  constructor(
    private reportingService: ReportingService,
    private memberReportsService: MemberReportsService,
    private attendanceReportsService: AttendanceReportsService,
  ) {}

  @Query(() => ReportOutput)
  @RequirePermissions({ action: 'generate', subject: 'reports' })
  async generateReport(
    @Args('input') input: ReportRequestInput,
  ): Promise<ReportOutput> {
    return this.reportingService.generateReport(
      input.reportType,
      input.filter,
      input.outputFormat || OutputFormat.JSON,
    );
  }

  @Query(() => MemberDemographicsData)
  @RequirePermissions({ action: 'view', subject: 'reports.members' })
  async memberDemographicsReport(
    @Args('branchId', { type: () => ID, nullable: true })
    branchId?: string,
    @Args('organisationId', { type: () => ID, nullable: true })
    organisationId?: string,
    @Args('dateRange', { nullable: true }) dateRange?: DateRangeInput,
  ): Promise<MemberDemographicsData> {
    return await this.memberReportsService.getMemberDemographicsReport(
      branchId,
      organisationId,
      dateRange,
    );
  }

  @Query(() => AttendanceTrendData)
  @RequirePermissions({ action: 'view', subject: 'reports.attendance' })
  async attendanceTrendReport(
    @Args('branchId', { type: () => ID, nullable: true })
    branchId?: string,
    @Args('organisationId', { type: () => ID, nullable: true })
    organisationId?: string,
    @Args('eventTypeId', { type: () => ID, nullable: true })
    eventTypeId?: string,
    @Args('dateRange', { nullable: true }) dateRange?: DateRangeInput,
  ): Promise<AttendanceTrendData> {
    return await this.attendanceReportsService.getAttendanceTrendReport(
      branchId,
      organisationId,
      eventTypeId,
      dateRange,
    );
  }
}
