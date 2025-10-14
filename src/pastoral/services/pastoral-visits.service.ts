import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePastoralVisitInput,
  UpdatePastoralVisitInput,
} from '../dto';
import { VisitStatus } from '../entities/pastoral-visit.entity';

@Injectable()
export class PastoralVisitsService {
  private readonly logger = new Logger(PastoralVisitsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new pastoral visit
   */
  async create(
    data: CreatePastoralVisitInput,
    userId: string,
    branchId: string,
    organisationId: string,
  ) {
    this.logger.log(`Creating pastoral visit for member ${data.memberId}`);

    return this.prisma.pastoralVisit.create({
      data: {
        ...data,
        createdBy: userId,
        branchId,
        organisationId,
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
   * Find all pastoral visits with optional filtering
   */
  async findAll({
    branchId,
    organisationId,
    memberId,
    visitType,
    status,
    skip,
    take,
  }: {
    branchId?: string;
    organisationId?: string;
    memberId?: string;
    visitType?: string;
    status?: VisitStatus;
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

    if (visitType) {
      where.visitType = visitType;
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.pastoralVisit.findMany({
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
      orderBy: {
        visitDate: 'desc',
      },
      skip,
      take,
    });
  }

  /**
   * Find one pastoral visit by ID
   */
  async findOne(id: string) {
    const visit = await this.prisma.pastoralVisit.findUnique({
      where: { id },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!visit) {
      throw new NotFoundException(`Pastoral visit with ID ${id} not found`);
    }

    return visit;
  }

  /**
   * Update a pastoral visit
   */
  async update(id: string, data: UpdatePastoralVisitInput) {
    this.logger.log(`Updating pastoral visit ${id}`);

    // Check if visit exists
    await this.findOne(id);

    const { id: _, ...updateData } = data;

    return this.prisma.pastoralVisit.update({
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
   * Mark visit as completed
   */
  async complete(id: string, completedNotes?: string) {
    this.logger.log(`Completing pastoral visit ${id}`);

    return this.prisma.pastoralVisit.update({
      where: { id },
      data: {
        status: VisitStatus.COMPLETED,
        completedAt: new Date(),
        notes: completedNotes,
      },
    });
  }

  /**
   * Cancel a visit
   */
  async cancel(id: string, reason?: string) {
    this.logger.log(`Cancelling pastoral visit ${id}`);

    return this.prisma.pastoralVisit.update({
      where: { id },
      data: {
        status: VisitStatus.CANCELLED,
        cancelledReason: reason,
      },
    });
  }

  /**
   * Delete a pastoral visit
   */
  async remove(id: string) {
    this.logger.log(`Deleting pastoral visit ${id}`);

    // Check if visit exists
    await this.findOne(id);

    return this.prisma.pastoralVisit.delete({
      where: { id },
    });
  }

  /**
   * Get visit statistics
   */
  async getStats(branchId?: string, organisationId?: string) {
    const where: any = {};

    if (branchId) {
      where.branchId = branchId;
    } else if (organisationId) {
      where.organisationId = organisationId;
    }

    const [total, scheduled, completed, cancelled] = await Promise.all([
      this.prisma.pastoralVisit.count({ where }),
      this.prisma.pastoralVisit.count({
        where: { ...where, status: VisitStatus.SCHEDULED },
      }),
      this.prisma.pastoralVisit.count({
        where: { ...where, status: VisitStatus.COMPLETED },
      }),
      this.prisma.pastoralVisit.count({
        where: { ...where, status: VisitStatus.CANCELLED },
      }),
    ]);

    return {
      total,
      scheduled,
      completed,
      cancelled,
    };
  }

  /**
   * Get upcoming visits
   */
  async getUpcoming(branchId?: string, organisationId?: string, days: number = 7) {
    const where: any = {
      status: VisitStatus.SCHEDULED,
      visitDate: {
        gte: new Date(),
        lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      },
    };

    if (branchId) {
      where.branchId = branchId;
    } else if (organisationId) {
      where.organisationId = organisationId;
    }

    return this.prisma.pastoralVisit.findMany({
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
      orderBy: {
        visitDate: 'asc',
      },
    });
  }
}
