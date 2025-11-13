import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ValidationPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import { AddEventNotesInput } from './dto/add-event-notes.input';
import { Event as PrismaEvent } from '@prisma/client';
import { Branch } from '../branches/entities/branch.entity';
import { BranchesService } from '../branches/branches.service';
import { EventRegistration } from './entities/event-registration.entity';
import { EventRSVP } from './entities/event-rsvp.entity';
import { EventStatistics } from './entities/event-statistics.entity';
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
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Event)
export class EventsResolver {
  constructor(
    private readonly eventsService: EventsService,
    private readonly branchesService: BranchesService,
  ) {}

  @Mutation(() => Event)
  @RequirePermissions({ action: 'create', subject: 'Event' })
  async createEvent(
    @Args('createEventInput') createEventInput: CreateEventInput,
    @CurrentUser() user: any,
  ): Promise<Event> {
    const result = await this.eventsService.create(createEventInput);
    return result as Event;
  }

  @Mutation(() => [Event])
  @RequirePermissions({ action: 'create', subject: 'Event' })
  async createRecurringEvent(
    @Args('createEventInput') createEventInput: CreateEventInput,
    @CurrentUser() user: any,
  ): Promise<Event[]> {
    const results =
      await this.eventsService.createRecurringEvents(createEventInput);
    return results as Event[];
  }

  @Query(() => [Event], { name: 'events' })
  @RequirePermissions({ action: 'read', subject: 'Event' })
  async findAll(
    @Args('branchId', { type: () => String, nullable: true }) branchId?: string,
    @Args('organisationId', { type: () => String, nullable: true })
    organisationId?: string,
  ): Promise<Event[]> {
    const results = await this.eventsService.findAll(branchId, organisationId);
    return results as Event[];
  }

  @Query(() => Event, { name: 'event' })
  @RequirePermissions({ action: 'read', subject: 'Event' })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Event> {
    const result = await this.eventsService.findOne(id);
    return result as Event;
  }

  @Mutation(() => Event)
  @RequirePermissions({ action: 'update', subject: 'Event' })
  async updateEvent(
    @Args('updateEventInput') updateEventInput: UpdateEventInput,
    @CurrentUser() user: any,
  ): Promise<Event> {
    const result = await this.eventsService.update(
      updateEventInput.id,
      updateEventInput,
    );
    return result as Event;
  }

  @Mutation(() => Boolean)
  @RequirePermissions({ action: 'delete', subject: 'Event' })
  async removeEvent(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.eventsService.remove(id);
    return true;
  }

  @Mutation(() => Event)
  @RequirePermissions({ action: 'update', subject: 'Event' })
  async addEventNotes(
    @Args('addEventNotesInput') addEventNotesInput: AddEventNotesInput,
    @CurrentUser() user: any,
  ): Promise<Event> {
    // Pass user ID if available, otherwise let service handle fallback
    const userId = user?.id || undefined;

    const result = await this.eventsService.addEventNotes(
      addEventNotesInput,
      userId,
    );
    return result as Event;
  }

  @ResolveField('branch', () => Branch, { nullable: true })
  async branch(@Parent() event: Event): Promise<Branch | null> {
    if (!event.branchId) return null;
    return this.branchesService.findOne(event.branchId);
  }

  // ===================================
  // EVENT REGISTRATION RESOLVERS
  // ===================================

  @Mutation(() => EventRegistration)
  async createEventRegistration(
    @Args('createEventRegistrationInput')
    createEventRegistrationInput: CreateEventRegistrationInput,
  ): Promise<EventRegistration> {
    const result = await this.eventsService.createEventRegistration(
      createEventRegistrationInput,
    );
    return result as EventRegistration;
  }

  @Mutation(() => EventRegistration)
  async updateEventRegistration(
    @Args('updateEventRegistrationInput')
    updateEventRegistrationInput: UpdateEventRegistrationInput,
  ): Promise<EventRegistration> {
    const result = await this.eventsService.updateEventRegistration(
      updateEventRegistrationInput,
    );
    return result as EventRegistration;
  }

  @Query(() => [EventRegistration], { name: 'eventRegistrations' })
  async findEventRegistrations(
    @Args('filter') filter: EventRegistrationFilterInput,
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
  ): Promise<EventRegistration[]> {
    const results = await this.eventsService.findEventRegistrations(
      filter,
      skip,
      take,
    );
    return results as EventRegistration[];
  }

  @Mutation(() => Boolean)
  async removeEventRegistration(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.eventsService.deleteEventRegistration(id);
    return true;
  }

  /**
   * Verify Paystack payment and create event registration
   * SECURE: Backend verifies payment reference before creating registration
   */
  @Mutation(() => EventRegistration)
  async verifyAndRegisterForEvent(
    @Args('paymentReference') paymentReference: string,
    @Args('eventId') eventId: string,
    @Args('guestName') guestName: string,
    @Args('guestEmail') guestEmail: string,
    @Args('guestPhone', { nullable: true }) guestPhone?: string,
    @Args('numberOfGuests', { type: () => Int, nullable: true }) numberOfGuests?: number,
    @Args('specialRequests', { nullable: true }) specialRequests?: string,
    @Args('memberId', { nullable: true }) memberId?: string,
  ): Promise<EventRegistration> {
    const result = await this.eventsService.verifyAndRegisterForEvent(
      paymentReference,
      eventId,
      {
        guestName,
        guestEmail,
        guestPhone,
        numberOfGuests,
        specialRequests,
        memberId,
      },
      'guest', // userId for guest registrations
    );
    return result as EventRegistration;
  }

  /**
   * Register for free event (no payment required)
   */
  @Mutation(() => EventRegistration)
  async registerForFreeEvent(
    @Args('eventId') eventId: string,
    @Args('guestName') guestName: string,
    @Args('guestEmail') guestEmail: string,
    @Args('guestPhone', { nullable: true }) guestPhone?: string,
    @Args('numberOfGuests', { type: () => Int, nullable: true }) numberOfGuests?: number,
    @Args('specialRequests', { nullable: true }) specialRequests?: string,
    @Args('memberId', { nullable: true }) memberId?: string,
  ): Promise<EventRegistration> {
    const result = await this.eventsService.registerForFreeEvent(
      eventId,
      {
        guestName,
        guestEmail,
        guestPhone,
        numberOfGuests,
        specialRequests,
        memberId,
      },
      'guest',
    );
    return result as EventRegistration;
  }

  // ===================================
  // EVENT RSVP RESOLVERS
  // ===================================

  @Mutation(() => EventRSVP)
  async createEventRSVP(
    @Args('createEventRSVPInput') createEventRSVPInput: CreateEventRSVPInput,
  ): Promise<EventRSVP> {
    const result =
      await this.eventsService.createEventRSVP(createEventRSVPInput);
    return result as EventRSVP;
  }

  @Mutation(() => EventRSVP)
  async updateEventRSVP(
    @Args('updateEventRSVPInput') updateEventRSVPInput: UpdateEventRSVPInput,
  ): Promise<EventRSVP> {
    const result =
      await this.eventsService.updateEventRSVP(updateEventRSVPInput);
    return result as EventRSVP;
  }

  @Query(() => [EventRSVP], { name: 'eventRSVPs' })
  async findEventRSVPs(
    @Args('filter') filter: EventRSVPFilterInput,
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
  ): Promise<EventRSVP[]> {
    const results = await this.eventsService.findEventRSVPs(filter, skip, take);
    return results as EventRSVP[];
  }

  @Mutation(() => Boolean)
  async removeEventRSVP(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.eventsService.deleteEventRSVP(id);
    return true;
  }

  // Event Statistics and Dashboard Queries
  @Query(() => EventStatistics)
  async eventStatistics(
    @Args('days', { type: () => Int, nullable: true }) days?: number,
  ): Promise<EventStatistics> {
    return this.eventsService.getEventStatistics(days);
  }

  @Query(() => [EventRegistration])
  async recentRegistrations(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<EventRegistration[]> {
    const results = await this.eventsService.getRecentRegistrations(limit);
    return results as EventRegistration[];
  }

  // Approval Workflow Mutations
  @Mutation(() => EventRegistration)
  @RequirePermissions({ action: 'update', subject: 'EventRegistration' })
  async approveRegistration(
    @Args('id', { type: () => ID }) id: string,
    @Args('notes', { nullable: true }) notes?: string,
    @CurrentUser() user?: any,
  ): Promise<EventRegistration> {
    const result = await this.eventsService.approveRegistration(
      id,
      user?.id,
      notes,
    );
    return result as EventRegistration;
  }

  @Mutation(() => EventRegistration)
  @RequirePermissions({ action: 'update', subject: 'EventRegistration' })
  async rejectRegistration(
    @Args('id', { type: () => ID }) id: string,
    @Args('reason') reason: string,
    @CurrentUser() user?: any,
  ): Promise<EventRegistration> {
    const result = await this.eventsService.rejectRegistration(
      id,
      reason,
      user?.id,
    );
    return result as EventRegistration;
  }
}
