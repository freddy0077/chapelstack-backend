import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFollowUpInput } from '../dto';
import { FollowUpStatus } from '../entities/follow-up.entity';

@Injectable()
export class FollowUpsService {
  private readonly logger = new Logger(FollowUpsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new follow-up
   */
  async create(
    data: CreateFollowUpInput,
    userId: string,
    branchId: string,
    organisationId: string,
  ) {
    this.logger.log(`Creating follow-up for member ${data.memberId}`);

    return this.prisma.followUp.create({
      data: {
        ...data,
        assignedTo: data.assignedTo || userId,
        createdBy: userId,
        branchId,
        organisationId,
        status: FollowUpStatus.PENDING,
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
   * Find all follow-ups with optional filtering
   */
  async findAll({
    branchId,
    organisationId,
    memberId,
    assignedTo,
    type,
    status,
    overdue,
    skip,
    take,
  }: {
    branchId?: string;
    organisationId?: string;
    memberId?: string;
    assignedTo?: string;
    type?: string;
    status?: FollowUpStatus;
    overdue?: boolean;
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

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (overdue) {
      where.dueDate = { lt: new Date() };
      where.status = FollowUpStatus.PENDING;
    }

    return this.prisma.followUp.findMany({
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
        dueDate: 'asc',
      },
      skip,
      take,
    });
  }

  /**
   * Find one follow-up by ID
   */
  async findOne(id: string) {
    const followUp = await this.prisma.followUp.findUnique({
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

    if (!followUp) {
      throw new NotFoundException(`Follow-up with ID ${id} not found`);
    }

    return followUp;
  }

  /**
   * Update a follow-up
   */
  async update(id: string, data: Partial<CreateFollowUpInput>) {
    this.logger.log(`Updating follow-up ${id}`);

    await this.findOne(id);

    return this.prisma.followUp.update({
      where: { id },
      data,
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
   * Mark follow-up as completed
   */
  async complete(id: string, completedNotes?: string) {
    this.logger.log(`Completing follow-up ${id}`);

    return this.prisma.followUp.update({
      where: { id },
      data: {
        status: FollowUpStatus.COMPLETED,
        completedDate: new Date(),
        completedNotes,
      },
    });
  }

  /**
   * Mark follow-up as overdue
   */
  async markOverdue() {
    this.logger.log('Marking overdue follow-ups');

    return this.prisma.followUp.updateMany({
      where: {
        status: FollowUpStatus.PENDING,
        dueDate: { lt: new Date() },
      },
      data: {
        status: FollowUpStatus.OVERDUE,
      },
    });
  }

  /**
   * Delete a follow-up
   */
  async remove(id: string) {
    this.logger.log(`Deleting follow-up ${id}`);

    await this.findOne(id);

    return this.prisma.followUp.delete({
      where: { id },
    });
  }

  /**
   * Get upcoming follow-ups
   */
  async getUpcoming(
    assignedTo?: string,
    branchId?: string,
    organisationId?: string,
    days: number = 7,
  ) {
    const where: any = {
      status: FollowUpStatus.PENDING,
      dueDate: {
        gte: new Date(),
        lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      },
    };

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    if (branchId) {
      where.branchId = branchId;
    } else if (organisationId) {
      where.organisationId = organisationId;
    }

    return this.prisma.followUp.findMany({
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
        dueDate: 'asc',
      },
    });
  }

  /**
   * Get follow-up statistics
   */
  async getStats(branchId?: string, organisationId?: string) {
    const where: any = {};

    if (branchId) {
      where.branchId = branchId;
    } else if (organisationId) {
      where.organisationId = organisationId;
    }

    const [total, pending, completed, overdue] = await Promise.all([
      this.prisma.followUp.count({ where }),
      this.prisma.followUp.count({
        where: { ...where, status: FollowUpStatus.PENDING },
      }),
      this.prisma.followUp.count({
        where: { ...where, status: FollowUpStatus.COMPLETED },
      }),
      this.prisma.followUp.count({
        where: {
          ...where,
          status: FollowUpStatus.PENDING,
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    return {
      total,
      pending,
      completed,
      overdue,
    };
  }
}
