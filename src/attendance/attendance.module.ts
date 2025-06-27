import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceResolver } from './attendance.resolver';
import { AttendanceAlertsService } from './attendance-alerts.service';
import { AttendanceStatsService } from './attendance-stats.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    AttendanceResolver,
    AttendanceService,
    AttendanceAlertsService,
    AttendanceStatsService,
  ],
  exports: [AttendanceService, AttendanceAlertsService, AttendanceStatsService],
})
export class AttendanceModule {}
