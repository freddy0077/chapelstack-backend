import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCareRequestInput,
  UpdateCareRequestInput,
  CareRequestFilterInput,
} from '../dto/care-request.dto';
import { CareRequest, CareRequestStatus } from '@prisma/client';

@Injectable()
export class CareRequestService {
  constructor(private prisma: PrismaService) {}

  async createCareRequest(
    input: CreateCareRequestInput,
    createdBy: string,
  ): Promise<CareRequest> {
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

    // Verify assigned pastor if provided
    if (input.assignedPastorId) {
      const pastor = await this.prisma.user.findFirst({
        where: {
          id: input.assignedPastorId,
          organisationId: input.organisationId,
        },
      });

      if (!pastor) {
        throw new NotFoundException(
          'Assigned pastor not found or access denied',
        );
      }
    }

    const careRequest = await this.prisma.careRequest.create({
      data: {
        requesterId: input.memberId,
        title: input.title,
        description: input.description,
        requestType: input.requestType,
        priority: input.priority,
        requestDate: new Date(input.requestDate),
        assignedPastorId: input.assignedPastorId,
        status: input.status || CareRequestStatus.SUBMITTED,
        organisationId: input.organisationId,
        branchId: input.branchId,
        createdBy,
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            memberId: true,
          },
        },
        assignedPastor: {
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

    // Map requesterId to memberId for DTO compatibility
    return {
      ...careRequest,
      memberId: careRequest.requesterId,
    } as any;
  }

  async updateCareRequest(
    input: UpdateCareRequestInput,
    userId: string,
    organisationId: string,
    branchId?: string,
  ): Promise<CareRequest> {
    // Verify the request exists and user has access
    const existingRequest = await this.prisma.careRequest.findFirst({
      where: {
        id: input.id,
        organisationId,
        ...(branchId && { branchId }),
      },
    });

    if (!existingRequest) {
      throw new NotFoundException('Care request not found or access denied');
    }

    // Prepare update data
    const updateData: any = {};

    if (input.memberId) {
      // Verify new requester exists and has access
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
      updateData.requesterId = input.memberId;
    }

    if (input.assignedPastorId !== undefined) {
      if (input.assignedPastorId) {
        // Verify new pastor exists and has access
        const pastor = await this.prisma.user.findFirst({
          where: {
            id: input.assignedPastorId,
            organisationId,
          },
        });
        if (!pastor) {
          throw new NotFoundException(
            'Assigned pastor not found or access denied',
          );
        }
      }
      updateData.assignedPastorId = input.assignedPastorId;
    }

    if (input.requestType) updateData.requestType = input.requestType;
    if (input.priority) updateData.priority = input.priority;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.status) {
      updateData.status = input.status;
      // Set completionDate when status changes to COMPLETED
      if (
        input.status === CareRequestStatus.COMPLETED &&
        !existingRequest.completionDate
      ) {
        updateData.completionDate = new Date();
      }
    }

    const careRequest = await this.prisma.careRequest.update({
      where: { id: input.id },
      data: updateData,
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            memberId: true,
          },
        },
        assignedPastor: {
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

    // Map requesterId to memberId for DTO compatibility
    return {
      ...careRequest,
      memberId: careRequest.requesterId,
    } as any;
  }

  async getCareRequests(
    filter: CareRequestFilterInput,
    skip = 0,
    take = 50,
  ): Promise<{ requests: CareRequest[]; total: number }> {
    const where: any = {
      organisationId: filter.organisationId,
      ...(filter.branchId && { branchId: filter.branchId }),
      ...(filter.memberId && { requesterId: filter.memberId }),
      ...(filter.assignedPastorId && {
        assignedPastorId: filter.assignedPastorId,
      }),
      ...(filter.requestType && { requestType: filter.requestType }),
      ...(filter.priority && { priority: filter.priority }),
      ...(filter.status && { status: filter.status }),
    };

    // Date range filtering
    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.createdAt.lte = new Date(filter.endDate);
      }
    }

    const [requests, total] = await Promise.all([
      this.prisma.careRequest.findMany({
        where,
        skip,
        take,
        orderBy: [
          { priority: 'desc' }, // High priority first
          { createdAt: 'desc' }, // Then by creation date
        ],
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              memberId: true,
            },
          },
          assignedPastor: {
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
      this.prisma.careRequest.count({ where }),
    ]);

    // Map requesterId to memberId for DTO compatibility
    const mappedRequests = requests.map((request) => ({
      ...request,
      memberId: request.requesterId,
    })) as any[];

    return { requests: mappedRequests, total };
  }

  async getCareRequestById(
    id: string,
    organisationId: string,
    branchId?: string,
  ): Promise<CareRequest> {
    const request = await this.prisma.careRequest.findFirst({
      where: {
        id,
        organisationId,
        ...(branchId && { branchId }),
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            memberId: true,
          },
        },
        assignedPastor: {
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

    if (!request) {
      throw new NotFoundException('Care request not found or access denied');
    }

    // Map requesterId to memberId for DTO compatibility
    return {
      ...request,
      memberId: request.requesterId,
    } as any;
  }

  async deleteCareRequest(
    id: string,
    organisationId: string,
    branchId?: string,
  ): Promise<boolean> {
    const request = await this.prisma.careRequest.findFirst({
      where: {
        id,
        organisationId,
        ...(branchId && { branchId }),
      },
    });

    if (!request) {
      throw new NotFoundException('Care request not found or access denied');
    }

    await this.prisma.careRequest.delete({
      where: { id },
    });

    return true;
  }

  async assignCareRequest(
    id: string,
    assignedPastorId: string,
    organisationId: string,
    branchId?: string,
  ): Promise<CareRequest> {
    // Verify the request exists
    const request = await this.prisma.careRequest.findFirst({
      where: {
        id,
        organisationId,
        ...(branchId && { branchId }),
      },
    });

    if (!request) {
      throw new NotFoundException('Care request not found or access denied');
    }

    // Verify pastor exists and has access
    const pastor = await this.prisma.user.findFirst({
      where: {
        id: assignedPastorId,
        organisationId,
      },
    });

    if (!pastor) {
      throw new NotFoundException('Pastor not found or access denied');
    }

    const careRequest = await this.prisma.careRequest.update({
      where: { id },
      data: {
        assignedPastorId,
        status: CareRequestStatus.IN_PROGRESS,
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            memberId: true,
          },
        },
        assignedPastor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Map requesterId to memberId for DTO compatibility
    return {
      ...careRequest,
      memberId: careRequest.requesterId,
    } as any;
  }

  async getOverdueRequests(
    organisationId: string,
    branchId?: string,
  ): Promise<CareRequest[]> {
    const requests = await this.prisma.careRequest.findMany({
      where: {
        organisationId,
        ...(branchId && { branchId }),
        status: {
          notIn: [CareRequestStatus.COMPLETED, CareRequestStatus.CANCELLED],
        },
      },
      orderBy: [{ priority: 'desc' }],
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            memberId: true,
          },
        },
        assignedPastor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Map requesterId to memberId for DTO compatibility
    const mappedRequests = requests.map((request) => ({
      ...request,
      memberId: request.requesterId,
    })) as any[];

    return mappedRequests;
  }

  async getRequestsByPastor(
    pastorId: string,
    organisationId: string,
    branchId?: string,
    status?: CareRequestStatus,
  ): Promise<CareRequest[]> {
    const where: any = {
      assignedPastorId: pastorId,
      organisationId,
      ...(branchId && { branchId }),
      ...(status && { status }),
    };

    const requests = await this.prisma.careRequest.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            memberId: true,
          },
        },
      },
    });

    // Map requesterId to memberId for DTO compatibility
    const mappedRequests = requests.map((request) => ({
      ...request,
      memberId: request.requesterId,
    })) as any[];

    return mappedRequests;
  }
}
