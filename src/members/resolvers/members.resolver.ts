import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MembersService } from '../services/members.service';
import { Member } from '../entities/member.entity';
import { CreateMemberInput } from '../dto/create-member.input';
import { UpdateMemberInput } from '../dto/update-member.input';
import { ParseUUIDPipe } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { IpAddress, UserAgent } from '../../common/decorators';
import { MemberStatus } from '../entities/member.entity';
import { Prisma } from '@prisma/client';
import { AssignRfidCardInput } from '../dto/assign-rfid-card.input';
import { MemberStatistics } from '../dto/member-statistics.output';
import { MemberDashboard } from '../dto/member-dashboard.dto';

@Resolver(() => Member)
export class MembersResolver {
  constructor(private readonly membersService: MembersService) {}

  @Mutation(() => Member)
  async createMember(
    @Args('createMemberInput') createMemberInput: CreateMemberInput,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<Member> {
    return this.membersService.create(
      createMemberInput,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Query(() => [Member], { name: 'members' })
  async findAll(
    @Args('organisationId', { type: () => String, nullable: true })
    organisationId?: string,
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 })
    skip?: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 10 })
    take?: number,
    @Args('branchId', { type: () => String, nullable: true }) branchId?: string,
    @Args('hasRfidCard', { type: () => Boolean, nullable: true })
    hasRfidCard?: boolean,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ): Promise<Member[]> {
    const where: Prisma.MemberWhereInput = {};
    if (branchId) {
      where.branchId = branchId;
    } else if (organisationId) {
      where.organisationId = organisationId;
    }
    if (hasRfidCard === true) {
      where.rfidCardId = { not: null };
    } else if (hasRfidCard === false) {
      where.rfidCardId = { equals: null };
    }
    return this.membersService.findAll(
      skip ?? 0,
      take ?? 10,
      where,
      undefined,
      search,
    );
  }

  @Query(() => Member, { name: 'member' })
  async findOne(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
  ): Promise<Member> {
    return this.membersService.findOne(id);
  }

  @Mutation(() => Member)
  async updateMember(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @Args('updateMemberInput') updateMemberInput: UpdateMemberInput,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<Member> {
    return this.membersService.update(
      id,
      updateMemberInput,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Boolean)
  async removeMember(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<boolean> {
    return this.membersService.remove(id, userId, ipAddress, userAgent);
  }

  @Mutation(() => Member)
  async transferMember(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @Args('fromBranchId', { type: () => String }, ParseUUIDPipe)
    fromBranchId: string,
    @Args('toBranchId', { type: () => String }, ParseUUIDPipe)
    toBranchId: string,
    @Args('reason', { type: () => String, nullable: true }) reason?: string,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<Member> {
    return this.membersService.transferMember(
      id,
      fromBranchId,
      toBranchId,
      reason,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Member)
  async addMemberToBranch(
    @Args('memberId', { type: () => String }, ParseUUIDPipe) memberId: string,
    @Args('branchId', { type: () => String }, ParseUUIDPipe) branchId: string,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<Member> {
    return this.membersService.addMemberToBranch(
      memberId,
      branchId,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Member)
  async removeMemberFromBranch(
    @Args('memberId', { type: () => String }, ParseUUIDPipe) memberId: string,
    @Args('branchId', { type: () => String }, ParseUUIDPipe) branchId: string,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<Member> {
    return this.membersService.removeMemberFromBranch(
      memberId,
      branchId,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Member)
  async updateMemberStatus(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @Args('status', { type: () => MemberStatus }) status: MemberStatus,
    @Args('reason', { type: () => String, nullable: true }) reason?: string,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<Member> {
    return this.membersService.updateMemberStatus(
      id,
      status,
      reason,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Query(() => Int, { name: 'membersCount' })
  async count(
    @Args('branchId', { type: () => String, nullable: true }) branchId?: string,
    @Args('organisationId', { type: () => String, nullable: true })
    organisationId?: string,
  ): Promise<number> {
    const where: Prisma.MemberWhereInput = {};
    if (branchId) {
      where.branchId = branchId;
    }
    if (organisationId) {
      where.organisationId = organisationId;
    }
    return this.membersService.count(where);
  }

  @Query(() => MemberStatistics, { name: 'memberStatistics' })
  async getMemberStatistics(
    @Args('branchId', { type: () => String, nullable: true }) branchId?: string,
    @Args('organisationId', { type: () => String, nullable: true })
    organisationId?: string,
  ): Promise<MemberStatistics> {
    return this.membersService.getStatistics(branchId, organisationId);
  }

  @Mutation(() => Member, { name: 'assignRfidCardToMember' })
  async assignRfidCardToMember(
    @Args('assignRfidCardInput') assignRfidCardInput: AssignRfidCardInput,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<Member> {
    return this.membersService.assignRfidCard(
      assignRfidCardInput,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Member, { name: 'removeRfidCardFromMember' })
  async removeRfidCardFromMember(
    @Args('memberId', { type: () => String }, ParseUUIDPipe) memberId: string,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<Member> {
    return this.membersService.removeRfidCard(
      memberId,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Query(() => Member, { name: 'memberByRfidCard', nullable: true })
  async memberByRfidCard(
    @Args('rfidCardId', { type: () => String }) rfidCardId: string,
  ): Promise<Member | null> {
    return this.membersService.findMemberByRfidCard(rfidCardId);
  }

  @Query(() => MemberDashboard, { name: 'memberDashboard' })
  async getMemberDashboard(
    @Args('memberId', { type: () => String }, ParseUUIDPipe) memberId: string,
  ): Promise<MemberDashboard> {
    return this.membersService.getMemberDashboard(memberId);
  }
}
