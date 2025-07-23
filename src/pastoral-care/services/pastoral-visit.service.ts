import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePastoralVisitInput,
  UpdatePastoralVisitInput,
  PastoralVisitFilterInput,
} from '../dto/pastoral-visit.dto';
import { PastoralVisit, PastoralVisitStatus } from '@prisma/client';

@Injectable()
export class PastoralVisitService {
  constructor(private prisma: PrismaService) {}

  async createPastoralVisit(
    input: CreatePastoralVisitInput,
    createdBy: string,
  ): Promise<PastoralVisit> {
    // Verify member exists and belongs to the organization/branch
    const member = await this.prisma.member.findFirst({
      where: {
        id: input.memberId,
        organisationId: input.organisationId,
        ...(input.branchId && { branchId: input.branchId }),
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found or access denied');
    }

    // Verify pastor exists and has access
    const pastor = await this.prisma.user.findFirst({
      where: {
        id: input.pastorId,
        organisationId: input.organisationId,
      },
    });

    if (!pastor) {
      throw new NotFoundException('Pastor not found or access denied');
    }

    return this.prisma.pastoralVisit.create({
      data: {
        memberId: input.memberId,
        pastorId: input.pastorId,
        title: input.title,
        description: input.description,
        visitType: input.visitType,
        scheduledDate: new Date(input.scheduledDate),
        location: input.location,
        notes: input.notes,
        status: input.status || PastoralVisitStatus.SCHEDULED,
        followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
        organisationId: input.organisationId,
        branchId: input.branchId,
        createdBy,
      },
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
        pastor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        organisation: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async updatePastoralVisit(
    input: UpdatePastoralVisitInput,
    userId: string,
    organisationId: string,
    branchId?: string,
  ): Promise<PastoralVisit> {
    // Verify the visit exists and user has access
    const existingVisit = await this.prisma.pastoralVisit.findFirst({
      where: {
        id: input.id,
        organisationId,
        ...(branchId && { branchId }),
      },
    });

    if (!existingVisit) {
      throw new NotFoundException('Pastoral visit not found or access denied');
    }

    // Prepare update data
    const updateData: any = {};

    if (input.memberId) {
      // Verify new member exists and has access
      const member = await this.prisma.member.findFirst({
        where: {
          id: input.memberId,
          organisationId,
          ...(branchId && { branchId }),
        },
      });
      if (!member) {
        throw new NotFoundException('Member not found or access denied');
      }
      updateData.memberId = input.memberId;
    }

    if (input.pastorId) {
      // Verify new pastor exists and has access
      const pastor = await this.prisma.user.findFirst({
        where: {
          id: input.pastorId,
          organisationId,
        },
      });
      if (!pastor) {
        throw new NotFoundException('Pastor not found or access denied');
      }
      updateData.pastorId = input.pastorId;
    }

    if (input.title) updateData.title = input.title;
    if (input.description) updateData.description = input.description;
    if (input.visitType) updateData.visitType = input.visitType;
    if (input.scheduledDate)
      updateData.scheduledDate = new Date(input.scheduledDate);
    if (input.location !== undefined) updateData.location = input.location;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.status) {
      updateData.status = input.status;
      // Set actualDate when status changes to COMPLETED
      if (
        input.status === PastoralVisitStatus.COMPLETED &&
        !existingVisit.actualDate
      ) {
        updateData.actualDate = new Date();
      }
    }
    if (input.followUpDate !== undefined) {
      updateData.followUpDate = input.followUpDate
        ? new Date(input.followUpDate)
        : null;
    }

    return this.prisma.pastoralVisit.update({
      where: { id: input.id },
      data: updateData,
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
        pastor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        organisation: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getPastoralVisits(
    filter: PastoralVisitFilterInput,
    skip = 0,
    take = 50,
  ): Promise<{ visits: PastoralVisit[]; total: number }> {
    const where: any = {
      organisationId: filter.organisationId,
      ...(filter.branchId && { branchId: filter.branchId }),
      ...(filter.memberId && { memberId: filter.memberId }),
      ...(filter.pastorId && { pastorId: filter.pastorId }),
      ...(filter.visitType && { visitType: filter.visitType }),
      ...(filter.status && { status: filter.status }),
    };

    // Date range filtering
    if (filter.startDate || filter.endDate) {
      where.scheduledDate = {};
      if (filter.startDate) {
        where.scheduledDate.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.scheduledDate.lte = new Date(filter.endDate);
      }
    }

    const [visits, total] = await Promise.all([
      this.prisma.pastoralVisit.findMany({
        where,
        skip,
        take,
        orderBy: { scheduledDate: 'desc' },
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
          pastor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.pastoralVisit.count({ where }),
    ]);

    return { visits, total };
  }

  async getPastoralVisitById(
    id: string,
    organisationId: string,
    branchId?: string,
  ): Promise<PastoralVisit> {
    const visit = await this.prisma.pastoralVisit.findFirst({
      where: {
        id,
        organisationId,
        ...(branchId && { branchId }),
      },
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
        pastor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        organisation: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!visit) {
      throw new NotFoundException('Pastoral visit not found or access denied');
    }

    return visit;
  }

  async deletePastoralVisit(
    id: string,
    organisationId: string,
    branchId?: string,
  ): Promise<boolean> {
    const visit = await this.prisma.pastoralVisit.findFirst({
      where: {
        id,
        organisationId,
        ...(branchId && { branchId }),
      },
    });

    if (!visit) {
      throw new NotFoundException('Pastoral visit not found or access denied');
    }

    await this.prisma.pastoralVisit.delete({
      where: { id },
    });

    return true;
  }

  async getUpcomingVisits(
    organisationId: string,
    branchId?: string,
    days = 7,
  ): Promise<PastoralVisit[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.prisma.pastoralVisit.findMany({
      where: {
        organisationId,
        ...(branchId && { branchId }),
        scheduledDate: {
          gte: new Date(),
          lte: endDate,
        },
        status: PastoralVisitStatus.SCHEDULED,
      },
      orderBy: { scheduledDate: 'asc' },
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
        pastor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
}
