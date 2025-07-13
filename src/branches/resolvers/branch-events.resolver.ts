import { Args, Query, Resolver } from '@nestjs/graphql';
import { BranchEventsService } from '../services/branch-events.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { Event } from '../../events/entities/event.entity';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class BranchEventsResolver {
  constructor(private branchEventsService: BranchEventsService) {}

  @Query(() => [Event], { name: 'branchUpcomingEvents' })
  // @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR, Role.USER, Role.MEMBER)
  async getBranchUpcomingEvents(
    @Args('branchId', { type: () => String }) branchId: string,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
  ): Promise<Event[]> {
    return this.branchEventsService.getBranchUpcomingEvents(branchId, limit);
  }
}
