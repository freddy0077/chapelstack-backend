import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AbsenteeMessageType, AbsenteeMessageStatus } from '@prisma/client';

export interface AbsenteeFilters {
  regularAttendersOnly?: boolean;
  minConsecutiveAbsences?: number;
  memberGroupIds?: string[];
}

export interface AbsenteeInfo {
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string | null;
    profileImageUrl?: string | null;
  };
  lastAttendance?: Date;
  consecutiveAbsences: number;
  isRegularAttender: boolean;
  attendanceRate: number;
}

export interface SendAbsenteeMessageInput {
  organisationId: string;
  branchId: string;
  eventId?: string;
  attendanceSessionId?: string;
  memberIds: string[];
  messageType: AbsenteeMessageType;
  subject?: string;
  message: string;
  userId: string;
}

@Injectable()
export class AbsenteeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get absentees for a specific event or session
   */
  async getAbsentees(params: {
    organisationId: string;
    branchId: string;
    eventId?: string;
    attendanceSessionId?: string;
    filters?: AbsenteeFilters;
  }): Promise<AbsenteeInfo[]> {
    const { organisationId, branchId, eventId, attendanceSessionId, filters } =
      params;

    // 1. Get all active branch members
    const allMembers = await this.prisma.member.findMany({
      where: {
        organisationId,
        branchId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        profileImageUrl: true,
      },
    });

    // 2. Get attendance records for the event/session
    const attendanceWhere: any = {};
    if (eventId) attendanceWhere.eventId = eventId;
    if (attendanceSessionId)
      attendanceWhere.attendanceSessionId = attendanceSessionId;

    const attendance = await this.prisma.attendanceRecord.findMany({
      where: attendanceWhere,
      select: { memberId: true },
    });

    const attendedMemberIds = new Set(attendance.map((a) => a.memberId));

    // 3. Find absentees
    const absentMembers = allMembers.filter(
      (member) => !attendedMemberIds.has(member.id),
    );

    // 4. Enrich with attendance data
    const absenteesWithData = await Promise.all(
      absentMembers.map(async (member) => {
        const attendanceData = await this.getMemberAttendanceData(member.id);
        return {
          member,
          lastAttendance: attendanceData.lastAttendance,
          consecutiveAbsences: attendanceData.consecutiveAbsences,
          isRegularAttender: attendanceData.attendanceRate > 0.75,
          attendanceRate: attendanceData.attendanceRate,
        };
      }),
    );

    // 5. Apply filters
    let filteredAbsentees = absenteesWithData;

    if (filters?.regularAttendersOnly) {
      filteredAbsentees = filteredAbsentees.filter((a) => a.isRegularAttender);
    }

    if (filters?.minConsecutiveAbsences && filters.minConsecutiveAbsences > 0) {
      filteredAbsentees = filteredAbsentees.filter(
        (a) => a.consecutiveAbsences >= (filters.minConsecutiveAbsences || 1),
      );
    }

    return filteredAbsentees;
  }

  /**
   * Get attendance data for a specific member
   */
  async getMemberAttendanceData(memberId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAttendance = await this.prisma.attendanceRecord.findMany({
      where: {
        memberId,
        checkInTime: { gte: thirtyDaysAgo },
      },
      orderBy: { checkInTime: 'desc' },
    });

    const lastAttendance = recentAttendance[0]?.checkInTime;

    // Calculate consecutive absences (simplified - count days since last attendance)
    const consecutiveAbsences = lastAttendance
      ? Math.floor(
          (Date.now() - lastAttendance.getTime()) / (1000 * 60 * 60 * 24 * 7),
        )
      : 4; // Default to 4 weeks if never attended

    // Calculate attendance rate (last 30 days)
    const totalPossibleSessions = 4; // Assume 4 weekly sessions in 30 days
    const attendanceRate = recentAttendance.length / totalPossibleSessions;

    return {
      lastAttendance,
      consecutiveAbsences,
      attendanceRate: Math.min(attendanceRate, 1),
    };
  }

  /**
   * Get multi-week absentees
   */
  async getMultiWeekAbsentees(
    organisationId: string,
    branchId: string,
    weeks: number,
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const members = await this.prisma.member.findMany({
      where: {
        organisationId,
        branchId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
      },
    });

    const absentees: Array<{
      member: (typeof members)[0];
      consecutiveAbsences: number;
      lastAttendance?: Date;
    }> = [];

    for (const member of members) {
      const attendance = await this.prisma.attendanceRecord.findMany({
        where: {
          memberId: member.id,
          checkInTime: { gte: startDate },
        },
      });

      if (attendance.length === 0) {
        const lastAttendance = await this.prisma.attendanceRecord.findFirst({
          where: { memberId: member.id },
          orderBy: { checkInTime: 'desc' },
        });

        absentees.push({
          member,
          consecutiveAbsences: weeks,
          lastAttendance: lastAttendance?.checkInTime,
        });
      }
    }

    return absentees;
  }

  /**
   * Send message to absentees
   */
  async sendAbsenteeMessage(input: SendAbsenteeMessageInput) {
    // Validate input
    if (!input.memberIds || input.memberIds.length === 0) {
      throw new Error('No members selected for messaging');
    }

    // 1. Create message record
    const message = await this.prisma.absenteeMessage.create({
      data: {
        organisationId: input.organisationId,
        branchId: input.branchId,
        eventId: input.eventId,
        attendanceSessionId: input.attendanceSessionId,
        sentBy: input.userId,
        messageType: input.messageType,
        subject: input.subject,
        message: input.message,
        recipientCount: input.memberIds.length,
      },
    });

    // 2. Send to each member
    const results = await Promise.allSettled(
      input.memberIds.map(async (memberId) => {
        const member = await this.prisma.member.findUnique({
          where: { id: memberId },
        });

        if (!member) {
          throw new Error(`Member ${memberId} not found`);
        }

        // Personalize message
        const personalizedMessage = this.personalizeMessage(
          input.message,
          member,
        );

        // TODO: Integrate with SMS/Email service
        console.log(
          `Sending ${input.messageType} to ${member.firstName}:`,
          personalizedMessage,
        );

        // Create recipient record
        await this.prisma.absenteeMessageRecipient.create({
          data: {
            messageId: message.id,
            memberId,
            status: AbsenteeMessageStatus.SENT,
          },
        });

        return { success: true, memberId };
      }),
    );

    // 3. Update delivery stats
    const delivered = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    await this.prisma.absenteeMessage.update({
      where: { id: message.id },
      data: {
        deliveredCount: delivered,
        failedCount: failed,
      },
    });

    return {
      ...message,
      deliveredCount: delivered,
      failedCount: failed,
    };
  }

  /**
   * Personalize message with member data
   */
  private personalizeMessage(template: string, member: any): string {
    return template
      .replace(/{firstName}/g, member.firstName || '')
      .replace(/{lastName}/g, member.lastName || '')
      .replace(/{fullName}/g, `${member.firstName} ${member.lastName}`.trim());
  }

  /**
   * Get message history
   */
  async getMessageHistory(params: {
    organisationId: string;
    branchId: string;
    limit?: number;
  }) {
    return this.prisma.absenteeMessage.findMany({
      where: {
        organisationId: params.organisationId,
        branchId: params.branchId,
      },
      include: {
        recipients: {
          take: 5, // Just show first 5 recipients
        },
      },
      orderBy: { sentAt: 'desc' },
      take: params.limit || 20,
    });
  }
}
