import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PastoralVisitService } from '../services/pastoral-visit.service';
import {
  CreatePastoralVisitInput,
  UpdatePastoralVisitInput,
  PastoralVisitFilterInput,
  PastoralVisit,
} from '../dto/pastoral-visit.dto';

@Resolver(() => PastoralVisit)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PastoralVisitResolver {
  constructor(private pastoralVisitService: PastoralVisitService) {}

  @Mutation(() => PastoralVisit)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async createPastoralVisit(
    @Args('input') input: CreatePastoralVisitInput,
    @Context() context: any,
  ): Promise<PastoralVisit> {
    const user = context.req.user;
    return this.pastoralVisitService.createPastoralVisit(input, user.id) as any;
  }

  @Mutation(() => PastoralVisit)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async updatePastoralVisit(
    @Args('input') input: UpdatePastoralVisitInput,
    @Context() context: any,
  ): Promise<PastoralVisit> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.pastoralVisitService.updatePastoralVisit(
      input,
      user.id,
      organisationId,
      branchId,
    ) as any;
  }

  @Query(() => [PastoralVisit])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async pastoralVisits(
    @Args('filter') filter: PastoralVisitFilterInput,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 50 }) take: number,
    @Context() context: any,
  ): Promise<PastoralVisit[]> {
    const user = context.req.user;

    // Ensure user can only access their organization/branch data
    const finalFilter = {
      ...filter,
      organisationId: user.organisationId,
      ...(user.role !== 'SUPER_ADMIN' && { branchId: user.branchId }),
    };

    const result = await this.pastoralVisitService.getPastoralVisits(
      finalFilter,
      skip,
      take,
    );
    return result.visits as any;
  }

  @Query(() => Int)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async pastoralVisitsCount(
    @Args('filter') filter: PastoralVisitFilterInput,
    @Context() context: any,
  ): Promise<number> {
    const user = context.req.user;

    // Ensure user can only access their organization/branch data
    const finalFilter = {
      ...filter,
      organisationId: user.organisationId,
      ...(user.role !== 'SUPER_ADMIN' && { branchId: user.branchId }),
    };

    const result = await this.pastoralVisitService.getPastoralVisits(
      finalFilter,
      0,
      1,
    );
    return result.total;
  }

  @Query(() => PastoralVisit)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async pastoralVisit(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<PastoralVisit> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.pastoralVisitService.getPastoralVisitById(
      id,
      organisationId,
      branchId,
    ) as any;
  }

  @Mutation(() => Boolean)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async deletePastoralVisit(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.pastoralVisitService.deletePastoralVisit(
      id,
      organisationId,
      branchId,
    );
  }

  @Query(() => [PastoralVisit])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async upcomingPastoralVisits(
    @Args('days', { type: () => Int, defaultValue: 7 }) days: number,
    @Context() context: any,
  ): Promise<PastoralVisit[]> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.pastoralVisitService.getUpcomingVisits(
      organisationId,
      branchId,
      days,
    ) as any;
  }
}
