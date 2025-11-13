import { Module, forwardRef } from '@nestjs/common';
import { MembersService } from './services/members.service';
import { MemberReportsService } from './services/member-reports.service';
import { SpiritualMilestonesService } from './services/spiritual-milestones.service';
import { FamiliesService } from './services/families.service';
import { BirthdayAnniversaryAutomationService } from './services/birthday-anniversary-automation.service';
import { MemberLookupService } from './services/member-lookup.service';
import { MembersResolver } from './resolvers/members.resolver';
import { SpiritualMilestonesResolver } from './resolvers/spiritual-milestones.resolver';
import { FamiliesResolver } from './resolvers/families.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { ConfigModule } from '@nestjs/config';
import { ContentModule } from '../content/content.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { CommunicationsModule } from '../communications/communications.module';
import { EngagementModule } from '../engagement/engagement.module';
import { CommonModule } from '../common/common.module';
import { MemberIdGenerationService } from '../common/services/member-id-generation.service';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    AttendanceModule,
    ConfigModule,
    ContentModule,
    WorkflowsModule,
    CommunicationsModule,
    CommonModule,
    forwardRef(() => EngagementModule),
  ],
  providers: [
    MembersService,
    MemberReportsService,
    SpiritualMilestonesService,
    FamiliesService,
    BirthdayAnniversaryAutomationService,
    MemberLookupService,
    MembersResolver,
    SpiritualMilestonesResolver,
    FamiliesResolver,
    MemberIdGenerationService,
  ],
  exports: [
    MembersService,
    MemberReportsService,
    SpiritualMilestonesService,
    FamiliesService,
    BirthdayAnniversaryAutomationService,
    MemberLookupService,
  ],
})
export class MembersModule {}
