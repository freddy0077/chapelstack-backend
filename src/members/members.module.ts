import { Module } from '@nestjs/common';
import { MembersService } from './services/members.service';
import { MemberReportsService } from './services/member-reports.service';
import { SpiritualMilestonesService } from './services/spiritual-milestones.service';
import { FamiliesService } from './services/families.service';
import { MembersResolver } from './resolvers/members.resolver';
import { SpiritualMilestonesResolver } from './resolvers/spiritual-milestones.resolver';
import { FamiliesResolver } from './resolvers/families.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { ConfigModule } from '@nestjs/config';
import { ContentModule } from '../content/content.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { MemberIdGenerationService } from '../common/services/member-id-generation.service';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    AttendanceModule,
    ConfigModule,
    ContentModule,
    WorkflowsModule,
  ],
  providers: [
    MembersService,
    MemberReportsService,
    SpiritualMilestonesService,
    FamiliesService,
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
  ],
})
export class MembersModule {}
