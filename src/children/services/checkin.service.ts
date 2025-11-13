import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckInRecord } from '../entities/check-in-record.entity';
import { CheckInInput } from '../dto/check-in.input';
import { CheckOutInput } from '../dto/check-out.input';
import { AuditLogService } from '../../audit/services/audit-log.service';

@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async checkIn(checkInInput: CheckInInput): Promise<CheckInRecord> {
    // Verify child exists
    const child = await this.prisma.child.findUnique({
      where: { id: checkInInput.childId },
    });

    if (!child) {
      throw new NotFoundException(
        `Child with ID ${checkInInput.childId} not found`,
      );
    }

    // Verify guardian exists
    const guardian = await this.prisma.guardian.findUnique({
      where: { id: checkInInput.guardianIdAtCheckIn },
    });

    if (!guardian) {
      throw new NotFoundException(
        `Guardian with ID ${checkInInput.guardianIdAtCheckIn} not found`,
      );
    }

    // Verify guardian is authorized for this child
    const guardianRelation = await this.prisma.childGuardianRelation.findFirst({
      where: {
        childId: checkInInput.childId,
        guardianId: checkInInput.guardianIdAtCheckIn,
      },
    });

    if (!guardianRelation) {
      throw new BadRequestException(
        `Guardian is not authorized for this child`,
      );
    }

    // Verify event exists if provided
    if (checkInInput.eventId) {
      const event = await this.prisma.childrenEvent.findUnique({
        where: { id: checkInInput.eventId },
      });

      if (!event) {
        throw new NotFoundException(
          `Event with ID ${checkInInput.eventId} not found`,
        );
      }
    }

    // Check if child is already checked in and not checked out
    const activeCheckIn = await this.prisma.checkInRecord.findFirst({
      where: {
        childId: checkInInput.childId,
        checkedOutAt: null,
      },
    });

    if (activeCheckIn) {
      throw new BadRequestException(
        `Child is already checked in and not checked out`,
      );
    }

    // Create check-in record
    const checkInRecord = await this.prisma.checkInRecord.create({
      data: {
        childId: checkInInput.childId,
        eventId: checkInInput.eventId,
        checkedInById: checkInInput.checkedInById,
        guardianIdAtCheckIn: checkInInput.guardianIdAtCheckIn,
        notes: checkInInput.notes,
        branchId: checkInInput.branchId,
      },
      include: {
        child: true,
        event: true,
        checkedInBy: true,
      },
    });

    // Log child check-in - scoped to branch
    try {
      await this.auditLogService.create({
        action: 'CHECK_IN_CHILD',
        entityType: 'CheckInRecord',
        entityId: checkInRecord.id,
        description: `Child checked in: ${child.firstName} ${child.lastName}`,
        userId: checkInInput.checkedInById,
        branchId: checkInInput.branchId || undefined, // 🔒 Branch-scoped: log belongs to check-in's branch
        metadata: {
          childName: `${child.firstName} ${child.lastName}`,
          guardianId: checkInInput.guardianIdAtCheckIn,
          eventId: checkInInput.eventId,
        },
      });
    } catch (auditError) {
      this.logger.error(
        `Failed to create audit log for check-in ${checkInRecord.id}: ${(auditError as Error).message}`,
      );
    }

    return checkInRecord;
  }

  async checkOut(checkOutInput: CheckOutInput): Promise<CheckInRecord> {
    // Verify check-in record exists
    const checkInRecord = await this.prisma.checkInRecord.findUnique({
      where: { id: checkOutInput.checkInRecordId },
    });

    if (!checkInRecord) {
      throw new NotFoundException(
        `Check-in record with ID ${checkOutInput.checkInRecordId} not found`,
      );
    }

    // Verify record is not already checked out
    if (checkInRecord.checkedOutAt) {
      throw new BadRequestException(`Child is already checked out`);
    }

    // Verify guardian exists
    const guardian = await this.prisma.guardian.findUnique({
      where: { id: checkOutInput.guardianIdAtCheckOut },
    });

    if (!guardian) {
      throw new NotFoundException(
        `Guardian with ID ${checkOutInput.guardianIdAtCheckOut} not found`,
      );
    }

    // Verify guardian is authorized for this child
    const guardianRelation = await this.prisma.childGuardianRelation.findFirst({
      where: {
        childId: checkInRecord.childId,
        guardianId: checkOutInput.guardianIdAtCheckOut,
      },
    });

    if (!guardianRelation && !guardian.canPickup) {
      throw new BadRequestException(
        `Guardian is not authorized to pick up this child`,
      );
    }

    // Get child info for logging
    const child = await this.prisma.child.findUnique({
      where: { id: checkInRecord.childId },
    });

    // Update check-in record with check-out information
    const updatedRecord = await this.prisma.checkInRecord.update({
      where: { id: checkOutInput.checkInRecordId },
      data: {
        checkedOutById: checkOutInput.checkedOutById,
        checkedOutAt: new Date(),
        guardianIdAtCheckOut: checkOutInput.guardianIdAtCheckOut,
        notes: checkOutInput.notes
          ? `${checkInRecord.notes || ''}\nCheck-out notes: ${checkOutInput.notes}`
          : checkInRecord.notes,
      },
      include: {
        child: true,
        event: true,
        checkedInBy: true,
        checkedOutBy: true,
      },
    });

    // Log child check-out - scoped to branch
    try {
      await this.auditLogService.create({
        action: 'CHECK_OUT_CHILD',
        entityType: 'CheckInRecord',
        entityId: updatedRecord.id,
        description: `Child checked out: ${child?.firstName} ${child?.lastName}`,
        userId: checkOutInput.checkedOutById,
        branchId: checkInRecord.branchId || undefined, // 🔒 Branch-scoped: log belongs to check-in's branch
        metadata: {
          childName: child ? `${child.firstName} ${child.lastName}` : undefined,
          guardianId: checkOutInput.guardianIdAtCheckOut,
        },
      });
    } catch (auditError) {
      this.logger.error(
        `Failed to create audit log for check-out ${updatedRecord.id}: ${(auditError as Error).message}`,
      );
    }

    return updatedRecord;
  }

  async findActiveCheckIns(
    branchId: string,
    eventId?: string,
  ): Promise<CheckInRecord[]> {
    const where: any = {
      branchId,
      checkedOutAt: null,
    };

    if (eventId) {
      where.eventId = eventId;
    }

    return this.prisma.checkInRecord.findMany({
      where,
      include: {
        child: true,
        event: true,
        checkedInBy: true,
      },
      orderBy: { checkedInAt: 'desc' },
    });
  }

  async findCheckInHistory(
    branchId: string,
    dateFrom?: Date,
    dateTo?: Date,
    childId?: string,
    eventId?: string,
  ): Promise<CheckInRecord[]> {
    const where: any = { branchId };

    if (childId) {
      where.childId = childId;
    }

    if (eventId) {
      where.eventId = eventId;
    }

    if (dateFrom || dateTo) {
      where.checkedInAt = {};
      if (dateFrom) {
        where.checkedInAt.gte = dateFrom;
      }
      if (dateTo) {
        where.checkedInAt.lte = dateTo;
      }
    }

    return this.prisma.checkInRecord.findMany({
      where,
      include: {
        child: true,
        event: true,
        checkedInBy: true,
        checkedOutBy: true,
      },
      orderBy: { checkedInAt: 'desc' },
    });
  }

  async getCheckInStats(
    branchId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<any> {
    const where: any = { branchId };

    if (dateFrom || dateTo) {
      where.checkedInAt = {};
      if (dateFrom) {
        where.checkedInAt.gte = dateFrom;
      }
      if (dateTo) {
        where.checkedInAt.lte = dateTo;
      }
    }

    const totalCheckIns = await this.prisma.checkInRecord.count({ where });

    // Add checked out condition
    where.checkedOutAt = { not: null };
    const totalCheckOuts = await this.prisma.checkInRecord.count({ where });

    // Get unique children checked in
    const uniqueChildren = await this.prisma.checkInRecord.groupBy({
      by: ['childId'],
      where,
    });

    // Get check-ins by event
    const checkInsByEvent = await this.prisma.checkInRecord.groupBy({
      by: ['eventId'],
      where,
      _count: true,
    });

    return {
      totalCheckIns,
      totalCheckOuts,
      uniqueChildrenCount: uniqueChildren.length,
      checkInsByEvent,
    };
  }
}
