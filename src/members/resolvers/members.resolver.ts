import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MembersService } from '../services/members.service';
import { MemberReportsService } from '../services/member-reports.service';
import { Member } from '../entities/member.entity';
import { MemberReport } from '../entities/member-report.entity';
import { MemberReportInput } from '../dto/member-report.input';
import { AssignRfidCardInput } from '../dto/assign-rfid-card.input';
import { CreateMemberInput } from '../dto/create-member.input';
import { UpdateMemberInput } from '../dto/update-member.input';
import {
  CreateCommunicationPrefsInput,
  UpdateCommunicationPrefsInput,
} from '../dto/communication-prefs.input';
import {
  CreateMemberRelationshipInput,
  UpdateMemberRelationshipInput,
} from '../dto/member-relationship.input';
import { CreateMembershipHistoryInput } from '../dto/membership-history.input';
import {
  BulkUpdateStatusInput,
  BulkTransferInput,
  BulkDeactivateInput,
  BulkAssignRfidInput,
  BulkAddToGroupInput,
  BulkRemoveFromGroupInput,
  BulkAddToMinistryInput,
  BulkRemoveFromMinistryInput,
  BulkExportInput,
} from '../dto/bulk-actions.input';
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
    @Args('hasMemberId', { type: () => Boolean, nullable: true })
    hasMemberId?: boolean,
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('gender', { type: () => [String], nullable: true }) gender?: string[],
    @Args('maritalStatus', { type: () => [String], nullable: true })
    maritalStatus?: string[],
    @Args('membershipStatus', { type: () => [String], nullable: true })
    membershipStatus?: string[],
    @Args('memberStatus', { type: () => [String], nullable: true })
    memberStatus?: string[],
    @Args('minAge', { type: () => Int, nullable: true }) minAge?: number,
    @Args('maxAge', { type: () => Int, nullable: true }) maxAge?: number,
    @Args('joinedAfter', { type: () => String, nullable: true })
    joinedAfter?: string,
    @Args('joinedBefore', { type: () => String, nullable: true })
    joinedBefore?: string,
    @Args('hasProfileImage', { type: () => Boolean, nullable: true })
    hasProfileImage?: boolean,
    @Args('hasEmail', { type: () => Boolean, nullable: true })
    hasEmail?: boolean,
    @Args('hasPhone', { type: () => Boolean, nullable: true })
    hasPhone?: boolean,
    @Args('isRegularAttendee', { type: () => Boolean, nullable: true })
    isRegularAttendee?: boolean,
  ): Promise<Member[]> {
    const where: Prisma.MemberWhereInput = {};

    // Exclude deactivated members by default
    where.isDeactivated = false;

    if (branchId) {
      where.branchId = branchId;
    } else if (organisationId) {
      where.organisationId = organisationId;
    }

    if (hasMemberId === true) {
      where.memberId = { not: null };
    } else if (hasMemberId === false) {
      where.memberId = null;
    }

    // New server-side filters
    if (gender && gender.length > 0) {
      where.gender = { in: gender as any };
    }

    if (maritalStatus && maritalStatus.length > 0) {
      where.maritalStatus = { in: maritalStatus as any };
    }

    if (membershipStatus && membershipStatus.length > 0) {
      where.membershipStatus = { in: membershipStatus as any };
    }

    if (memberStatus && memberStatus.length > 0) {
      where.status = { in: memberStatus as any };
    }

    // Age range filtering (requires date calculation)
    if (minAge !== undefined || maxAge !== undefined) {
      const now = new Date();
      const conditions: Prisma.MemberWhereInput[] = [];

      if (maxAge !== undefined) {
        const minBirthDate = new Date(
          now.getFullYear() - maxAge - 1,
          now.getMonth(),
          now.getDate(),
        );
        conditions.push({ dateOfBirth: { gte: minBirthDate } });
      }

      if (minAge !== undefined) {
        const maxBirthDate = new Date(
          now.getFullYear() - minAge,
          now.getMonth(),
          now.getDate(),
        );
        conditions.push({ dateOfBirth: { lte: maxBirthDate } });
      }

      if (conditions.length > 0) {
        where.AND = Array.isArray(where.AND)
          ? where.AND.concat(conditions)
          : conditions;
      }
    }

    // Date range filtering
    if (joinedAfter || joinedBefore) {
      const dateConditions: any = {};
      if (joinedAfter) {
        dateConditions.gte = new Date(joinedAfter);
      }
      if (joinedBefore) {
        dateConditions.lte = new Date(joinedBefore);
      }
      where.membershipDate = dateConditions;
    }

    if (hasProfileImage === true) {
      where.profileImageUrl = { not: null };
    } else if (hasProfileImage === false) {
      where.profileImageUrl = null;
    }

    if (hasEmail === true) {
      where.email = { not: null };
    } else if (hasEmail === false) {
      where.email = null;
    }

    if (hasPhone === true) {
      where.phoneNumber = { not: null };
    } else if (hasPhone === false) {
      where.phoneNumber = null;
    }

    if (isRegularAttendee !== undefined) {
      where.isRegularAttendee = isRegularAttendee;
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
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('membershipStatus', { type: () => [String], nullable: true })
    membershipStatus?: string[],
    @Args('membershipType', { type: () => [String], nullable: true })
    membershipType?: string[],
    @Args('gender', { type: () => [String], nullable: true }) gender?: string[],
    @Args('maritalStatus', { type: () => [String], nullable: true })
    maritalStatus?: string[],
    @Args('memberStatus', { type: () => [String], nullable: true })
    memberStatus?: string[],
    @Args('minAge', { type: () => Int, nullable: true }) minAge?: number,
    @Args('maxAge', { type: () => Int, nullable: true }) maxAge?: number,
    @Args('startDate', { type: () => String, nullable: true })
    startDate?: string,
    @Args('endDate', { type: () => String, nullable: true }) endDate?: string,
    @Args('hasMemberId', { type: () => Boolean, nullable: true })
    hasMemberId?: boolean,
    @Args('hasProfileImage', { type: () => Boolean, nullable: true })
    hasProfileImage?: boolean,
    @Args('hasEmail', { type: () => Boolean, nullable: true })
    hasEmail?: boolean,
    @Args('hasPhone', { type: () => Boolean, nullable: true })
    hasPhone?: boolean,
    @Args('isRegularAttendee', { type: () => Boolean, nullable: true })
    isRegularAttendee?: boolean,
  ): Promise<number> {
    const where: Prisma.MemberWhereInput = {};

    // Exclude deactivated members by default (same as members query)
    where.isDeactivated = false;

    if (branchId) {
      where.branchId = branchId;
    } else if (organisationId) {
      where.organisationId = organisationId;
    }

    if (hasMemberId === true) {
      where.memberId = { not: null };
    } else if (hasMemberId === false) {
      where.memberId = null;
    }

    // Apply the same server-side filters as members query
    if (gender && gender.length > 0) {
      where.gender = { in: gender as any };
    }

    if (maritalStatus && maritalStatus.length > 0) {
      where.maritalStatus = { in: maritalStatus as any };
    }

    if (membershipStatus && membershipStatus.length > 0) {
      where.membershipStatus = { in: membershipStatus as any };
    }

    if (memberStatus && memberStatus.length > 0) {
      where.status = { in: memberStatus as any };
    }

    // Age range filtering (same logic as members query)
    if (minAge !== undefined || maxAge !== undefined) {
      const now = new Date();
      const conditions: Prisma.MemberWhereInput[] = [];

      if (maxAge !== undefined) {
        const minBirthDate = new Date(
          now.getFullYear() - maxAge - 1,
          now.getMonth(),
          now.getDate(),
        );
        conditions.push({ dateOfBirth: { gte: minBirthDate } });
      }

      if (minAge !== undefined) {
        const maxBirthDate = new Date(
          now.getFullYear() - minAge,
          now.getMonth(),
          now.getDate(),
        );
        conditions.push({ dateOfBirth: { lte: maxBirthDate } });
      }

      if (conditions.length > 0) {
        where.AND = conditions;
      }
    }

    // Date range filtering
    if (startDate || endDate) {
      const dateConditions: any = {};
      if (startDate) {
        dateConditions.gte = new Date(startDate);
      }
      if (endDate) {
        dateConditions.lte = new Date(endDate);
      }
      where.membershipDate = dateConditions;
    }

    if (hasProfileImage === true) {
      where.profileImageUrl = { not: null };
    } else if (hasProfileImage === false) {
      where.profileImageUrl = null;
    }

    if (hasEmail === true) {
      where.email = { not: null };
    } else if (hasEmail === false) {
      where.email = null;
    }

    if (hasPhone === true) {
      where.phoneNumber = { not: null };
    } else if (hasPhone === false) {
      where.phoneNumber = null;
    }

    if (isRegularAttendee !== undefined) {
      where.isRegularAttendee = isRegularAttendee;
    }

    // Apply search filtering if provided (same logic as members query)
    if (search && search.trim().length > 0) {
      const searchFilter: Prisma.MemberWhereInput = {
        OR: [
          {
            firstName: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            lastName: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            email: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            phoneNumber: {
              contains: search,
            },
          },
          {
            memberId: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      };

      where.AND = [
        ...(Array.isArray(where.AND)
          ? where.AND
          : where.AND
            ? [where.AND]
            : []),
        searchFilter,
      ];
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

  @Mutation(() => Boolean)
  async updateCommunicationPrefs(
    @Args('memberId', { type: () => String }, ParseUUIDPipe) memberId: string,
    @Args('prefsData', { type: () => String }) prefsData: string,
    @CurrentUser() userId?: string,
  ): Promise<boolean> {
    try {
      const parsedPrefs = JSON.parse(prefsData);
      await this.membersService.updateCommunicationPrefs(
        memberId,
        parsedPrefs,
        userId,
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  @Mutation(() => Boolean)
  async createMemberRelationship(
    @Args('createMemberRelationshipInput')
    createMemberRelationshipInput: CreateMemberRelationshipInput,
    @CurrentUser() userId?: string,
  ): Promise<boolean> {
    try {
      await this.membersService.createMemberRelationship(
        createMemberRelationshipInput,
        userId,
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  @Mutation(() => Boolean)
  async updateMemberRelationship(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @Args('updateMemberRelationshipInput')
    updateMemberRelationshipInput: UpdateMemberRelationshipInput,
    @CurrentUser() userId?: string,
  ): Promise<boolean> {
    try {
      await this.membersService.updateMemberRelationship(
        id,
        updateMemberRelationshipInput,
        userId,
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  @Mutation(() => Boolean)
  async deleteMemberRelationship(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @CurrentUser() userId?: string,
  ): Promise<boolean> {
    return this.membersService.deleteMemberRelationship(id, userId);
  }

  @Mutation(() => Boolean)
  async createMembershipHistoryEntry(
    @Args('createMembershipHistoryInput')
    createMembershipHistoryInput: CreateMembershipHistoryInput,
    @CurrentUser() userId?: string,
  ): Promise<boolean> {
    try {
      await this.membersService.createMembershipHistoryEntry(
        createMembershipHistoryInput,
        userId,
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  @Query(() => [Member])
  async searchMembers(
    @Args('query', { type: () => String }) query: string,
    @Args('branchId', { type: () => String, nullable: true }) branchId?: string,
    @Args('membershipStatus', { type: () => String, nullable: true })
    membershipStatus?: string,
    @Args('ageGroup', { type: () => String, nullable: true }) ageGroup?: string,
    @Args('gender', { type: () => String, nullable: true }) gender?: string,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip?: number,
    @Args('take', { type: () => Int, defaultValue: 20 }) take?: number,
  ): Promise<Member[]> {
    const filters = {
      branchId,
      membershipStatus,
      ageGroup,
      gender,
    };
    return this.membersService.searchMembers(query, filters, skip, take);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async bulkUpdateMemberStatus(
    @Args('bulkUpdateStatusInput') bulkUpdateStatusInput: BulkUpdateStatusInput,
    @CurrentUser() user: User,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<boolean> {
    return this.membersService.bulkUpdateStatus(
      bulkUpdateStatusInput.memberIds,
      bulkUpdateStatusInput.status,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async bulkTransferMembers(
    @Args('bulkTransferInput') bulkTransferInput: BulkTransferInput,
    @CurrentUser() user: User,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<boolean> {
    return this.membersService.bulkTransfer(
      bulkTransferInput.memberIds,
      bulkTransferInput.newBranchId,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async bulkDeactivateMembers(
    @Args('bulkDeactivateInput') bulkDeactivateInput: BulkDeactivateInput,
    @CurrentUser() user: User,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<boolean> {
    return this.membersService.bulkDeactivate(
      bulkDeactivateInput.memberIds,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async bulkAssignRfidCards(
    @Args('bulkAssignRfidInput') bulkAssignRfidInput: BulkAssignRfidInput,
    @CurrentUser() user: User,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<boolean> {
    return this.membersService.bulkAssignRfid(
      bulkAssignRfidInput.memberIds,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async bulkExportMembers(
    @Args('bulkExportInput') bulkExportInput: BulkExportInput,
    @CurrentUser() user: User,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<string> {
    return this.membersService.bulkExportData(
      bulkExportInput.memberIds,
      user,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async bulkAddToGroup(
    @Args('bulkAddToGroupInput') bulkAddToGroupInput: BulkAddToGroupInput,
    @CurrentUser() user: User,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<boolean> {
    return this.membersService.bulkAddToGroup(
      bulkAddToGroupInput,
      user,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async bulkRemoveFromGroup(
    @Args('bulkRemoveFromGroupInput')
    bulkRemoveFromGroupInput: BulkRemoveFromGroupInput,
    @CurrentUser() user: User,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<boolean> {
    return this.membersService.bulkRemoveFromGroup(
      bulkRemoveFromGroupInput,
      user,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async bulkAddToMinistry(
    @Args('bulkAddToMinistryInput')
    bulkAddToMinistryInput: BulkAddToMinistryInput,
    @CurrentUser() user: User,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<boolean> {
    return this.membersService.bulkAddToMinistry(
      bulkAddToMinistryInput,
      user,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async bulkRemoveFromMinistry(
    @Args('bulkRemoveFromMinistryInput')
    bulkRemoveFromMinistryInput: BulkRemoveFromMinistryInput,
    @CurrentUser() user: User,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<boolean> {
    return this.membersService.bulkRemoveFromMinistry(
      bulkRemoveFromMinistryInput,
      user,
      ipAddress,
      userAgent,
    );
  }
}
