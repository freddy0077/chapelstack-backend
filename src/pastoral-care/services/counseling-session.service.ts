import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCounselingSessionInput,
  UpdateCounselingSessionInput,
  CounselingSessionFilterInput,
} from '../dto/counseling-session.dto';
import { CounselingSession, CounselingSessionStatus } from '@prisma/client';

@Injectable()
export class CounselingSessionService {
  constructor(private prisma: PrismaService) {}

  async createCounselingSession(
    input: CreateCounselingSessionInput,
    createdBy: string,
  ): Promise<CounselingSession> {
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

    // Verify counselor exists and has access
    const counselor = await this.prisma.user.findFirst({
      where: {
        id: input.counselorId,
        organisationId: input.organisationId,
      },
    });

    if (!counselor) {
      throw new NotFoundException('Counselor not found or access denied');
    }

    const session = await this.prisma.counselingSession.create({
      data: {
        primaryMemberId: input.memberId,
        counselorId: input.counselorId,
        title: input.title,
        description: input.description,
        scheduledDate: new Date(input.scheduledDate),
        duration: input.duration,
        sessionType: input.sessionType,
        status: input.status || CounselingSessionStatus.SCHEDULED,
        location: input.location,
        sessionNotes: input.sessionNotes,
        privateNotes: input.privateNotes,
        homework: input.homework,
        nextSteps: input.nextSteps,
        sessionNumber: input.sessionNumber,
        totalSessions: input.totalSessions,
        progressNotes: input.progressNotes,
        organisationId: input.organisationId,
        branchId: input.branchId,
        createdBy,
      },
      include: {
        primaryMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        counselor: {
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

    // Map primaryMemberId to memberId and add isConfidential for DTO compatibility
    return {
      ...session,
      memberId: session.primaryMemberId,
      isConfidential: true, // Default to confidential for counseling sessions
    } as any;
  }

  async updateCounselingSession(
    input: UpdateCounselingSessionInput,
    userId: string,
    organisationId: string,
    branchId?: string,
  ): Promise<CounselingSession> {
    // Verify the session exists and user has access
    const existingSession = await this.prisma.counselingSession.findFirst({
      where: {
        id: input.id,
        organisationId,
        ...(branchId && { branchId }),
      },
    });

    if (!existingSession) {
      throw new NotFoundException(
        'Counseling session not found or access denied',
      );
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
      updateData.primaryMemberId = input.memberId;
    }

    if (input.counselorId) {
      // Verify new counselor exists and has access
      const counselor = await this.prisma.user.findFirst({
        where: {
          id: input.counselorId,
          organisationId,
        },
      });
      if (!counselor) {
        throw new NotFoundException('Counselor not found or access denied');
      }
      updateData.counselorId = input.counselorId;
    }

    if (input.title) updateData.title = input.title;
    if (input.description) updateData.description = input.description;
    if (input.sessionType) updateData.sessionType = input.sessionType;
    if (input.scheduledDate)
      updateData.scheduledDate = new Date(input.scheduledDate);
    if (input.duration) updateData.duration = input.duration;
    if (input.location) updateData.location = input.location;
    if (input.isRecurring) updateData.isRecurring = input.isRecurring;
    if (input.recurringPattern)
      updateData.recurringPattern = input.recurringPattern;
    if (input.sessionNotes) updateData.sessionNotes = input.sessionNotes;
    if (input.privateNotes) updateData.privateNotes = input.privateNotes;
    if (input.homework) updateData.homework = input.homework;
    if (input.nextSteps) updateData.nextSteps = input.nextSteps;
    if (input.sessionNumber) updateData.sessionNumber = input.sessionNumber;
    if (input.totalSessions) updateData.totalSessions = input.totalSessions;
    if (input.progressNotes) updateData.progressNotes = input.progressNotes;
    if (input.status) {
      updateData.status = input.status;
      // Set actualDate when status changes to COMPLETED
      if (
        input.status === CounselingSessionStatus.COMPLETED &&
        !existingSession.actualDate
      ) {
        updateData.actualDate = new Date();
      }
    }

    const session = await this.prisma.counselingSession.update({
      where: { id: input.id },
      data: updateData,
      include: {
        primaryMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        counselor: {
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

    // Map primaryMemberId to memberId and add isConfidential for DTO compatibility
    return {
      ...session,
      memberId: session.primaryMemberId,
      isConfidential: true, // Default to confidential for counseling sessions
    } as any;
  }

  async getCounselingSessions(
    filter: CounselingSessionFilterInput,
    userId: string,
    skip = 0,
    take = 50,
  ): Promise<{ sessions: CounselingSession[]; total: number }> {
    const where: any = {
      organisationId: filter.organisationId,
      ...(filter.branchId && { branchId: filter.branchId }),
      ...(filter.memberId && { primaryMemberId: filter.memberId }),
      ...(filter.counselorId && { counselorId: filter.counselorId }),
      ...(filter.sessionType && { sessionType: filter.sessionType }),
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

    const [sessions, total] = await Promise.all([
      this.prisma.counselingSession.findMany({
        where,
        skip,
        take,
        orderBy: { scheduledDate: 'desc' },
        include: {
          primaryMember: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
          counselor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.counselingSession.count({ where }),
    ]);

    // Map primaryMemberId to memberId and add isConfidential for DTO compatibility
    const mappedSessions = sessions.map(
      (session) =>
        ({
          ...session,
          memberId: session.primaryMemberId,
          isConfidential: true, // Default to confidential for counseling sessions
        }) as any,
    );

    return { sessions: mappedSessions, total };
  }

  async getCounselingSessionById(
    id: string,
    userId: string,
    organisationId: string,
    branchId?: string,
  ): Promise<CounselingSession> {
    const session = await this.prisma.counselingSession.findFirst({
      where: {
        id,
        organisationId,
        ...(branchId && { branchId }),
      },
      include: {
        primaryMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        counselor: {
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

    if (!session) {
      throw new NotFoundException(
        'Counseling session not found or access denied',
      );
    }

    // Map primaryMemberId to memberId and add isConfidential for DTO compatibility
    return {
      ...session,
      memberId: session.primaryMemberId,
      isConfidential: true, // Default to confidential for counseling sessions
    } as any;
  }

  async deleteCounselingSession(
    id: string,
    userId: string,
    organisationId: string,
    branchId?: string,
  ): Promise<boolean> {
    const session = await this.prisma.counselingSession.findFirst({
      where: {
        id,
        organisationId,
        ...(branchId && { branchId }),
      },
    });

    if (!session) {
      throw new NotFoundException(
        'Counseling session not found or access denied',
      );
    }

    // Check if user has permission to delete
    if (session.createdBy !== userId && session.counselorId !== userId) {
      throw new ForbiddenException('Access denied to delete this session');
    }

    await this.prisma.counselingSession.delete({
      where: { id },
    });

    return true;
  }

  async getUpcomingSessions(
    organisationId: string,
    branchId?: string,
  ): Promise<CounselingSession[]> {
    const sessions = await this.prisma.counselingSession.findMany({
      where: {
        organisationId,
        ...(branchId && { branchId }),
        scheduledDate: {
          gte: new Date(),
        },
        status: {
          in: [CounselingSessionStatus.SCHEDULED],
        },
      },
      orderBy: { scheduledDate: 'asc' },
      include: {
        primaryMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Map primaryMemberId to memberId and add isConfidential for DTO compatibility
    return sessions.map(
      (session) =>
        ({
          ...session,
          memberId: session.primaryMemberId,
          isConfidential: true, // Default to confidential for counseling sessions
        }) as any,
    );
  }

  async getSessionsByMember(
    memberId: string,
    organisationId: string,
    branchId?: string,
    userId?: string,
  ): Promise<CounselingSession[]> {
    const where: any = {
      primaryMemberId: memberId,
      organisationId,
      ...(branchId && { branchId }),
    };

    const sessions = await this.prisma.counselingSession.findMany({
      where,
      orderBy: { scheduledDate: 'desc' },
      include: {
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Map primaryMemberId to memberId and add isConfidential for DTO compatibility
    return sessions.map(
      (session) =>
        ({
          ...session,
          memberId: session.primaryMemberId,
          isConfidential: true, // Default to confidential for counseling sessions
        }) as any,
    );
  }
}
