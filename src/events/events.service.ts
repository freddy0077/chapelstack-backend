import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventInput, RecurrenceType } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import { Event as PrismaEvent, Prisma } from '@prisma/client';
import { WorkflowsService } from '../workflows/services/workflows.service';
import { addDays, addWeeks, addMonths, addYears, isBefore, format } from 'date-fns';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowsService: WorkflowsService,
  ) {}

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

      return event;
    } catch (error) {
      console.error('Prisma create error:', error);
      throw error;
    }
  }

  async createRecurringEvents(input: CreateEventInput): Promise<PrismaEvent[]> {
    console.log('🔥 EventsService.createRecurringEvents START');
    console.log('📥 Service input:', JSON.stringify(input, null, 2));

    if (!input.isRecurring || !input.recurrenceType || !input.recurrenceEndDate) {
      console.error('❌ Service validation failed: Invalid recurring event configuration');
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

    console.log('📊 Extracted data:', {
      recurrenceType,
      recurrenceInterval,
      recurrenceEndDate,
      recurrenceDaysOfWeek,
      baseEventData
    });

    let currentDate = new Date(input.startDate);
    const endDate = new Date(recurrenceEndDate);
    let eventCount = 0;
    const maxEvents = 100; // Safety limit to prevent infinite loops

    console.log('📅 Date range:', {
      startDate: currentDate,
      endDate: endDate,
      maxEvents
    });

    while (isBefore(currentDate, endDate) && eventCount < maxEvents) {
      console.log(`🔄 Processing event ${eventCount + 1}, current date: ${currentDate}`);
      
      // For weekly recurrence with specific days, check if current day matches
      if (recurrenceType === RecurrenceType.WEEKLY && recurrenceDaysOfWeek.length > 0) {
        const dayOfWeek = format(currentDate, 'EEEE').toUpperCase();
        const allowedDaysUppercase = recurrenceDaysOfWeek.map(day => day.toUpperCase());
        console.log(`📆 Weekly check: current day ${dayOfWeek}, allowed days: ${allowedDaysUppercase}`);
        if (!allowedDaysUppercase.includes(dayOfWeek)) {
          currentDate = addDays(currentDate, 1);
          console.log('⏭️ Skipping day, moving to next');
          continue;
        }
        console.log('✅ Day matches! Creating event for this day');
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
          branch: { connect: { id: baseEventData.branchId } }
        }),
        ...(baseEventData.organisationId && {
          organisation: { connect: { id: baseEventData.organisationId } }
        }),
      };

      console.log(`💾 Creating event ${eventCount + 1}:`, JSON.stringify(eventData, null, 2));

      try {
        console.log('🚀 Calling prisma.event.create...');
        const createdEvent = await this.prisma.event.create({ data: eventData });
        console.log('✅ Event created successfully:', createdEvent.id);
        events.push(createdEvent);
        eventCount++;

        // Trigger workflow automation for each event
        if (baseEventData.organisationId && baseEventData.branchId) {
          try {
            console.log('🔄 Triggering workflow automation...');
            await this.workflowsService.handleEventCreated(
              createdEvent.id,
              baseEventData.organisationId,
              baseEventData.branchId,
            );
            console.log('✅ Workflow triggered successfully');
          } catch (error) {
            console.warn(`⚠️ Failed to trigger event created workflow for event ${createdEvent.id}: ${error.message}`);
          }
        }
      } catch (error) {
        console.error(`💥 Failed to create recurring event occurrence:`, error);
        console.error('📋 Event data that failed:', JSON.stringify(eventData, null, 2));
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

    console.log(`🎉 FINAL RESULT: Created ${events.length} recurring events`);
    console.log('📋 Event IDs created:', events.map(e => e.id));
    return events;
  }

  async findAll({
    branchId,
    organisationId,
  }: {
    branchId?: string;
    organisationId?: string;
  }): Promise<PrismaEvent[]> {
    const where: Prisma.EventWhereInput = {};
    if (branchId) {
      where.branchId = branchId;
    }
    if (organisationId) {
      where.organisationId = organisationId;
    }
    return this.prisma.event.findMany({ where });
  }

  async findOne(id: string): Promise<PrismaEvent> {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, input: UpdateEventInput): Promise<PrismaEvent> {
    try {
      return await this.prisma.event.update({ where: { id }, data: input });
    } catch (error) {
      throw new NotFoundException('Event not found');
    }
  }

  async remove(id: string): Promise<PrismaEvent> {
    try {
      return await this.prisma.event.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException('Event not found');
    }
  }
}
