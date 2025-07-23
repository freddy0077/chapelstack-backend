import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateFollowUpReminderInput,
  UpdateFollowUpReminderInput,
  FollowUpReminderFilterInput,
} from '../dto/follow-up-reminder.dto';
import { FollowUpReminder, FollowUpStatus, FollowUpType } from '@prisma/client';

@Injectable()
export class FollowUpReminderService {
  constructor(private prisma: PrismaService) {}

  async createFollowUpReminder(
    input: CreateFollowUpReminderInput,
    createdBy: string,
  ): Promise<FollowUpReminder> {
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

    // Verify assigned user exists and has access
    const assignedUser = await this.prisma.user.findFirst({
      where: {
        id: input.assignedToId,
        organisationId: input.organisationId,
      },
    });

    if (!assignedUser) {
      throw new NotFoundException('Assigned user not found or access denied');
    }

    return this.prisma.followUpReminder.create({
      data: {
        memberId: input.memberId,
        followUpType: input.followUpType,
        title: input.title,
        description: input.description,
        dueDate: new Date(input.dueDate),
        reminderDate: input.reminderDate ? new Date(input.reminderDate) : null,
        assignedToId: input.assignedToId,
        notes: input.notes,
        status: input.status || FollowUpStatus.PENDING,
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
        assignedTo: {
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

  async updateFollowUpReminder(
    input: UpdateFollowUpReminderInput,
    userId: string,
    organisationId: string,
    branchId?: string,
  ): Promise<FollowUpReminder> {
    // Verify the reminder exists and user has access
    const existingReminder = await this.prisma.followUpReminder.findFirst({
      where: {
        id: input.id,
        organisationId,
        ...(branchId && { branchId }),
      },
    });

    if (!existingReminder) {
      throw new NotFoundException(
        'Follow-up reminder not found or access denied',
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
      updateData.memberId = input.memberId;
    }

    if (input.assignedToId) {
      // Verify new assigned user exists and has access
      const assignedUser = await this.prisma.user.findFirst({
        where: {
          id: input.assignedToId,
          organisationId,
        },
      });
      if (!assignedUser) {
        throw new NotFoundException('Assigned user not found or access denied');
      }
      updateData.assignedToId = input.assignedToId;
    }

    if (input.followUpType) updateData.followUpType = input.followUpType;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.dueDate) updateData.dueDate = new Date(input.dueDate);
    if (input.reminderDate)
      updateData.reminderDate = new Date(input.reminderDate);
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.status) {
      updateData.status = input.status;
      // Set completedDate when status changes to COMPLETED
      if (
        input.status === FollowUpStatus.COMPLETED &&
        !existingReminder.completedDate
      ) {
        updateData.completedDate = new Date();
      }
    }

    return this.prisma.followUpReminder.update({
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
        assignedTo: {
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

  async getFollowUpReminders(
    filter: FollowUpReminderFilterInput,
    skip = 0,
    take = 50,
  ): Promise<{ reminders: FollowUpReminder[]; total: number }> {
    const where: any = {
      organisationId: filter.organisationId,
      ...(filter.branchId && { branchId: filter.branchId }),
      ...(filter.memberId && { memberId: filter.memberId }),
      ...(filter.assignedToId && { assignedToId: filter.assignedToId }),
      ...(filter.followUpType && { followUpType: filter.followUpType }),
      ...(filter.status && { status: filter.status }),
    };

    // Date range filtering
    if (filter.startDate || filter.endDate) {
      where.dueDate = {};
      if (filter.startDate) {
        where.dueDate.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.dueDate.lte = new Date(filter.endDate);
      }
    }

    const [reminders, total] = await Promise.all([
      this.prisma.followUpReminder.findMany({
        where,
        skip,
        take,
        orderBy: [
          { status: 'asc' }, // Pending first
          { dueDate: 'asc' }, // Then by due date
        ],
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
          assignedTo: {
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
      this.prisma.followUpReminder.count({ where }),
    ]);

    return { reminders, total };
  }

  async getFollowUpReminderById(
    id: string,
    organisationId: string,
    branchId?: string,
  ): Promise<FollowUpReminder> {
    const reminder = await this.prisma.followUpReminder.findFirst({
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
        assignedTo: {
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

    if (!reminder) {
      throw new NotFoundException(
        'Follow-up reminder not found or access denied',
      );
    }

    return reminder;
  }

  async deleteFollowUpReminder(
    id: string,
    organisationId: string,
    branchId?: string,
  ): Promise<boolean> {
    const reminder = await this.prisma.followUpReminder.findFirst({
      where: {
        id,
        organisationId,
        ...(branchId && { branchId }),
      },
    });

    if (!reminder) {
      throw new NotFoundException(
        'Follow-up reminder not found or access denied',
      );
    }

    await this.prisma.followUpReminder.delete({
      where: { id },
    });

    return true;
  }

  async completeFollowUpReminder(
    id: string,
    notes?: string,
    organisationId?: string,
    branchId?: string,
  ): Promise<FollowUpReminder> {
    const reminder = await this.prisma.followUpReminder.findFirst({
      where: {
        id,
        ...(organisationId && { organisationId }),
        ...(branchId && { branchId }),
      },
    });

    if (!reminder) {
      throw new NotFoundException(
        'Follow-up reminder not found or access denied',
      );
    }

    const updateData: any = {
      status: FollowUpStatus.COMPLETED,
      completedDate: new Date(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    return this.prisma.followUpReminder.update({
      where: { id },
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
        assignedTo: {
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

  async getOverdueReminders(
    organisationId: string,
    branchId?: string,
  ): Promise<FollowUpReminder[]> {
    return this.prisma.followUpReminder.findMany({
      where: {
        organisationId,
        ...(branchId && { branchId }),
        dueDate: {
          lt: new Date(),
        },
        status: FollowUpStatus.PENDING,
      },
      orderBy: { dueDate: 'asc' },
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
        assignedTo: {
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

  async getRemindersByAssignee(
    assignedToId: string,
    organisationId: string,
    branchId?: string,
    status?: FollowUpStatus,
  ): Promise<FollowUpReminder[]> {
    const where: any = {
      assignedToId,
      organisationId,
      ...(branchId && { branchId }),
      ...(status && { status }),
    };

    return this.prisma.followUpReminder.findMany({
      where,
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
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
  }

  async getDueTodayReminders(
    organisationId: string,
    branchId?: string,
  ): Promise<FollowUpReminder[]> {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );

    return this.prisma.followUpReminder.findMany({
      where: {
        organisationId,
        ...(branchId && { branchId }),
        dueDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: FollowUpStatus.PENDING,
      },
      orderBy: { dueDate: 'asc' },
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
        assignedTo: {
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

  async createFollowUpFromRecord(
    recordType: string,
    recordId: string,
    memberId: string,
    assignedToId: string,
    title: string,
    dueDate: Date,
    organisationId: string,
    branchId?: string,
    createdBy?: string,
  ): Promise<FollowUpReminder> {
    return this.prisma.followUpReminder.create({
      data: {
        memberId,
        followUpType: FollowUpType.MEMBER_CONTACT,
        title,
        dueDate,
        assignedToId,
        status: FollowUpStatus.PENDING,
        organisationId,
        branchId,
        createdBy: createdBy || 'system',
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
        assignedTo: {
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

  /**
   * Helper method to create follow-up reminder with individual parameters
   */
  async createFollowUpReminderFromParams(
    memberId: string,
    title: string,
    dueDate: Date,
    assignedToId: string,
    organisationId: string,
    branchId?: string,
    createdBy?: string,
  ): Promise<FollowUpReminder> {
    const input: CreateFollowUpReminderInput = {
      memberId,
      followUpType: FollowUpType.MEMBER_CONTACT,
      title,
      dueDate: dueDate.toISOString(),
      assignedToId,
      organisationId,
      branchId,
    };

    return this.createFollowUpReminder(input, createdBy || 'system');
  }
}
