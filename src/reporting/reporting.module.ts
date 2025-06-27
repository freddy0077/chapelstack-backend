import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportingService } from './services/reporting.service';
import { MemberReportsService } from './services/member-reports.service';
import { AttendanceReportsService } from './services/attendance-reports.service';
import { FinancialReportsService } from './services/financial-reports.service';
import { ReportingResolver } from './resolvers/reporting.resolver';
import { DashboardService } from './services/dashboard.service';
import { DashboardResolver } from './resolvers/dashboard.resolver';

import { ContentModule } from '../content/content.module';
import { CommunicationsModule } from '../communications/communications.module';
import { forwardRef } from '@nestjs/common';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { BranchesModule } from '../branches/branches.module';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [
    PrismaModule,
    ContentModule,
    CommunicationsModule,
    forwardRef(() => OnboardingModule),
    BranchesModule,
    MembersModule,
  ],
  providers: [
    ReportingService,
    MemberReportsService,
    AttendanceReportsService,
    FinancialReportsService,
    DashboardService,
    ReportingResolver,
    DashboardResolver,
  ],
  exports: [
    ReportingService,
    MemberReportsService,
    AttendanceReportsService,
    FinancialReportsService,
    DashboardService,
  ],
})
export class ReportingModule {}
