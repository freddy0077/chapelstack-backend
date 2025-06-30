import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { VolunteersService } from '../services/volunteers.service';
import { EventsService } from '../services/events.service';
import { ChildrenMinistryVolunteer } from '../entities/children-ministry-volunteer.entity';
import { CreateVolunteerInput } from '../dto/create-volunteer.input';
import { UpdateVolunteerInput } from '../dto/update-volunteer.input';
import { ChildrenEvent } from '../entities/children-event.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { VolunteerScheduleItem } from '../dto/volunteer-schedule.dto';

@Resolver(() => ChildrenMinistryVolunteer)
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class VolunteersResolver {
  constructor(
    private readonly volunteersService: VolunteersService,
    private readonly eventsService: EventsService,
  ) {}

  @Mutation(() => ChildrenMinistryVolunteer)
  @RequirePermissions({
    action: 'create',
    subject: 'ChildrenMinistryVolunteer',
  })
  createChildrenMinistryVolunteer(
    @Args('input') createVolunteerInput: CreateVolunteerInput,
  ): Promise<ChildrenMinistryVolunteer> {
    return this.volunteersService.create(createVolunteerInput);
  }

  @Query(() => [ChildrenMinistryVolunteer], {
    name: 'childrenMinistryVolunteers',
  })
  @RequirePermissions({ action: 'read', subject: 'ChildrenMinistryVolunteer' })
  findAll(
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('trainingCompleted', { nullable: true }) trainingCompleted?: boolean,
  ): Promise<ChildrenMinistryVolunteer[]> {
    return this.volunteersService.findAll(branchId, trainingCompleted);
  }

  @Query(() => ChildrenMinistryVolunteer, { name: 'childrenMinistryVolunteer' })
  @RequirePermissions({ action: 'read', subject: 'ChildrenMinistryVolunteer' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ChildrenMinistryVolunteer> {
    return this.volunteersService.findOne(id);
  }

  @Query(() => ChildrenMinistryVolunteer, {
    name: 'childrenMinistryVolunteerByMember',
    nullable: true,
  })
  @RequirePermissions({ action: 'read', subject: 'ChildrenMinistryVolunteer' })
  findByMember(
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<ChildrenMinistryVolunteer | null> {
    return this.volunteersService.findByMember(memberId);
  }

  @Mutation(() => ChildrenMinistryVolunteer)
  @RequirePermissions({
    action: 'update',
    subject: 'ChildrenMinistryVolunteer',
  })
  updateChildrenMinistryVolunteer(
    @Args('input') updateVolunteerInput: UpdateVolunteerInput,
  ): Promise<ChildrenMinistryVolunteer> {
    return this.volunteersService.update(
      updateVolunteerInput.id,
      updateVolunteerInput,
    );
  }

  @Mutation(() => ChildrenMinistryVolunteer)
  @RequirePermissions({
    action: 'delete',
    subject: 'ChildrenMinistryVolunteer',
  })
  removeChildrenMinistryVolunteer(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ChildrenMinistryVolunteer> {
    return this.volunteersService.remove(id);
  }

  @Query(() => [VolunteerScheduleItem], { name: 'volunteerSchedule' })
  @RequirePermissions({ action: 'read', subject: 'ChildrenMinistryVolunteer' })
  getVolunteerSchedule(
    @Args('id', { type: () => ID }) id: string,
    @Args('startDate', { nullable: true, type: () => GraphQLISODateTime })
    startDate?: Date,
    @Args('endDate', { nullable: true, type: () => GraphQLISODateTime })
    endDate?: Date,
  ): Promise<VolunteerScheduleItem[]> {
    return this.volunteersService.getVolunteerSchedule(id, startDate, endDate);
  }

  @ResolveField('upcomingEvents', () => [ChildrenEvent])
  async getUpcomingEvents(
    @Parent() volunteer: ChildrenMinistryVolunteer,
  ): Promise<ChildrenEvent[]> {
    const now = new Date();
    const schedule = await this.volunteersService.getVolunteerSchedule(
      volunteer.id,
      now,
    );
    return schedule.map((item) => item.event);
  }
}
