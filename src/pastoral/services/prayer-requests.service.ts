import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePrayerRequestInput,
  UpdatePrayerRequestInput,
} from '../dto';
import { PrayerStatus, PrivacyLevel } from '../entities/prayer-request.entity';

@Injectable()
export class PrayerRequestsService {
  private readonly logger = new Logger(PrayerRequestsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new prayer request
   */
  async create(
    data: CreatePrayerRequestInput,
    userId: string,
    branchId: string,
    organisationId: string,
  ) {
    this.logger.log(`Creating prayer request for member ${data.memberId}`);

    return this.prisma.prayerRequest.create({
      data: {
        ...data,
        createdBy: userId,
        branchId,
        organisationId,
        status: PrayerStatus.ACTIVE,
        prayerCount: 0,
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Find all prayer requests with optional filtering
   */
  async findAll({
    branchId,
    organisationId,
    memberId,
    category,
    priority,
    status,
    privacyLevel,
    userId,
    skip,
    take,
  }: {
    branchId?: string;
    organisationId?: string;
    memberId?: string;
    category?: string;
    priority?: string;
    status?: PrayerStatus;
    privacyLevel?: PrivacyLevel;
    userId?: string;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (branchId) {
      where.branchId = branchId;
    } else if (organisationId) {
      where.organisationId = organisationId;
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    if (status) {
      where.status = status;
    }

    // Privacy filtering
    if (privacyLevel) {
      where.privacyLevel = privacyLevel;
    } else if (userId) {
      // If user is specified, show public requests and their own private requests
      where.OR = [
        { privacyLevel: PrivacyLevel.PUBLIC },
        { createdBy: userId },
      ];
    } else {
      // Default to public only
      where.privacyLevel = PrivacyLevel.PUBLIC;
    }

    return this.prisma.prayerRequest.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take,
    });
  }

  /**
   * Find one prayer request by ID
   */
  async findOne(id: string, userId?: string) {
    const request = await this.prisma.prayerRequest.findUnique({
      where: { id },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Prayer request with ID ${id} not found`);
    }

    // Check privacy
    if (
      request.privacyLevel === PrivacyLevel.PRIVATE &&
      request.createdBy !== userId
    ) {
      throw new NotFoundException(`Prayer request with ID ${id} not found`);
    }

    return request;
  }

  /**
   * Update a prayer request
   */
  async update(id: string, data: UpdatePrayerRequestInput, userId?: string) {
    this.logger.log(`Updating prayer request ${id}`);

    // Check if request exists and user has access
    await this.findOne(id, userId);

    const { id: _, ...updateData } = data;

    return this.prisma.prayerRequest.update({
      where: { id },
      data: updateData,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Mark prayer request as answered
   */
  async markAnswered(id: string, answeredDescription?: string) {
    this.logger.log(`Marking prayer request ${id} as answered`);

    return this.prisma.prayerRequest.update({
      where: { id },
      data: {
        status: PrayerStatus.ANSWERED,
        answeredDate: new Date(),
        answeredDescription,
      },
    });
  }

  /**
   * Archive a prayer request
   */
  async archive(id: string) {
    this.logger.log(`Archiving prayer request ${id}`);

    return this.prisma.prayerRequest.update({
      where: { id },
      data: {
        status: PrayerStatus.ARCHIVED,
      },
    });
  }

  /**
   * Add a note to prayer request
   */
  async addNote(id: string, note: string) {
    const request = await this.findOne(id);

    const notes = request.notes || [];
    notes.push(note);

    return this.prisma.prayerRequest.update({
      where: { id },
      data: {
        notes,
      },
    });
  }

  /**
   * Increment prayer count
   */
  async pray(id: string, userId: string) {
    const request = await this.findOne(id);

    const prayedBy = request.prayedBy || [];
    
    // Only increment if user hasn't prayed before
    if (!prayedBy.includes(userId)) {
      prayedBy.push(userId);

      return this.prisma.prayerRequest.update({
        where: { id },
        data: {
          prayerCount: request.prayerCount + 1,
          prayedBy,
        },
      });
    }

    return request;
  }

  /**
   * Delete a prayer request
   */
  async remove(id: string, userId?: string) {
    this.logger.log(`Deleting prayer request ${id}`);

    // Check if request exists and user has access
    await this.findOne(id, userId);

    return this.prisma.prayerRequest.delete({
      where: { id },
    });
  }

  /**
   * Get prayer request statistics
   */
  async getStats(branchId?: string, organisationId?: string) {
    const where: any = {};

    if (branchId) {
      where.branchId = branchId;
    } else if (organisationId) {
      where.organisationId = organisationId;
    }

    const [total, active, answered, urgent] = await Promise.all([
      this.prisma.prayerRequest.count({ where }),
      this.prisma.prayerRequest.count({
        where: { ...where, status: PrayerStatus.ACTIVE },
      }),
      this.prisma.prayerRequest.count({
        where: { ...where, status: PrayerStatus.ANSWERED },
      }),
      this.prisma.prayerRequest.count({
        where: { ...where, priority: 'URGENT' },
      }),
    ]);

    return {
      total,
      active,
      answered,
      urgent,
    };
  }

  /**
   * Get count of prayer requests
   */
  async count(filters?: {
    branchId?: string;
    organisationId?: string;
    status?: PrayerStatus;
  }) {
    const where: any = {};

    if (filters?.branchId) {
      where.branchId = filters.branchId;
    } else if (filters?.organisationId) {
      where.organisationId = filters.organisationId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.prayerRequest.count({ where });
  }
}
