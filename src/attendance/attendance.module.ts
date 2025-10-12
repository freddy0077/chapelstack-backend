import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceResolver } from './attendance.resolver';
import { AttendanceAlertsService } from './attendance-alerts.service';
import { AttendanceStatsService } from './attendance-stats.service';
import { AttendanceReportsService } from './attendance-reports.service';
import { FileGenerationService } from './file-generation.service';
import { AbsenteeService } from './services/absentee.service';
import { AbsenteeResolver } from './resolvers/absentee.resolver';
import { ReportsController } from './reports.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [PrismaModule, WorkflowsModule],
  controllers: [ReportsController],
  providers: [
    AttendanceResolver,
    AttendanceService,
    AttendanceAlertsService,
    AttendanceStatsService,
    AttendanceReportsService,
    FileGenerationService,
    AbsenteeService,
    AbsenteeResolver,
  ],
  exports: [
    AttendanceService,
    AttendanceAlertsService,
    AttendanceStatsService,
    AttendanceReportsService,
    FileGenerationService,
    AbsenteeService,
  ],
})
export class AttendanceModule {}
