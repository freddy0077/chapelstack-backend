import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventInput, RecurrenceType } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import {
  CreateEventRegistrationInput,
  UpdateEventRegistrationInput,
  EventRegistrationFilterInput,
} from './dto/event-registration.input';
import {
  CreateEventRSVPInput,
  UpdateEventRSVPInput,
  EventRSVPFilterInput,
} from './dto/event-rsvp.input';
import {
  Event as PrismaEvent,
  EventRegistration,
  EventRSVP,
  Prisma,
} from '@prisma/client';
import { WorkflowsService } from '../workflows/services/workflows.service';
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isBefore,
  format,
} from 'date-fns';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowsService: WorkflowsService,
  ) {}

  // Helper method to convert Prisma Decimal fields to numbers for GraphQL compatibility
  private convertDecimalFields(obj: any): any {
    if (!obj) return obj;

    const converted = { ...obj };

    // Convert Decimal fields to numbers
    if (
      converted.ticketPrice &&
      typeof converted.ticketPrice.toNumber === 'function'
    ) {
      converted.ticketPrice = converted.ticketPrice.toNumber();
    }
    if (
      converted.amountPaid &&
      typeof converted.amountPaid.toNumber === 'function'
    ) {
      converted.amountPaid = converted.amountPaid.toNumber();
    }

    return converted;
  }

  async create(input: CreateEventInput): Promise<PrismaEvent> {
    console.log('EventsService.create received input:', input);
    console.log('Input type:', typeof input);
    console.log('Input constructor:', input?.constructor?.name);
    console.log('Input properties:', Object.getOwnPropertyNames(input || {}));
    console.log('Input title:', input?.title);
    console.log('Input startDate:', input?.startDate);

    // If input is empty or missing title, throw an error
    if (!input || !input.title) {
      throw new Error('Event title is required');
    }

    // Create a clean data object by spreading the input
    const data = { ...input };

    // Remove recurring fields that don't exist in the Prisma Event model
    const recurringFields = [
      'isRecurring',
      'recurrenceType',
      'recurrenceInterval',
      'recurrenceEndDate',
      'recurrenceDaysOfWeek',
      'recurrencePattern',
    ];

    recurringFields.forEach((field) => {
      delete data[field];
    });

    // Remove undefined fields
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    console.log('Data for Prisma after cleaning:', data);
    console.log('Data has title?', Boolean(data.title));

    try {
      // Create the event
      const event = await this.prisma.event.create({ data });

      // Trigger workflow automation for new event
      try {
        await this.workflowsService.handleEventCreated(
          event.id,
          event.organisationId || '',
          event.branchId || undefined,
        );
      } catch (error) {
        console.warn(
          `Failed to trigger event created workflow for event ${event.id}: ${error.message}`,
        );
      }

      return this.convertDecimalFields(event);
    } catch (error) {
      console.error('Prisma create error:', error);
      throw error;
    }
  }

  async createRecurringEvents(input: CreateEventInput): Promise<PrismaEvent[]> {
    console.log(' EventsService.createRecurringEvents START');
    console.log(' Service input:', JSON.stringify(input, null, 2));

    if (
      !input.isRecurring ||
      !input.recurrenceType ||
      !input.recurrenceEndDate
    ) {
      console.error(
        ' Service validation failed: Invalid recurring event configuration',
      );
      throw new Error('Invalid recurring event configuration');
    }

    const events: PrismaEvent[] = [];
    const {
      recurrenceType,
      recurrenceInterval = 1,
      recurrenceEndDate,
      recurrenceDaysOfWeek = [],
      ...baseEventData
    } = input;

    console.log(' Extracted data:', {
      recurrenceType,
      recurrenceInterval,
      recurrenceEndDate,
      recurrenceDaysOfWeek,
      baseEventData,
    });

    let currentDate = new Date(input.startDate);
    const endDate = new Date(recurrenceEndDate);
    let eventCount = 0;
    const maxEvents = 100; // Safety limit to prevent infinite loops

    console.log(' Date range:', {
      startDate: currentDate,
      endDate: endDate,
      maxEvents,
    });

    while (isBefore(currentDate, endDate) && eventCount < maxEvents) {
      console.log(
        ` Processing event ${eventCount + 1}, current date: ${currentDate}`,
      );

      // For weekly recurrence with specific days, check if current day matches
      if (
        recurrenceType === RecurrenceType.WEEKLY &&
        recurrenceDaysOfWeek.length > 0
      ) {
        const dayOfWeek = format(currentDate, 'EEEE').toUpperCase();
        const allowedDaysUppercase = recurrenceDaysOfWeek.map((day) =>
          day.toUpperCase(),
        );
        console.log(
          ` Weekly check: current day ${dayOfWeek}, allowed days: ${allowedDaysUppercase}`,
        );
        if (!allowedDaysUppercase.includes(dayOfWeek)) {
          currentDate = addDays(currentDate, 1);
          console.log(' Skipping day, moving to next');
          continue;
        }
        console.log(' Day matches! Creating event for this day');
      }

      // Calculate end date for this occurrence
      let eventEndDate = input.endDate ? new Date(input.endDate) : undefined;
      if (eventEndDate) {
        const duration = eventEndDate.getTime() - input.startDate.getTime();
        eventEndDate = new Date(currentDate.getTime() + duration);
      }

      // Create event data for this occurrence
      const eventData: Prisma.EventCreateInput = {
        title: baseEventData.title,
        description: baseEventData.description,
        startDate: new Date(currentDate),
        endDate: eventEndDate,
        location: baseEventData.location,
        category: baseEventData.category,
        ...(baseEventData.branchId && {
          branch: { connect: { id: baseEventData.branchId } },
        }),
        ...(baseEventData.organisationId && {
          organisation: { connect: { id: baseEventData.organisationId } },
        }),
      };

      console.log(
        ` Creating event ${eventCount + 1}:`,
        JSON.stringify(eventData, null, 2),
      );

      try {
        console.log(' Calling prisma.event.create...');
        const createdEvent = await this.prisma.event.create({
          data: eventData,
        });
        console.log(' Event created successfully:', createdEvent.id);
        events.push(this.convertDecimalFields(createdEvent));
        eventCount++;

        // Trigger workflow automation for each event
        if (baseEventData.organisationId && baseEventData.branchId) {
          try {
            console.log(' Triggering workflow automation...');
            await this.workflowsService.handleEventCreated(
              createdEvent.id,
              baseEventData.organisationId,
              baseEventData.branchId,
            );
            console.log(' Workflow triggered successfully');
          } catch (error) {
            console.warn(
              ` Failed to trigger event created workflow for event ${createdEvent.id}: ${error.message}`,
            );
          }
        }
      } catch (error) {
        console.error(` Failed to create recurring event occurrence:`, error);
        console.error(
          ' Event data that failed:',
          JSON.stringify(eventData, null, 2),
        );
        break;
      }

      // Calculate next occurrence date
      switch (recurrenceType) {
        case RecurrenceType.DAILY:
          currentDate = addDays(currentDate, recurrenceInterval);
          break;
        case RecurrenceType.WEEKLY:
          if (recurrenceDaysOfWeek.length > 0) {
            // For weekly with specific days, move to next day
            currentDate = addDays(currentDate, 1);
          } else {
            // For weekly without specific days, add weeks
            currentDate = addWeeks(currentDate, recurrenceInterval);
          }
          break;
        case RecurrenceType.MONTHLY:
          currentDate = addMonths(currentDate, recurrenceInterval);
          break;
        case RecurrenceType.YEARLY:
          currentDate = addYears(currentDate, recurrenceInterval);
          break;
        default:
          throw new Error(`Unsupported recurrence type: ${recurrenceType}`);
      }
    }

    console.log(` FINAL RESULT: Created ${events.length} recurring events`);
    console.log(
      ' Event IDs created:',
      events.map((e) => e.id),
    );
    return events;
  }

  async findAll(
    branchId?: string,
    organisationId?: string,
  ): Promise<PrismaEvent[]> {
    const where: any = {};
    if (branchId) {
      where.branchId = branchId;
    }
    if (organisationId) {
      where.organisationId = organisationId;
    }
    const events = await this.prisma.event.findMany({ where });
    return events.map((event) => this.convertDecimalFields(event));
  }

  async findOne(id: string): Promise<PrismaEvent> {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return this.convertDecimalFields(event);
  }

  async update(id: string, input: UpdateEventInput): Promise<PrismaEvent> {
    try {
      const event = await this.prisma.event.update({
        where: { id },
        data: input,
      });
      return this.convertDecimalFields(event);
    } catch (error) {
      throw new NotFoundException('Event not found');
    }
  }

  async remove(id: string): Promise<PrismaEvent> {
    try {
      const event = await this.prisma.event.delete({ where: { id } });
      return this.convertDecimalFields(event);
    } catch (error) {
      throw new NotFoundException('Event not found');
    }
  }

  async findCurrentEvents(branchId: string): Promise<PrismaEvent[]> {
    const now = new Date();

    const events = await this.prisma.event.findMany({
      where: {
        branchId,
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
    });
    return events.map((event) => this.convertDecimalFields(event));
  }

  // ===================================
  // EVENT REGISTRATION METHODS
  // ===================================

  async createEventRegistration(
    input: CreateEventRegistrationInput,
    createdBy?: string,
  ): Promise<EventRegistration> {
    // Verify event exists and is open for registration
    const event = await this.prisma.event.findUnique({
      where: { id: input.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.registrationRequired) {
      throw new Error('This event does not require registration');
    }

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new Error('Registration deadline has passed');
    }

    // Check capacity if set
    if (event.capacity) {
      const currentRegistrations = await this.prisma.eventRegistration.count({
        where: {
          eventId: input.eventId,
          status: { in: ['ATTENDING', 'PENDING'] },
        },
      });

      if (currentRegistrations >= event.capacity) {
        throw new Error('Event is at full capacity');
      }
    }

    // Check for duplicate registration
    const existingRegistration = await this.prisma.eventRegistration.findFirst({
      where: {
        eventId: input.eventId,
        OR: [{ memberId: input.memberId }, { guestEmail: input.guestEmail }],
      },
    });

    if (existingRegistration) {
      throw new Error('Registration already exists for this event');
    }

    return this.prisma.eventRegistration
      .create({
        data: {
          ...input,
          createdBy,
        },
        include: {
          event: true,
          member: true,
        },
      })
      .then((registration) => this.convertDecimalFields(registration));
  }

  async updateEventRegistration(
    input: UpdateEventRegistrationInput,
    updatedBy?: string,
  ): Promise<EventRegistration> {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id: input.id },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const { id, ...updateData } = input;

    return this.prisma.eventRegistration
      .update({
        where: { id },
        data: {
          ...updateData,
          updatedBy,
        },
        include: {
          event: true,
          member: true,
        },
      })
      .then((registration) => this.convertDecimalFields(registration));
  }

  async findEventRegistrations(
    filter: EventRegistrationFilterInput,
    skip?: number,
    take?: number,
  ): Promise<EventRegistration[]> {
    const where: Prisma.EventRegistrationWhereInput = {};

    if (filter.eventId) where.eventId = filter.eventId;
    if (filter.memberId) where.memberId = filter.memberId;
    if (filter.status) where.status = filter.status;
    if (filter.paymentStatus) where.paymentStatus = filter.paymentStatus;
    if (filter.approvalStatus) where.approvalStatus = filter.approvalStatus;

    // Add organization/branch filtering through event relation
    if (filter.organisationId || filter.branchId) {
      where.event = {};
      if (filter.organisationId)
        where.event.organisationId = filter.organisationId;
      if (filter.branchId) where.event.branchId = filter.branchId;
    }

    return this.prisma.eventRegistration
      .findMany({
        where,
        skip,
        take,
        include: {
          event: true,
          member: true,
        },
        orderBy: { registrationDate: 'desc' },
      })
      .then((registrations) =>
        registrations.map((reg) => this.convertDecimalFields(reg)),
      );
  }

  async deleteEventRegistration(id: string): Promise<boolean> {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    await this.prisma.eventRegistration.delete({
      where: { id },
    });

    return true;
  }

  // ===================================
  // EVENT RSVP METHODS
  // ===================================

  async createEventRSVP(
    input: CreateEventRSVPInput,
    createdBy?: string,
  ): Promise<EventRSVP> {
    // Verify event exists
    const event = await this.prisma.event.findUnique({
      where: { id: input.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check for duplicate RSVP
    const existingRSVP = await this.prisma.eventRSVP.findFirst({
      where: {
        eventId: input.eventId,
        OR: [{ memberId: input.memberId }, { guestEmail: input.guestEmail }],
      },
    });

    if (existingRSVP) {
      throw new Error('RSVP already exists for this event');
    }

    return this.prisma.eventRSVP
      .create({
        data: {
          ...input,
          createdBy,
        },
        include: {
          event: true,
          member: true,
        },
      })
      .then((rsvp) => this.convertDecimalFields(rsvp));
  }

  async updateEventRSVP(
    input: UpdateEventRSVPInput,
    updatedBy?: string,
  ): Promise<EventRSVP> {
    const rsvp = await this.prisma.eventRSVP.findUnique({
      where: { id: input.id },
    });

    if (!rsvp) {
      throw new NotFoundException('RSVP not found');
    }

    const { id, ...updateData } = input;

    return this.prisma.eventRSVP
      .update({
        where: { id },
        data: {
          ...updateData,
          updatedBy,
        },
        include: {
          event: true,
          member: true,
        },
      })
      .then((rsvp) => this.convertDecimalFields(rsvp));
  }

  async findEventRSVPs(
    filter: EventRSVPFilterInput,
    skip?: number,
    take?: number,
  ): Promise<EventRSVP[]> {
    const where: Prisma.EventRSVPWhereInput = {};

    if (filter.eventId) where.eventId = filter.eventId;
    if (filter.memberId) where.memberId = filter.memberId;
    if (filter.status) where.status = filter.status;

    // Add organization/branch filtering through event relation
    if (filter.organisationId || filter.branchId) {
      where.event = {};
      if (filter.organisationId)
        where.event.organisationId = filter.organisationId;
      if (filter.branchId) where.event.branchId = filter.branchId;
    }

    return this.prisma.eventRSVP
      .findMany({
        where,
        skip,
        take,
        include: {
          event: true,
          member: true,
        },
        orderBy: { responseDate: 'desc' },
      })
      .then((rsvps) => rsvps.map((rsvp) => this.convertDecimalFields(rsvp)));
  }

  async deleteEventRSVP(id: string): Promise<boolean> {
    const rsvp = await this.prisma.eventRSVP.findUnique({
      where: { id },
    });

    if (!rsvp) {
      throw new NotFoundException('RSVP not found');
    }

    await this.prisma.eventRSVP.delete({
      where: { id },
    });

    return true;
  }

  // ===================================
  // EVENT ANALYTICS AND STATS
  // ===================================

  async getEventStats(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const [registrationStats, rsvpStats] = await Promise.all([
      this.prisma.eventRegistration.groupBy({
        by: ['status'],
        where: { eventId },
        _count: { status: true },
      }),
      this.prisma.eventRSVP.groupBy({
        by: ['status'],
        where: { eventId },
        _count: { status: true },
      }),
    ]);

    const totalRegistrations = await this.prisma.eventRegistration.count({
      where: { eventId },
    });

    const totalRSVPs = await this.prisma.eventRSVP.count({
      where: { eventId },
    });

    const attendingCount = [
      ...registrationStats.filter((s) => s.status === 'ATTENDING'),
      ...rsvpStats.filter((s) => s.status === 'ATTENDING'),
    ].reduce((sum, stat) => sum + stat._count.status, 0);

    return {
      event: this.convertDecimalFields(event),
      totalRegistrations,
      totalRSVPs,
      attendingCount,
      registrationStats,
      rsvpStats,
      capacityUtilization: event.capacity
        ? (attendingCount / event.capacity) * 100
        : null,
    };
  }
}
