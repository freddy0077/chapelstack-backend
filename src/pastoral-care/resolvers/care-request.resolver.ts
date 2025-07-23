import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CareRequestService } from '../services/care-request.service';
import {
  CreateCareRequestInput,
  UpdateCareRequestInput,
  CareRequestFilterInput,
  CareRequest,
} from '../dto/care-request.dto';
import { CareRequestStatus } from '@prisma/client';

@Resolver(() => CareRequest)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CareRequestResolver {
  constructor(private careRequestService: CareRequestService) {}

  @Mutation(() => CareRequest)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF', 'MEMBER')
  async createCareRequest(
    @Args('input') input: CreateCareRequestInput,
    @Context() context: any,
  ): Promise<CareRequest> {
    const user = context.req.user;
    return this.careRequestService.createCareRequest(input, user.id) as any;
  }

  @Mutation(() => CareRequest)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async updateCareRequest(
    @Args('input') input: UpdateCareRequestInput,
    @Context() context: any,
  ): Promise<CareRequest> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.careRequestService.updateCareRequest(
      input,
      user.id,
      organisationId,
      branchId,
    ) as any;
  }

  @Query(() => [CareRequest])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async careRequests(
    @Args('filter') filter: CareRequestFilterInput,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 50 }) take: number,
    @Context() context: any,
  ): Promise<CareRequest[]> {
    const user = context.req.user;

    // Ensure user can only access their organization/branch data
    const finalFilter = {
      ...filter,
      organisationId: user.organisationId,
      ...(user.role !== 'SUPER_ADMIN' && { branchId: user.branchId }),
    };

    const result = await this.careRequestService.getCareRequests(
      finalFilter,
      skip,
      take,
    );
    return result.requests as any;
  }

  @Query(() => Int)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async careRequestsCount(
    @Args('filter') filter: CareRequestFilterInput,
    @Context() context: any,
  ): Promise<number> {
    const user = context.req.user;

    // Ensure user can only access their organization/branch data
    const finalFilter = {
      ...filter,
      organisationId: user.organisationId,
      ...(user.role !== 'SUPER_ADMIN' && { branchId: user.branchId }),
    };

    const result = await this.careRequestService.getCareRequests(
      finalFilter,
      0,
      1,
    );
    return result.total;
  }

  @Query(() => CareRequest)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async careRequest(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<CareRequest> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.careRequestService.getCareRequestById(
      id,
      organisationId,
      branchId,
    ) as any;
  }

  @Mutation(() => Boolean)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async deleteCareRequest(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.careRequestService.deleteCareRequest(
      id,
      organisationId,
      branchId,
    );
  }

  @Mutation(() => CareRequest)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async assignCareRequest(
    @Args('id') id: string,
    @Args('assignedPastorId') assignedPastorId: string,
    @Context() context: any,
  ): Promise<CareRequest> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.careRequestService.assignCareRequest(
      id,
      assignedPastorId,
      organisationId,
      branchId,
    ) as any;
  }

  @Query(() => [CareRequest])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async overdueCareRequests(@Context() context: any): Promise<CareRequest[]> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.careRequestService.getOverdueRequests(
      organisationId,
      branchId,
    ) as any;
  }

  @Query(() => [CareRequest])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async pastorCareRequests(
    @Args('pastorId') pastorId: string,
    @Args('status', { nullable: true }) status?: CareRequestStatus,
    @Context() context?: any,
  ): Promise<CareRequest[]> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.careRequestService.getRequestsByPastor(
      pastorId,
      organisationId,
      branchId,
      status,
    ) as any;
  }

  @Query(() => [CareRequest])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF', 'MEMBER')
  async myCareRequests(
    @Args('status', { nullable: true }) status?: CareRequestStatus,
    @Context() context?: any,
  ): Promise<CareRequest[]> {
    const user = context.req.user;

    // Get member ID from user
    const member = await this.careRequestService['prisma'].member.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!member) {
      return [];
    }

    const filter = {
      memberId: member.id,
      organisationId: user.organisationId,
      ...(user.role !== 'SUPER_ADMIN' && { branchId: user.branchId }),
      ...(status && { status }),
    };

    const result = await this.careRequestService.getCareRequests(
      filter,
      0,
      100,
    );
    return result.requests as any;
  }
}
