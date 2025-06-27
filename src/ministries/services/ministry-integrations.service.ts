import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Interface for attendance statistics
 */
interface AttendanceStats {
  totalEvents: number;
  totalAttendance: number;
  averageAttendance: number;
}

/**
 * Service to handle integrations between the Ministries module and other modules
 * such as Events, Attendance, and Communication.
 */
@Injectable()
export class MinistryIntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  /**
   * Helper method to safely check if a model exists in Prisma
   */
  private modelExists(modelName: string): boolean {
    return this.prisma[modelName] !== undefined;
  }

  /**
   * Helper method to safely access a Prisma model
   */
  private getModel(modelName: string): any {
    if (!this.modelExists(modelName)) {
      this.logger.warn(
        `${modelName} model not available in Prisma client`,
        'MinistryIntegrationsService',
      );
      return null;
    }
    return this.prisma[modelName];
  }

  /**
   * Get all events associated with a ministry
   * Integration with Events module
   */
  async getMinistryEvents(ministryId: string): Promise<any[]> {
    try {
      const eventModel = this.getModel('event');
      if (!eventModel) {
        return [];
      }

      return await eventModel.findMany({
        where: { ministryId },
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Error getting ministry events: ${err.message}`,
        err.stack,
        'MinistryIntegrationsService',
      );
      return [];
    }
  }

  /**
   * Get all events associated with a small group
   * Integration with Events module
   */
  async getSmallGroupEvents(smallGroupId: string): Promise<any[]> {
    try {
      const eventModel = this.getModel('event');
      if (!eventModel) {
        return [];
      }

      return await eventModel.findMany({
        where: { smallGroupId },
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Error getting small group events: ${err.message}`,
        err.stack,
        'MinistryIntegrationsService',
      );
      return [];
    }
  }

  /**
   * Record attendance for a ministry event
   * Integration with Attendance module
   */
  async recordMinistryAttendance(
    ministryId: string,
    eventId: string,
    attendees: string[],
  ): Promise<boolean> {
    try {
      // Verify that all attendees are members of the ministry
      const ministryMembers = await this.prisma.groupMember.findMany({
        where: {
          ministryId,
          status: 'ACTIVE',
        },
        select: {
          memberId: true,
        },
      });

      const memberIds = ministryMembers.map((member) => member.memberId);
      const invalidAttendees = attendees.filter(
        (attendeeId) => !memberIds.includes(attendeeId),
      );

      if (invalidAttendees.length > 0) {
        throw new Error(
          `The following attendees are not members of this ministry: ${invalidAttendees.join(
            ', ',
          )}`,
        );
      }

      const attendanceModel = this.getModel('attendance');
      if (!attendanceModel) {
        return false;
      }

      // Create attendance records for each attendee
      for (const attendeeId of attendees) {
        await attendanceModel.create({
          data: {
            eventId,
            memberId: attendeeId,
            status: 'PRESENT',
            notes: 'Recorded via ministry integration',
          },
        });
      }

      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Error recording ministry attendance: ${err.message}`,
        err.stack,
        'MinistryIntegrationsService',
      );
      return false;
    }
  }

  /**
   * Record attendance for a small group event
   * Integration with Attendance module
   */
  async recordSmallGroupAttendance(
    smallGroupId: string,
    eventId: string,
    attendees: string[],
  ): Promise<boolean> {
    try {
      // Verify that all attendees are members of the small group
      const smallGroupMembers = await this.prisma.groupMember.findMany({
        where: {
          smallGroupId,
          status: 'ACTIVE',
        },
        select: {
          memberId: true,
        },
      });

      const memberIds = smallGroupMembers.map((member) => member.memberId);
      const invalidAttendees = attendees.filter(
        (attendeeId) => !memberIds.includes(attendeeId),
      );

      if (invalidAttendees.length > 0) {
        throw new Error(
          `The following attendees are not members of this small group: ${invalidAttendees.join(
            ', ',
          )}`,
        );
      }

      const attendanceModel = this.getModel('attendance');
      if (!attendanceModel) {
        return false;
      }

      // Create attendance records for each attendee
      for (const attendeeId of attendees) {
        await attendanceModel.create({
          data: {
            eventId,
            memberId: attendeeId,
            status: 'PRESENT',
            notes: 'Recorded via small group integration',
          },
        });
      }

      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Error recording small group attendance: ${err.message}`,
        err.stack,
        'MinistryIntegrationsService',
      );
      return false;
    }
  }

  /**
   * Send a message to all members of a ministry
   * Integration with Communication module
   */
  async sendMinistryMessage(
    ministryId: string,
    subject: string,
    message: string,
    senderId: string,
  ): Promise<boolean> {
    try {
      // Get all ministry members
      const ministryMembers = await this.prisma.groupMember.findMany({
        where: {
          ministryId,
          status: 'ACTIVE',
        },
        select: {
          memberId: true,
        },
      });

      if (ministryMembers.length === 0) {
        this.logger.warn(
          `No active members found for ministry ${ministryId}`,
          'MinistryIntegrationsService',
        );
        return false;
      }

      const messageModel = this.getModel('message');
      if (!messageModel) {
        return false;
      }

      // Create a message record
      const messageRecord = await messageModel.create({
        data: {
          subject,
          content: message,
          senderId,
          type: 'GROUP',
          status: 'SENT',
          metadata: {
            groupType: 'MINISTRY',
            groupId: ministryId,
          },
        },
      });

      // Create recipient records for each member
      const messageRecipientModel = this.getModel('messageRecipient');
      if (!messageRecipientModel) {
        return false;
      }

      for (const member of ministryMembers) {
        await messageRecipientModel.create({
          data: {
            messageId: messageRecord.id,
            recipientId: member.memberId,
            status: 'DELIVERED',
          },
        });
      }

      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Error sending ministry message: ${err.message}`,
        err.stack,
        'MinistryIntegrationsService',
      );
      return false;
    }
  }

  /**
   * Send a message to all members of a small group
   * Integration with Communication module
   */
  async sendSmallGroupMessage(
    smallGroupId: string,
    subject: string,
    message: string,
    senderId: string,
  ): Promise<boolean> {
    try {
      // Get all small group members
      const smallGroupMembers = await this.prisma.groupMember.findMany({
        where: {
          smallGroupId,
          status: 'ACTIVE',
        },
        select: {
          memberId: true,
        },
      });

      if (smallGroupMembers.length === 0) {
        this.logger.warn(
          `No active members found for small group ${smallGroupId}`,
          'MinistryIntegrationsService',
        );
        return false;
      }

      const messageModel = this.getModel('message');
      if (!messageModel) {
        return false;
      }

      // Create a message record
      const messageRecord = await messageModel.create({
        data: {
          subject,
          content: message,
          senderId,
          type: 'GROUP',
          status: 'SENT',
          metadata: {
            groupType: 'SMALL_GROUP',
            groupId: smallGroupId,
          },
        },
      });

      // Create recipient records for each member
      const messageRecipientModel = this.getModel('messageRecipient');
      if (!messageRecipientModel) {
        return false;
      }

      for (const member of smallGroupMembers) {
        await messageRecipientModel.create({
          data: {
            messageId: messageRecord.id,
            recipientId: member.memberId,
            status: 'DELIVERED',
          },
        });
      }

      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Error sending small group message: ${err.message}`,
        err.stack,
        'MinistryIntegrationsService',
      );
      return false;
    }
  }

  /**
   * Get attendance statistics for a ministry
   * Integration with Attendance module
   */
  async getMinistryAttendanceStats(
    ministryId: string,
  ): Promise<AttendanceStats> {
    try {
      const eventModel = this.getModel('event');
      if (!eventModel) {
        return {
          totalEvents: 0,
          totalAttendance: 0,
          averageAttendance: 0,
        };
      }

      // Get all ministry events
      const ministryEvents = await eventModel.findMany({
        where: { ministryId },
      });

      const attendanceModel = this.getModel('attendance');
      if (!attendanceModel || ministryEvents.length === 0) {
        return {
          totalEvents: ministryEvents?.length || 0,
          totalAttendance: 0,
          averageAttendance: 0,
        };
      }

      // Get all attendance records for these events
      const eventIds = ministryEvents.map((event: any) => event.id);
      const attendanceRecords = await attendanceModel.findMany({
        where: {
          eventId: {
            in: eventIds,
          },
        },
      });

      // Calculate statistics
      const totalEvents = ministryEvents.length;
      const totalAttendance = attendanceRecords.length;
      const averageAttendance =
        totalEvents > 0 ? totalAttendance / totalEvents : 0;

      return {
        totalEvents,
        totalAttendance,
        averageAttendance,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Error getting ministry attendance stats: ${err.message}`,
        err.stack,
        'MinistryIntegrationsService',
      );
      return {
        totalEvents: 0,
        totalAttendance: 0,
        averageAttendance: 0,
      };
    }
  }

  /**
   * Get attendance statistics for a small group
   * Integration with Attendance module
   */
  async getSmallGroupAttendanceStats(
    smallGroupId: string,
  ): Promise<AttendanceStats> {
    try {
      const eventModel = this.getModel('event');
      if (!eventModel) {
        return {
          totalEvents: 0,
          totalAttendance: 0,
          averageAttendance: 0,
        };
      }

      // Get all small group events
      const smallGroupEvents = await eventModel.findMany({
        where: { smallGroupId },
      });

      const attendanceModel = this.getModel('attendance');
      if (!attendanceModel || smallGroupEvents.length === 0) {
        return {
          totalEvents: smallGroupEvents?.length || 0,
          totalAttendance: 0,
          averageAttendance: 0,
        };
      }

      // Get all attendance records for these events
      const eventIds = smallGroupEvents.map((event: any) => event.id);
      const attendanceRecords = await attendanceModel.findMany({
        where: {
          eventId: {
            in: eventIds,
          },
        },
      });

      // Calculate statistics
      const totalEvents = smallGroupEvents.length;
      const totalAttendance = attendanceRecords.length;
      const averageAttendance =
        totalEvents > 0 ? totalAttendance / totalEvents : 0;

      return {
        totalEvents,
        totalAttendance,
        averageAttendance,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Error getting small group attendance stats: ${err.message}`,
        err.stack,
        'MinistryIntegrationsService',
      );
      return {
        totalEvents: 0,
        totalAttendance: 0,
        averageAttendance: 0,
      };
    }
  }
}
