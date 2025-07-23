import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MembersService } from '../services/members.service';
import { MemberReportsService } from '../services/member-reports.service';
import { Member } from '../entities/member.entity';
import { MemberReport } from '../entities/member-report.entity';
import { MemberReportInput } from '../dto/member-report.input';
import { AssignRfidCardInput } from '../dto/assign-rfid-card.input';
import { CreateMemberInput } from '../dto/create-member.input';
import { UpdateMemberInput } from '../dto/update-member.input';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

import { MemberStatus } from '../entities/member.entity';
import { IpAddress, UserAgent } from '../../common/decorators';
import { Prisma } from '@prisma/client';
import { MemberStatistics } from '../dto/member-statistics.output';
import { MemberDashboard } from '../dto/member-dashboard.dto';
import { S3UploadService } from '../../content/services/s3-upload.service';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@Resolver(() => Member)
export class MembersResolver {
  constructor(
    private readonly membersService: MembersService,
    private readonly memberReportsService: MemberReportsService,
    private readonly prisma: PrismaService,
    private readonly s3UploadService: S3UploadService,
  ) {}

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

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async uploadMemberImage(
    @Args('memberId', { type: () => String }) memberId: string,
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
    @CurrentUser() user: User,
  ): Promise<string> {
    // Read file buffer
    const { createReadStream, mimetype, filename } = await file;
    const chunks: Buffer[] = [];
    const stream = createReadStream();
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const fileObj: FileUpload = {
      originalname: filename,
      mimetype,
      buffer,
    };

    // Generate a unique filename with member ID prefix
    const fileKey = `members/${memberId}/profile/${uuidv4()}-${filename}`;

    // Generate presigned URL for S3 upload
    const { uploadUrl, fileUrl } =
      await this.s3UploadService.generatePresignedUploadUrl(
        filename,
        mimetype,
        `members/${memberId}/profile`,
      );

    // Update member record with new profile image URL
    await this.membersService.update(memberId, {
      id: memberId,
      profileImageUrl: fileUrl,
    });

    return fileUrl;
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

  @Query(() => MemberReport)
  @UseGuards(GqlAuthGuard)
  async generateMemberReport(
    @Args('input') input: MemberReportInput,
    @CurrentUser() user: User,
  ): Promise<MemberReport> {
    // Apply organization/branch filtering based on user roles
    // Note: User entity doesn't have branchId/organisationId, so we'll let the service handle filtering
    // based on the input parameters provided by the frontend

    return this.memberReportsService.generateMemberReport(input);
  }
}
