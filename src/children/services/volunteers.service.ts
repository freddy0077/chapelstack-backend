import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VolunteerScheduleItem } from '../dto/volunteer-schedule.dto';
import { ChildrenMinistryVolunteer } from '../entities/children-ministry-volunteer.entity';
import { CreateVolunteerInput } from '../dto/create-volunteer.input';
import { UpdateVolunteerInput } from '../dto/update-volunteer.input';

@Injectable()
export class VolunteersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createVolunteerInput: CreateVolunteerInput,
  ): Promise<ChildrenMinistryVolunteer> {
    // Check if member exists
    const member = await this.prisma.member.findUnique({
      where: { id: createVolunteerInput.memberId },
    });

    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createVolunteerInput.memberId} not found`,
      );
    }

    return this.prisma.childrenMinistryVolunteer.create({
      data: {
        ...createVolunteerInput,
      },
    });
  }

  async findAll(
    branchId?: string,
    isActive?: boolean,
  ): Promise<ChildrenMinistryVolunteer[]> {
    const where: any = {};

    if (branchId) {
      where.branchId = branchId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.childrenMinistryVolunteer.findMany({
      where,
      include: {
        member: true,
      },
      orderBy: { member: { lastName: 'asc' } },
    });
  }

  async findOne(id: string): Promise<ChildrenMinistryVolunteer> {
    const volunteer = await this.prisma.childrenMinistryVolunteer.findUnique({
      where: { id },
      include: {
        member: true,
        eventAssignments: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!volunteer) {
      throw new NotFoundException(`Volunteer with ID ${id} not found`);
    }

    return volunteer;
  }

  async update(
    id: string,
    updateVolunteerInput: UpdateVolunteerInput,
  ): Promise<ChildrenMinistryVolunteer> {
    // First check if the volunteer exists
    await this.findOne(id);

    return this.prisma.childrenMinistryVolunteer.update({
      where: { id },
      data: {
        ...updateVolunteerInput,
      },
    });
  }

  async remove(id: string): Promise<ChildrenMinistryVolunteer> {
    // First check if the volunteer exists
    await this.findOne(id);

    return this.prisma.childrenMinistryVolunteer.delete({
      where: { id },
    });
  }

  async findByMember(
    memberId: string,
  ): Promise<ChildrenMinistryVolunteer | null> {
    return this.prisma.childrenMinistryVolunteer.findFirst({
      where: { memberId },
      include: {
        member: true,
      },
    });
  }

  async findByEvent(eventId: string): Promise<ChildrenMinistryVolunteer[]> {
    return this.prisma.childrenMinistryVolunteer.findMany({
      where: {
        eventAssignments: {
          some: {
            eventId,
          },
        },
      },
      include: {
        member: true,
        eventAssignments: {
          where: {
            eventId,
          },
        },
      },
    });
  }

  async updateBackgroundCheck(
    id: string,
    backgroundCheckDate: Date,
    backgroundCheckStatus: string,
  ): Promise<ChildrenMinistryVolunteer> {
    // First check if the volunteer exists
    await this.findOne(id);

    return this.prisma.childrenMinistryVolunteer.update({
      where: { id },
      data: {
        backgroundCheckDate,
        backgroundCheckStatus,
      },
    });
  }

  async updateTrainingCompletion(
    id: string,
    trainingCompletionDate: Date,
  ): Promise<ChildrenMinistryVolunteer> {
    // First check if the volunteer exists
    await this.findOne(id);

    return this.prisma.childrenMinistryVolunteer.update({
      where: { id },
      data: {
        trainingCompletionDate,
      },
    });
  }

  async getVolunteerSchedule(
    id: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<VolunteerScheduleItem[]> {
    // First check if the volunteer exists
    await this.findOne(id);

    const where: any = {
      volunteerId: id,
    };

    if (startDate || endDate) {
      where.event = {};

      if (startDate) {
        where.event.startDateTime = { gte: startDate };
      }

      if (endDate) {
        where.event.startDateTime = {
          ...(where.event.startDateTime || {}),
          lte: endDate,
        };
      }
    }

    const assignments = await this.prisma.volunteerEventAssignment.findMany({
      where,
      include: {
        event: true,
      },
      orderBy: {
        event: {
          startDateTime: 'asc',
        },
      },
    });

    return assignments.map((assignment) => ({
      assignment,
      event: assignment.event,
    }));
  }
}
