import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventAttendanceOutput } from '../dto/event-attendance.dto';
import { ChildrenEvent } from '../entities/children-event.entity';
import { CreateChildrenEventInput } from '../dto/create-children-event.input';
import { UpdateChildrenEventInput } from '../dto/update-children-event.input';
import { CreateVolunteerAssignmentInput } from '../dto/create-volunteer-assignment.input';
import { VolunteerEventAssignment } from '../entities/volunteer-event-assignment.entity';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createEventInput: CreateChildrenEventInput,
  ): Promise<ChildrenEvent> {
    return this.prisma.childrenEvent.create({
      data: {
        ...createEventInput,
      },
    });
  }

  async findAll(branchId?: string): Promise<ChildrenEvent[]> {
    const where = branchId ? { branchId } : {};

    return this.prisma.childrenEvent.findMany({
      where,
      orderBy: { startDateTime: 'desc' },
    });
  }

  async findOne(id: string): Promise<ChildrenEvent> {
    const event = await this.prisma.childrenEvent.findUnique({
      where: { id },
      include: {
        volunteerAssignments: {
          include: {
            volunteer: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(
    id: string,
    updateEventInput: UpdateChildrenEventInput,
  ): Promise<ChildrenEvent> {
    // First check if the event exists
    await this.findOne(id);

    return this.prisma.childrenEvent.update({
      where: { id },
      data: {
        ...updateEventInput,
      },
    });
  }

  async remove(id: string): Promise<ChildrenEvent> {
    // First check if the event exists
    await this.findOne(id);

    return this.prisma.childrenEvent.delete({
      where: { id },
    });
  }

  async findUpcomingEvents(branchId: string): Promise<ChildrenEvent[]> {
    const now = new Date();

    return this.prisma.childrenEvent.findMany({
      where: {
        branchId,
        startDateTime: {
          gte: now,
        },
      },
      orderBy: { startDateTime: 'asc' },
    });
  }

  async findPastEvents(branchId: string): Promise<ChildrenEvent[]> {
    const now = new Date();

    return this.prisma.childrenEvent.findMany({
      where: {
        branchId,
        endDateTime: {
          lt: now,
        },
      },
      orderBy: { startDateTime: 'desc' },
    });
  }

  async findCurrentEvents(branchId: string): Promise<ChildrenEvent[]> {
    const now = new Date();

    return this.prisma.childrenEvent.findMany({
      where: {
        branchId,
        startDateTime: {
          lte: now,
        },
        endDateTime: {
          gte: now,
        },
      },
    });
  }

  async assignVolunteerToEvent(
    input: CreateVolunteerAssignmentInput,
  ): Promise<VolunteerEventAssignment> {
    // Check if volunteer exists
    const volunteer = await this.prisma.childrenMinistryVolunteer.findUnique({
      where: { id: input.volunteerId },
    });

    if (!volunteer) {
      throw new NotFoundException(
        `Volunteer with ID ${input.volunteerId} not found`,
      );
    }

    // Check if event exists
    const event = await this.prisma.childrenEvent.findUnique({
      where: { id: input.eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${input.eventId} not found`);
    }

    // Check if assignment already exists
    const existingAssignment =
      await this.prisma.volunteerEventAssignment.findFirst({
        where: {
          volunteerId: input.volunteerId,
          eventId: input.eventId,
        },
      });

    if (existingAssignment) {
      return this.prisma.volunteerEventAssignment.update({
        where: { id: existingAssignment.id },
        data: { role: input.role },
      });
    }

    return this.prisma.volunteerEventAssignment.create({
      data: input,
    });
  }

  async removeVolunteerFromEvent(
    volunteerId: string,
    eventId: string,
  ): Promise<boolean> {
    const assignment = await this.prisma.volunteerEventAssignment.findFirst({
      where: {
        volunteerId,
        eventId,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment for volunteer ${volunteerId} and event ${eventId} not found`,
      );
    }

    await this.prisma.volunteerEventAssignment.delete({
      where: { id: assignment.id },
    });

    return true;
  }

  async getEventAttendance(eventId: string): Promise<EventAttendanceOutput> {
    const event = await this.prisma.childrenEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const checkIns = await this.prisma.checkInRecord.findMany({
      where: { eventId },
      include: {
        child: true,
        checkedInBy: true,
        checkedOutBy: true,
      },
    });

    const totalCheckedIn = checkIns.length;
    const totalCheckedOut = checkIns.filter(
      (record) => record.checkedOutAt,
    ).length;

    return {
      event,
      checkIns,
      stats: {
        totalCheckedIn,
        totalCheckedOut,
        currentlyPresent: totalCheckedIn - totalCheckedOut,
      },
    };
  }
}
