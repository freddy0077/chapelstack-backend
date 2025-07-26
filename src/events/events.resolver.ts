import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ValidationPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import { Event as PrismaEvent } from '@prisma/client';
import { Branch } from '../branches/entities/branch.entity';
import { BranchesService } from '../branches/branches.service';

@Resolver(() => Event)
export class EventsResolver {
  constructor(
    private readonly eventsService: EventsService,
    private readonly branchesService: BranchesService,
  ) {}

  // Map Prisma event (with nulls) to GraphQL Event (with undefined)
  private toGraphQLEvent(prismaEvent: PrismaEvent | null): Event {
    if (!prismaEvent) {
      throw new Error('Event not found');
    }
    return {
      ...prismaEvent,
      description: prismaEvent.description ?? undefined,
      endDate: prismaEvent.endDate ?? undefined,
      location: prismaEvent.location ?? undefined,
      category: prismaEvent.category ?? undefined,
      branchId: prismaEvent.branchId ?? undefined,
      organisationId: prismaEvent.organisationId ?? undefined,
      createdBy: prismaEvent.createdBy ?? undefined,
      updatedBy: prismaEvent.updatedBy ?? undefined,
    };
  }

  @Mutation(() => Event)
  async createEvent(
    @Args(
      'input',
      { type: () => CreateEventInput },
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    input: CreateEventInput,
  ): Promise<Event> {
    console.log('EventsResolver.createEvent received input:', input);
    console.log('Input type:', typeof input);
    console.log('Input has title:', input?.title);
    console.log('Input has startDate:', input?.startDate);
    console.log(
      'Input startDate type:',
      input?.startDate ? typeof input.startDate : 'N/A',
    );
    console.log('Input keys:', Object.keys(input || {}));

    // Ensure we have a valid input with required fields
    if (!input || !input.title) {
      console.error('Input validation failed: Missing title');
      throw new Error('Event title is required');
    }

    // Ensure dates are properly converted to Date objects
    if (input.startDate && typeof input.startDate === 'string') {
      input.startDate = new Date(input.startDate);
    }

    if (input.endDate && typeof input.endDate === 'string') {
      input.endDate = new Date(input.endDate);
    }

    const createdEvent = await this.eventsService.create(input);
    return this.toGraphQLEvent(createdEvent);
  }

  @Mutation(() => [Event])
  async createRecurringEvent(
    @Args(
      'input',
      { type: () => CreateEventInput },
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    input: CreateEventInput,
  ): Promise<Event[]> {
    console.log('🔥 EventsResolver.createRecurringEvent START');
    console.log('📥 Input received:', JSON.stringify(input, null, 2));

    // Ensure we have a valid input with required fields
    if (!input || !input.title) {
      console.error('❌ Input validation failed: Missing title');
      throw new Error('Event title is required');
    }

    if (!input.isRecurring) {
      console.log('📝 Creating single event (isRecurring = false)');
      // If not recurring, create single event
      const createdEvent = await this.eventsService.create(input);
      const result = [this.toGraphQLEvent(createdEvent)];
      console.log('✅ Single event created:', result);
      return result;
    }

    // Validate recurring event fields
    if (!input.recurrenceType || !input.recurrenceEndDate) {
      console.error('❌ Recurring validation failed: Missing recurrenceType or recurrenceEndDate');
      throw new Error('Recurrence type and end date are required for recurring events');
    }

    console.log('🔄 Creating recurring events...');
    console.log('📅 Recurrence details:', {
      type: input.recurrenceType,
      interval: input.recurrenceInterval,
      endDate: input.recurrenceEndDate,
      daysOfWeek: input.recurrenceDaysOfWeek
    });

    // Ensure dates are properly converted to Date objects
    if (input.startDate && typeof input.startDate === 'string') {
      console.log('🔧 Converting startDate from string to Date');
      input.startDate = new Date(input.startDate);
    }

    if (input.endDate && typeof input.endDate === 'string') {
      console.log('🔧 Converting endDate from string to Date');
      input.endDate = new Date(input.endDate);
    }

    if (input.recurrenceEndDate && typeof input.recurrenceEndDate === 'string') {
      console.log('🔧 Converting recurrenceEndDate from string to Date');
      input.recurrenceEndDate = new Date(input.recurrenceEndDate);
    }

    try {
      console.log('🚀 Calling eventsService.createRecurringEvents...');
      const createdEvents = await this.eventsService.createRecurringEvents(input);
      console.log(`✅ Created ${createdEvents.length} recurring events`);
      
      const result = createdEvents.map(event => this.toGraphQLEvent(event));
      console.log('📤 Returning GraphQL events:', result.length);
      return result;
    } catch (error) {
      console.error('💥 Error in createRecurringEvents:', error);
      throw error;
    }
  }

  @Query(() => [Event], { name: 'events' })
  async findAll(
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('organisationId', { nullable: true }) organisationId?: string,
  ): Promise<Event[]> {
    const events = await this.eventsService.findAll({
      branchId,
      organisationId,
    });
    return events.map((event) => this.toGraphQLEvent(event));
  }

  @Query(() => Event, { name: 'event' })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Event> {
    const event = await this.eventsService.findOne(id);
    return this.toGraphQLEvent(event);
  }

  @Mutation(() => Event)
  async updateEvent(
    @Args(
      'input',
      { type: () => UpdateEventInput },
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    input: UpdateEventInput,
  ): Promise<Event> {
    console.log('EventsResolver.updateEvent received input:', input);

    // Ensure dates are properly converted to Date objects
    if (input.startDate && typeof input.startDate === 'string') {
      input.startDate = new Date(input.startDate);
    }

    if (input.endDate && typeof input.endDate === 'string') {
      input.endDate = new Date(input.endDate);
    }

    const updated = await this.eventsService.update(input.id, input);
    return this.toGraphQLEvent(updated);
  }

  @Mutation(() => Event)
  async removeEvent(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Event> {
    const removed = await this.eventsService.remove(id);
    return this.toGraphQLEvent(removed);
  }

  @ResolveField('branch', () => Branch, { nullable: true })
  async branch(@Parent() event: Event): Promise<Branch | null> {
    if (!event.branchId) return null;
    return this.branchesService.findOne(event.branchId);
  }
}
