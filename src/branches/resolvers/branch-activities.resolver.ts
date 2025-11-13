import { Args, Query, Resolver } from '@nestjs/graphql';
import { BranchActivitiesService } from '../services/branch-activities.service';
import { BranchActivity } from '../entities/branch-activity.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@Resolver(() => BranchActivity)
@UseGuards(GqlAuthGuard, RolesGuard)
export class BranchActivitiesResolver {
  constructor(private branchActivitiesService: BranchActivitiesService) {}

  @Query(() => [BranchActivity], { name: 'branchActivities' })
  // @Roles(Role.ADMIN, Role.ADMIN, Role.MODERATOR, Role.USER, Role.MEMBER)
  async getBranchActivities(
    @Args('branchId', { type: () => String }) branchId: string,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
  ): Promise<BranchActivity[]> {
    return this.branchActivitiesService.getBranchActivities(
      branchId,
      limit,
      skip,
    );
  }
}
