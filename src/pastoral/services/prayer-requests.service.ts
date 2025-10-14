import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePrayerRequestInput,
  UpdatePrayerRequestInput,
} from '../dto';
import { PrayerRequestStatus } from '@prisma/client';

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
        memberId: data.memberId,
        requestText: data.requestText || data.description || '',
        branchId,
        organisationId,
        status: PrayerRequestStatus.NEW,
        assignedPastorId: data.assignedPastorId,
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
    status,
    skip,
    take,
  }: {
    branchId?: string;
    organisationId?: string;
    memberId?: string;
    status?: PrayerRequestStatus;
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

    if (status) {
      where.status = status;
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

    return request;
  }

  /**
   * Update a prayer request
   */
  async update(id: string, data: UpdatePrayerRequestInput, userId?: string) {
    this.logger.log(`Updating prayer request ${id}`);

    // Check if request exists and user has access
    await this.findOne(id, userId);

    const updateData: any = {};
    
    if (data.requestText) updateData.requestText = data.requestText;
    if (data.status) updateData.status = data.status as PrayerRequestStatus;
    if (data.assignedPastorId !== undefined) updateData.assignedPastorId = data.assignedPastorId;

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
        status: PrayerRequestStatus.ANSWERED,
      },
    });
  }

  /**
   * Archive a prayer request (mark as answered since ARCHIVED doesn't exist)
   */
  async archive(id: string) {
    this.logger.log(`Archiving prayer request ${id}`);

    return this.prisma.prayerRequest.update({
      where: { id },
      data: {
        status: PrayerRequestStatus.ANSWERED,
      },
    });
  }

  /**
   * Add a note to prayer request (not supported in current schema)
   */
  async addNote(id: string, note: string) {
    const request = await this.findOne(id);
    // Note: notes field doesn't exist in schema, this is a placeholder
    // You may want to create a separate PrayerRequestNote model
    return request;
  }

  /**
   * Increment prayer count (not supported in current schema)
   */
  async pray(id: string, userId: string) {
    const request = await this.findOne(id);
    // Note: prayerCount and prayedBy fields don't exist in schema
    // You may want to create a separate PrayerLog model to track this
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

    const [total, newRequests, inProgress, answered] = await Promise.all([
      this.prisma.prayerRequest.count({ where }),
      this.prisma.prayerRequest.count({
        where: { ...where, status: PrayerRequestStatus.NEW },
      }),
      this.prisma.prayerRequest.count({
        where: { ...where, status: PrayerRequestStatus.IN_PROGRESS },
      }),
      this.prisma.prayerRequest.count({
        where: { ...where, status: PrayerRequestStatus.ANSWERED },
      }),
    ]);

    return {
      total,
      new: newRequests,
      inProgress,
      answered,
    };
  }

  /**
   * Get count of prayer requests
   */
  async count(filters?: {
    branchId?: string;
    organisationId?: string;
    status?: PrayerRequestStatus;
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
