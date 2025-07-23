import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import { Event as PrismaEvent, Prisma } from '@prisma/client';
import { WorkflowsService } from '../workflows/services/workflows.service';

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
