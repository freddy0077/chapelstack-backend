import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbsenceAlertConfigInput } from './dto/absence-alert-config.input';
import {
  AbsentMember,
  AbsenceAlertResult,
} from './entities/absence-alert.entity';

@Injectable()
export class AttendanceAlertsService {
  private readonly logger = new Logger(AttendanceAlertsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Identifies members who haven't attended in the specified number of days
   */
  async findAbsentMembers(
    config: AbsenceAlertConfigInput,
  ): Promise<AbsenceAlertResult> {
    const { branchId, absenceThresholdDays } = config;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - absenceThresholdDays);

    // Find active members who haven't attended since the cutoff date
    const absentMembers = await this.prisma.$queryRaw<AbsentMember[]>`
      SELECT m.id, m."firstName", m."lastName", m.email, m.phone, 
             MAX(ar."checkInTime") as "lastAttendance"
      FROM "Member" m
      LEFT JOIN "AttendanceRecord" ar ON m.id = ar."memberId"
      WHERE m."branchId" = ${branchId}
      AND m."isActive" = true
      GROUP BY m.id, m."firstName", m."lastName", m.email, m.phone
      HAVING MAX(ar."checkInTime") < ${cutoffDate} OR MAX(ar."checkInTime") IS NULL
      ORDER BY "lastAttendance" ASC NULLS FIRST
    `;

    return {
      success: true,
      count: absentMembers.length,
      members: absentMembers,
    };
  }

  /**
   * Generates absence alerts for members who haven't attended in the specified period
   */
  async generateAbsenceAlerts(
    config: AbsenceAlertConfigInput,
  ): Promise<AbsenceAlertResult> {
    const result = await this.findAbsentMembers(config);

    if (result.members.length === 0) {
      return { success: true, count: 0, members: [] };
    }
    const absentMembers = result.members;

    // Log alerts for now - in a real implementation, this would send emails/SMS
    for (const member of absentMembers) {
      const lastAttendance = member.lastAttendance
        ? new Date(member.lastAttendance).toLocaleDateString()
        : 'Never';

      this.logger.log(
        `Absence alert for ${member.firstName} ${member.lastName} - Last attendance: ${lastAttendance}`,
      );

      if (config.sendEmailAlerts && member.email) {
        // In a real implementation, this would send an email
        this.logger.log(`Would send email to ${member.email}`);
      }

      if (config.sendSmsAlerts && member.phone) {
        // In a real implementation, this would send an SMS
        this.logger.log(`Would send SMS to ${member.phone}`);
      }
    }

    return {
      success: true,
      count: absentMembers.length,
      members: absentMembers,
    };
  }

  /**
   * Schedules regular absence checks (could be called by a cron job)
   */
  async scheduleAbsenceCheck(config: AbsenceAlertConfigInput) {
    // In a real implementation, this would set up a scheduled task
    // For now, we'll just run the check immediately
    return this.generateAbsenceAlerts(config);
  }
}
