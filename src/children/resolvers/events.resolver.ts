import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { EventsService } from '../services/events.service';
import { VolunteersService } from '../services/volunteers.service';
import { ChildrenEvent } from '../entities/children-event.entity';
import { CreateChildrenEventInput } from '../dto/create-children-event.input';
import { UpdateChildrenEventInput } from '../dto/update-children-event.input';
import { CreateVolunteerAssignmentInput } from '../dto/create-volunteer-assignment.input';
import { VolunteerEventAssignment } from '../entities/volunteer-event-assignment.entity';
import { ChildrenMinistryVolunteer } from '../entities/children-ministry-volunteer.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { EventAttendanceOutput } from '../dto/event-attendance.dto';

@Resolver(() => ChildrenEvent)
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class EventsResolver {
  constructor(
    private readonly eventsService: EventsService,
    private readonly volunteersService: VolunteersService,
  ) {}

  @Mutation(() => ChildrenEvent)
  @RequirePermissions({ action: 'create', subject: 'ChildrenEvent' })
  createChildrenEvent(
    @Args('input') createEventInput: CreateChildrenEventInput,
  ): Promise<ChildrenEvent> {
    return this.eventsService.create(createEventInput);
  }

  @Query(() => [ChildrenEvent], { name: 'childrenEvents' })
  @RequirePermissions({ action: 'read', subject: 'ChildrenEvent' })
  findAll(
    @Args('branchId', { nullable: true }) branchId?: string,
  ): Promise<ChildrenEvent[]> {
    return this.eventsService.findAll(branchId);
  }

  @Query(() => ChildrenEvent, { name: 'childrenEvent' })
  @RequirePermissions({ action: 'read', subject: 'ChildrenEvent' })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<ChildrenEvent> {
    return this.eventsService.findOne(id);
  }

  @Query(() => [ChildrenEvent], { name: 'upcomingChildrenEvents' })
  @RequirePermissions({ action: 'read', subject: 'ChildrenEvent' })
  findUpcomingEvents(
    @Args('branchId') branchId: string,
  ): Promise<ChildrenEvent[]> {
    return this.eventsService.findUpcomingEvents(branchId);
  }

  @Query(() => [ChildrenEvent], { name: 'pastChildrenEvents' })
  @RequirePermissions({ action: 'read', subject: 'ChildrenEvent' })
  findPastEvents(@Args('branchId') branchId: string): Promise<ChildrenEvent[]> {
    return this.eventsService.findPastEvents(branchId);
  }

  @Query(() => [ChildrenEvent], { name: 'currentChildrenEvents' })
  @RequirePermissions({ action: 'read', subject: 'ChildrenEvent' })
  findCurrentEvents(
    @Args('branchId') branchId: string,
  ): Promise<ChildrenEvent[]> {
    return this.eventsService.findCurrentEvents(branchId);
  }

  @Mutation(() => ChildrenEvent)
  @RequirePermissions({ action: 'update', subject: 'ChildrenEvent' })
  updateChildrenEvent(
    @Args('input') updateEventInput: UpdateChildrenEventInput,
  ): Promise<ChildrenEvent> {
    return this.eventsService.update(updateEventInput.id, updateEventInput);
  }

  @Mutation(() => ChildrenEvent)
  @RequirePermissions({ action: 'delete', subject: 'ChildrenEvent' })
  removeChildrenEvent(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ChildrenEvent> {
    return this.eventsService.remove(id);
  }

  @Mutation(() => VolunteerEventAssignment)
  @RequirePermissions({ action: 'create', subject: 'VolunteerEventAssignment' })
  assignVolunteerToEvent(
    @Args('input') input: CreateVolunteerAssignmentInput,
  ): Promise<VolunteerEventAssignment> {
    return this.eventsService.assignVolunteerToEvent(input);
  }

  @Mutation(() => Boolean)
  @RequirePermissions({ action: 'delete', subject: 'VolunteerEventAssignment' })
  removeVolunteerFromEvent(
    @Args('volunteerId', { type: () => ID }) volunteerId: string,
    @Args('eventId', { type: () => ID }) eventId: string,
  ): Promise<boolean> {
    return this.eventsService.removeVolunteerFromEvent(volunteerId, eventId);
  }

  @Query(() => EventAttendanceOutput, { name: 'eventAttendance' })
  @RequirePermissions({ action: 'read', subject: 'CheckInRecord' })
  getEventAttendance(
    @Args('eventId', { type: () => ID }) eventId: string,
  ): Promise<EventAttendanceOutput> {
    return this.eventsService.getEventAttendance(eventId);
  }

  @ResolveField('volunteers', () => [ChildrenMinistryVolunteer])
  async getVolunteers(
    @Parent() event: ChildrenEvent,
  ): Promise<ChildrenMinistryVolunteer[]> {
    return this.volunteersService.findByEvent(event.id);
  }
}
