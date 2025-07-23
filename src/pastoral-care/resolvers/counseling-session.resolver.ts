import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CounselingSessionService } from '../services/counseling-session.service';
import {
  CreateCounselingSessionInput,
  UpdateCounselingSessionInput,
  CounselingSessionFilterInput,
  CounselingSession,
} from '../dto/counseling-session.dto';

@Resolver(() => CounselingSession)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CounselingSessionResolver {
  constructor(private counselingSessionService: CounselingSessionService) {}

  @Mutation(() => CounselingSession)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async createCounselingSession(
    @Args('input') input: CreateCounselingSessionInput,
    @Context() context: any,
  ): Promise<CounselingSession> {
    const user = context.req.user;
    return this.counselingSessionService.createCounselingSession(
      input,
      user.id,
    ) as any;
  }

  @Mutation(() => CounselingSession)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async updateCounselingSession(
    @Args('input') input: UpdateCounselingSessionInput,
    @Context() context: any,
  ): Promise<CounselingSession> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.counselingSessionService.updateCounselingSession(
      input,
      user.id,
      organisationId,
      branchId,
    ) as any;
  }

  @Query(() => [CounselingSession])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async counselingSessions(
    @Args('filter') filter: CounselingSessionFilterInput,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 50 }) take: number,
    @Context() context: any,
  ): Promise<CounselingSession[]> {
    const user = context.req.user;

    // Ensure user can only access their organization/branch data
    const finalFilter = {
      ...filter,
      organisationId: user.organisationId,
      ...(user.role !== 'SUPER_ADMIN' && { branchId: user.branchId }),
    };

    const result = await this.counselingSessionService.getCounselingSessions(
      finalFilter,
      user.id, // Pass userId for confidential session filtering
      skip,
      take,
    );
    return result.sessions as any;
  }

  @Query(() => Int)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async counselingSessionsCount(
    @Args('filter') filter: CounselingSessionFilterInput,
    @Context() context: any,
  ): Promise<number> {
    const user = context.req.user;

    // Ensure user can only access their organization/branch data
    const finalFilter = {
      ...filter,
      organisationId: user.organisationId,
      ...(user.role !== 'SUPER_ADMIN' && { branchId: user.branchId }),
    };

    const result = await this.counselingSessionService.getCounselingSessions(
      finalFilter,
      user.id, // Pass userId for confidential session filtering
      0,
      1,
    );
    return result.total;
  }

  @Query(() => CounselingSession)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async counselingSession(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<CounselingSession> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.counselingSessionService.getCounselingSessionById(
      id,
      user.id, // Pass userId for confidential session access check
      organisationId,
      branchId,
    ) as any;
  }

  @Mutation(() => Boolean)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async deleteCounselingSession(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.counselingSessionService.deleteCounselingSession(
      id,
      user.id, // Pass userId for permission check
      organisationId,
      branchId,
    );
  }

  @Query(() => [CounselingSession])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async upcomingCounselingSessions(
    @Args('days', { type: () => Int, defaultValue: 7 }) days: number,
    @Args('counselorId', { nullable: true }) counselorId?: string,
    @Context() context?: any,
  ): Promise<CounselingSession[]> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.counselingSessionService.getUpcomingSessions(
      organisationId,
      branchId,
    ) as any;
  }

  @Query(() => [CounselingSession])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async memberCounselingSessions(
    @Args('memberId') memberId: string,
    @Args('includeConfidential', { defaultValue: false })
    includeConfidential: boolean,
    @Context() context: any,
  ): Promise<CounselingSession[]> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.counselingSessionService.getSessionsByMember(
      memberId,
      organisationId,
      branchId,
    ) as any;
  }
}
