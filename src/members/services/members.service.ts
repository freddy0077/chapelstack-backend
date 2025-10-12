import {
    Injectable,
    Logger,
    NotFoundException,
    ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/services';
import { CreateMemberInput } from '../dto/create-member.input';
import { UpdateMemberInput } from '../dto/update-member.input';
import { Member, MemberStatus } from '../entities/member.entity';
import { Prisma } from '@prisma/client';
import { AssignRfidCardInput } from '../dto/assign-rfid-card.input';
import {
  MemberStatistics,
  MemberStatisticsPeriod,
  MemberAgeGroup,
  MemberStatusDistribution,
  MemberMembershipStatusDistribution,
} from '../dto/member-statistics.output';
import { GenderDistribution } from '../../reporting/entities/member-demographics-data.entity';
import { MemberDashboard } from '../dto/member-dashboard.dto';
import { WorkflowsService } from '../../workflows/services/workflows.service';
import { MemberIdGenerationService } from '../../common/services/member-id-generation.service';
import {
  BulkAddToGroupInput,
  BulkAddToMinistryInput,
  BulkRemoveFromGroupInput,
  BulkRemoveFromMinistryInput,
  BulkExportInput,
} from '../dto/bulk-actions.input';
import { MemberFiltersInput } from '../dto/member-filters.input';
import { User } from '../../users/entities/user.entity';
import {
  ImportMembersInput,
  ImportMembersResult,
  ImportMemberResult,
  ImportError,
} from '../dto/import-members.input';

@Injectable()
export class MembersService {
  /**
   * Returns the number of members with assigned RFID cards.
   * TODO: Implement actual count logic.
   */
  countAssignedRfidCards(): number {
    // TODO: Implement actual count logic
    return 0;
  }

  /**
   * Returns the number of unassigned RFID cards.
   * TODO: Implement actual count logic.
   */
  countUnassignedRfidCards(): number {
    // TODO: Implement actual count logic
    return 0;
  }

  private readonly logger = new Logger(MembersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly workflowsService: WorkflowsService,
    private readonly memberIdGenerationService: MemberIdGenerationService,
  ) {}

  async createMember(data: {
    firstName: string;
    lastName: string;
    email: string;
    userId: string;
    branchId?: string;
    organisationId?: string;
  }): Promise<Member> {
    try {
      const existing = await this.prisma.member.findFirst({
        where: { OR: [{ email: data.email }, { userId: data.userId }] },
      });

      if (existing) {
        this.logger.warn(
          `Attempted to create a duplicate member for email: ${data.email} or userId: ${data.userId}`,
        );
        throw new ConflictException(
          'A member with this email or user ID already exists.',
        );
      }

      // Generate Member ID for the new member
      let memberId: string | undefined;
      if (data.organisationId && data.branchId) {
        try {
          memberId = await this.memberIdGenerationService.generateMemberId(
            data.organisationId,
            data.branchId,
          );
          this.logger.log(
            `Generated Member ID: ${memberId} for ${data.firstName} ${data.lastName}`,
          );
        } catch (error) {
          this.logger.warn(`Failed to generate Member ID: ${error.message}`);
          // Continue without Member ID - can be generated later
        }
      }

      const member = await this.prisma.member.create({
        data: {
          ...data,
          memberId,
          memberIdGeneratedAt: memberId ? new Date() : undefined,
          status: MemberStatus.ACTIVE,
          gender: 'MALE',
        },
      });

      await this.auditLogService.create({
        action: 'CREATE',
        entityType: 'Member',
        entityId: member.id,
        description: `Created member: ${member.firstName} ${member.lastName} via user creation flow.`,
        userId: data.userId,
      });

      // Trigger workflow automation for new member
      try {
        await this.workflowsService.triggerWorkflow({
          workflowId: 'MEMBER_CREATED_WORKFLOW_ID', // TODO: replace with actual workflow ID
          targetMemberId: member.id,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to trigger member created workflow for member ${member.id}: ${error.message}`,
        );
      }

      return member as unknown as Member;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(
        `Error creating member for user ${data.userId}: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async create(
    createMemberInput: CreateMemberInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Member> {
    try {
      // Fetch branch code
      let branchCode = 'XXX';
      if (createMemberInput.branchId) {
        const branch = await this.prisma.branch.findUnique({
          where: { id: createMemberInput.branchId },
          select: { id: true, name: true },
        });
        if (branch) {
          branchCode = branch.name.slice(0, 3).toUpperCase();
        }
      }

      // Generate a unique RFID Card ID with retry logic
      const prefix = 'M';
      const year = new Date().getFullYear();
      let rfidCardId: string | null;
      let attempt = 0;
      const maxAttempts = 5;
      while (true) {
        // Find the highest numeric member id (simulate incremental id)
        let lastMemberCount = 0;
        if (createMemberInput.branchId) {
          lastMemberCount = await this.prisma.member.count({
            where: { branchId: createMemberInput.branchId },
          });
        } else {
          lastMemberCount = await this.prisma.member.count();
        }

        const nextId = lastMemberCount + 1;
        rfidCardId = `${prefix}${year}${branchCode}${nextId.toString().padStart(4, '0')}`;

        // Check if this RFID card ID already exists
        const existingMember = await this.prisma.member.findUnique({
          where: { memberId: rfidCardId },
        });

        if (!existingMember) {
          break; // Unique ID found
        }

        attempt++;
        if (attempt >= maxAttempts) {
          this.logger.warn(
            `Failed to generate unique RFID card ID after ${maxAttempts} attempts`,
          );
          rfidCardId = null; // Don't assign RFID if we can't generate unique one
          break;
        }
      }

      // Extract relation IDs and other problematic fields for proper handling
      const { organisationId, branchId, parentId, spouseId, ...memberData } =
        createMemberInput;

      // Create the member with enhanced fields and proper defaults
      const member = await this.prisma.member.create({
        data: {
          ...memberData,
          memberId: rfidCardId,
          // Set audit fields
          createdBy: userId,
          lastModifiedBy: userId,
          // Connect to organisation and branch if provided
          ...(organisationId && {
            organisation: {
              connect: { id: organisationId },
            },
          }),
          ...(branchId && {
            branch: {
              connect: { id: branchId },
            },
          }),
          // Connect to parent if provided
          ...(parentId && {
            parent: {
              connect: { id: parentId },
            },
          }),
          // Connect to spouse if provided
          ...(spouseId && {
            spouse: {
              connect: { id: spouseId },
            },
          }),
          // Set GDPR compliance defaults if not provided
          consentDate: createMemberInput.consentDate || new Date(),
          consentVersion: createMemberInput.consentVersion || '1.0',
          // Create supporting records
          communicationPrefs: {
            create: {
              emailEnabled: true,
              emailNewsletter: true,
              emailEvents: true,
              emailReminders: true,
              emailPrayer: true,
              smsEnabled: false,
              smsEvents: false,
              smsReminders: false,
              smsEmergency: true,
              phoneCallsEnabled: true,
              phoneEmergency: true,
              physicalMail: true,
              pushNotifications: true,
              doNotDisturbDays: [],
            },
          },
          searchIndex: {
            create: {
              fullName: [
                createMemberInput.firstName,
                createMemberInput.middleName,
                createMemberInput.lastName,
              ]
                .filter(Boolean)
                .join(' '),
              searchName: [
                createMemberInput.firstName,
                createMemberInput.middleName,
                createMemberInput.lastName,
              ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase(),
              phoneNumbers: [
                createMemberInput.phoneNumber,
                createMemberInput.alternatePhone,
              ].filter((phone): phone is string => Boolean(phone)),
              emails: [
                createMemberInput.email,
                (createMemberInput as any).alternativeEmail,
              ].filter((email): email is string => Boolean(email)),
              addresses: [
                [
                  createMemberInput.address,
                  (createMemberInput as any).addressLine2,
                  createMemberInput.city,
                  createMemberInput.state,
                  createMemberInput.postalCode,
                  createMemberInput.country,
                  (createMemberInput as any).district,
                  (createMemberInput as any).region,
                  (createMemberInput as any).digitalAddress,
                  (createMemberInput as any).landmark,
                ]
                  .filter(Boolean)
                  .join(', '),
              ].filter(Boolean),
              tags: [],
              searchRank: 1.0,
            },
          },
          memberAnalytics: {
            create: {
              totalAttendances: 0,
              attendanceRate: 0.0,
              attendanceStreak: 0,
              totalContributions: 0.0,
              engagementScore: 0.0,
              engagementLevel: 'NEW',
              ministriesCount: 0,
              leadershipRoles: 0,
              volunteerHours: 0.0,
              emailOpenRate: 0.0,
              smsResponseRate: 0.0,
              membershipDuration: createMemberInput.membershipDate
                ? Math.floor(
                    (Date.now() -
                      new Date(createMemberInput.membershipDate).getTime()) /
                      (1000 * 60 * 60 * 24),
                  )
                : null,
              ageGroup: this.calculateAgeGroup(createMemberInput.dateOfBirth),
            },
          },
        },
        include: {
          communicationPrefs: true,
          searchIndex: true,
          memberAnalytics: true,
          branch: true,
        },
      });

      // Create membership history record
      if (createMemberInput.membershipStatus) {
        await this.prisma.membershipHistory.create({
          data: {
            memberId: member.id,
            toStatus: createMemberInput.membershipStatus,
            changeReason: 'Initial member creation',
            approvedBy: userId,
          },
        });
      }

      await this.auditLogService.create({
        action: 'CREATE',
        entityType: 'Member',
        entityId: member.id,
        description: `Created member: ${member.firstName} ${member.lastName}`,
        userId: userId || '5453df9a-003a-4319-a532-84b527b9e285', // Use super_admin as fallback
        ipAddress,
        userAgent,
      });

      // Trigger workflow automation for new member
      try {
        await this.workflowsService.triggerWorkflow({
          workflowId: 'MEMBER_CREATED_WORKFLOW_ID', // TODO: replace with actual workflow ID
          targetMemberId: member.id,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to trigger member created workflow for member ${member.id}: ${error.message}`,
        );
      }

      return member as unknown as Member;
    } catch (error) {
      this.logger.error(
        `Error creating member: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateMemberInput: UpdateMemberInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Member> {
    try {
      // Check if member exists
      const existingMember = await this.prisma.member.findUnique({
        where: { id },
        include: {
          searchIndex: true,
          memberAnalytics: true,
        },
      });

      if (!existingMember) {
        throw new NotFoundException(`Member with ID ${id} not found`);
      }

      // Track status changes for membership history
      const statusChanged =
        updateMemberInput.membershipStatus &&
        updateMemberInput.membershipStatus !== existingMember.membershipStatus;

      // Extract relation fields that need special handling (excluding id from input)
      const {
        id: inputId,
        branchId,
        organisationId,
        groupIds,
        ...memberData
      } = updateMemberInput as any;

      // Filter out undefined values and prepare update data
      const cleanMemberData = Object.fromEntries(
        Object.entries(memberData).filter(([_, value]) => value !== undefined),
      );

      // Prepare update data with proper relation handling
      const updateData: any = {
        ...cleanMemberData,
      };

      // Ensure status is always provided - use input status or default to ACTIVE
      updateData.status = updateMemberInput.status || 'ACTIVE';

      // Only add lastModifiedBy if userId is provided
      if (userId) {
        updateData.lastModifiedBy = userId;
      }

      // Handle branch relation if branchId is provided
      if (branchId) {
        updateData.branch = {
          connect: { id: branchId },
        };
      }

      // Handle organisation relation if organisationId is provided
      if (organisationId) {
        updateData.organisation = {
          connect: { id: organisationId },
        };
      }

      // Handle group memberships if groupIds is provided
      if (groupIds && Array.isArray(groupIds)) {
        // First, disconnect all existing group memberships
        await this.prisma.groupMember.deleteMany({
          where: { memberId: id },
        });

        // Then create new group memberships
        if (groupIds.length > 0) {
          updateData.groupMemberships = {
            create: groupIds.map((groupId: string) => ({
              smallGroup: {
                connect: { id: groupId },
              },
              role: 'MEMBER', // Default role
              joinDate: new Date(),
              status: 'ACTIVE', // Required status field for GroupMember
            })),
          };
        }
      }

      // Update member with enhanced fields
      const updatedMember = await this.prisma.member.update({
        where: { id },
        data: updateData,
        include: {
          communicationPrefs: true,
          searchIndex: true,
          memberAnalytics: true,
          membershipHistory: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          branch: true,
          groupMemberships: {
            include: {
              smallGroup: {
                include: {
                  ministry: true,
                },
              },
            },
          },
        },
      });

      // Update search index if relevant fields changed
      if (
        updateMemberInput.firstName ||
        updateMemberInput.middleName ||
        updateMemberInput.lastName ||
        updateMemberInput.phoneNumber ||
        updateMemberInput.alternatePhone ||
        updateMemberInput.email ||
        (updateMemberInput as any).alternativeEmail ||
        updateMemberInput.address ||
        (updateMemberInput as any).addressLine2 ||
        updateMemberInput.city ||
        updateMemberInput.state ||
        updateMemberInput.postalCode ||
        updateMemberInput.country ||
        (updateMemberInput as any).district ||
        (updateMemberInput as any).region ||
        (updateMemberInput as any).digitalAddress ||
        (updateMemberInput as any).landmark
      ) {
        await this.prisma.memberSearchIndex.update({
          where: { memberId: id },
          data: {
            fullName: [
              updatedMember.firstName,
              updatedMember.middleName,
              updatedMember.lastName,
            ]
              .filter(Boolean)
              .join(' '),
            searchName: [
              updatedMember.firstName,
              updatedMember.middleName,
              updatedMember.lastName,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase(),
            phoneNumbers: [
              updatedMember.phoneNumber,
              updatedMember.alternatePhone,
            ].filter((phone): phone is string => Boolean(phone)),
            emails: [
              updatedMember.email,
              (updatedMember as any).alternativeEmail,
            ].filter((email): email is string => Boolean(email)),
            addresses: [
              [
                updatedMember.address,
                (updatedMember as any).addressLine2,
                updatedMember.city,
                updatedMember.state,
                updatedMember.postalCode,
                updatedMember.country,
                (updatedMember as any).district,
                (updatedMember as any).region,
                (updatedMember as any).digitalAddress,
                (updatedMember as any).landmark,
              ]
                .filter(Boolean)
                .join(', '),
            ].filter(Boolean),
          },
        });
      }

      // Update member analytics if age-related fields changed
      if (updateMemberInput.dateOfBirth) {
        await this.prisma.memberAnalytics.update({
          where: { memberId: id },
          data: {
            ageGroup: this.calculateAgeGroup(updateMemberInput.dateOfBirth),
          },
        });
      }

      // Create membership history record if status changed
      if (statusChanged) {
        await this.prisma.membershipHistory.create({
          data: {
            memberId: id,
            fromStatus: existingMember.membershipStatus,
            toStatus: updateMemberInput.membershipStatus!,
            changeReason: 'Member profile update',
            approvedBy: userId,
          },
        });
      }

      // Log the action
      await this.auditLogService.create({
        action: 'UPDATE',
        entityType: 'Member',
        entityId: updatedMember.id,
        description: `Updated member: ${updatedMember.firstName} ${updatedMember.lastName}`,
        userId: userId || '5453df9a-003a-4319-a532-84b527b9e285', // Use super_admin as fallback
        ipAddress,
        userAgent,
      });

      // Trigger workflow automation for member update
      try {
        await this.workflowsService.triggerWorkflow({
          workflowId: 'MEMBER_UPDATED_WORKFLOW_ID', // TODO: replace with actual workflow ID
          targetMemberId: updatedMember.id,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to trigger member updated workflow for member ${updatedMember.id}: ${error.message}`,
        );
      }

      return updatedMember as unknown as Member;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error updating member: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async updateMemberStatus(
    id: string,
    status: MemberStatus,
    reason?: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Member> {
    try {
      // Check if member exists
      const member = await this.prisma.member.findUnique({
        where: { id },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${id} not found`);
      }

      // Update member status
      const updatedMember = await this.prisma.member.update({
        where: { id },
        data: {
          status,
          statusChangeDate: new Date(),
          statusChangeReason: reason,
        },
        include: {
          branch: true,
          spouse: true,
          parent: true,
          children: true,
          spiritualMilestones: true,
          families: true,
          prayerRequests: true,
          contributions: true,
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'UPDATE_STATUS',
        entityType: 'Member',
        entityId: id,
        description: `Updated member status: ${member.firstName} ${member.lastName} to ${status}`,
        userId: userId || '5453df9a-003a-4319-a532-84b527b9e285', // Use super_admin as fallback
        ipAddress,
        userAgent,
      });

      // Trigger workflow automation for member status update
      try {
        await this.workflowsService.triggerWorkflow({
          workflowId: 'MEMBER_STATUS_UPDATED_WORKFLOW_ID', // TODO: replace with actual workflow ID
          targetMemberId: updatedMember.id,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to trigger member status updated workflow for member ${updatedMember.id}: ${error.message}`,
        );
      }

      return updatedMember as unknown as Member;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error updating member status: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async count(where?: Prisma.MemberWhereInput): Promise<number> {
    try {
      return await this.prisma.member.count({ where });
    } catch (error) {
      this.logger.error(
        `Error counting members: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async assignRfidCard(
    assignRfidCardInput: AssignRfidCardInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Member> {
    const { memberId, rfidCardId } = assignRfidCardInput;
    this.logger.log(
      `Attempting to assign RFID card ${rfidCardId} to member ${memberId}`,
    );

    try {
      // Check if member exists
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${memberId} not found`);
      }

      // Check if RFID card ID is already in use by another member
      const existingCardUser = await this.prisma.member.findFirst({
        where: {
          memberId: rfidCardId,
          NOT: {
            id: memberId, // Exclude the current member from this check
          },
        },
      });

      if (existingCardUser) {
        throw new ConflictException(
          `RFID card ID ${rfidCardId} is already assigned to another member (ID: ${existingCardUser.id})`,
        );
      }

      // Assign RFID card
      const updatedMember = await this.prisma.member.update({
        where: { id: memberId },
        data: {
          memberId: rfidCardId,
        },
        include: {
          branch: true,
          spouse: true,
          parent: true,
          children: true,
          spiritualMilestones: true,
          families: true,
          prayerRequests: true,
          contributions: true,
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'ASSIGN_RFID_CARD',
        entityType: 'Member',
        entityId: memberId,
        description: `Assigned RFID card ID ${rfidCardId} to member ${member.firstName} ${member.lastName}`,
        userId: userId || '5453df9a-003a-4319-a532-84b527b9e285', // Use super_admin as fallback
        ipAddress,
        userAgent,
      });

      return updatedMember as unknown as Member;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `Error assigning RFID card: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async removeRfidCard(
    memberId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Member> {
    this.logger.log(`Attempting to remove RFID card from member ${memberId}`);
    try {
      // Check if member exists
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${memberId} not found`);
      }

      if (!member.memberId) {
        this.logger.warn(
          `Member ${memberId} does not have an RFID card assigned.`,
        );
        return member as unknown as Member; // Or throw an error if preferred
      }

      // Remove RFID card
      const updatedMember = await this.prisma.member.update({
        where: { id: memberId },
        data: {
          memberId: null,
        },
        include: {
          branch: true,
          spouse: true,
          parent: true,
          children: true,
          spiritualMilestones: true,
          families: true,
          prayerRequests: true,
          contributions: true,
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'REMOVE_RFID_CARD',
        entityType: 'Member',
        entityId: memberId,
        description: `Removed RFID card ID ${member.memberId} from member ${member.firstName} ${member.lastName}`,
        userId: userId || '5453df9a-003a-4319-a532-84b527b9e285', // Use super_admin as fallback
        ipAddress,
        userAgent,
      });

      return updatedMember as unknown as Member;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error removing RFID card: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findMemberByRfidCard(rfidCardId: string): Promise<Member | null> {
    this.logger.log(`Attempting to find member by RFID card ID ${rfidCardId}`);
    try {
      const member = await this.prisma.member.findUnique({
        where: { memberId: rfidCardId },
        include: {
          branch: true,
          spouse: true,
          parent: true,
          children: true,
          spiritualMilestones: true,
          families: true,
          familyRelationships: {
            include: {
              member: true,
              relatedMember: true,
              family: true,
            },
          },
          groupMemberships: {
            include: {
              ministry: true,
              smallGroup: true,
            },
          },
          attendanceRecords: true,
          sacramentalRecords: true,
          guardianProfile: true,
          notifications: true,
          prayerRequests: true,
          contributions: true,
        },
      });

      if (!member) {
        this.logger.log(`No member found with RFID card ID ${rfidCardId}`);
        return null;
      }

      return member as unknown as Member;
    } catch (error) {
      this.logger.error(
        `Error finding member by RFID card ID: ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Depending on policy, you might want to throw specific errors or just return null
      // For a 'find' operation, returning null on error (or not found) is often acceptable.
      return null;
    }
  }

  async getStatistics(
    branchId?: string,
    organisationId?: string,
  ): Promise<MemberStatistics> {
    const baseWhere: Prisma.MemberWhereInput = {
      isDeactivated: false,
    };

    if (branchId) {
      baseWhere.branchId = branchId;
    } else if (organisationId) {
      baseWhere.organisationId = organisationId;
    }

    const getStatsForPeriod = async (
      periodWhere: Prisma.MemberWhereInput,
      startDate: Date,
      endDate: Date,
    ): Promise<MemberStatisticsPeriod> => {
      const totalMembersPromise = this.count(periodWhere);

      const activeMembersPromise = this.count({
        ...periodWhere,
        membershipStatus: 'ACTIVE_MEMBER',
      });

      const inactiveMembersPromise = this.count({
        ...periodWhere,
        membershipStatus: 'INACTIVE_MEMBER',
      });

      const newMembersInPeriodPromise = this.count({
        ...periodWhere,
        membershipDate: {
          gte: startDate,
          lte: endDate,
        },
      });

      const visitorsInPeriodPromise = this.count({
        ...periodWhere,
        membershipStatus: {
          in: ['VISITOR'],
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      });

      const [
        totalMembers,
        activeMembers,
        inactiveMembers,
        newMembersInPeriod,
        visitorsInPeriod,
      ] = await Promise.all([
        totalMembersPromise,
        activeMembersPromise,
        inactiveMembersPromise,
        newMembersInPeriodPromise,
        visitorsInPeriodPromise,
      ]);

      return {
        totalMembers,
        activeMembers,
        inactiveMembers,
        newMembersInPeriod,
        visitorsInPeriod,
      };
    };

    // Current month
    const currentDate = new Date();
    const currentMonthStartDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const currentMonthEndDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Previous month
    const prevMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    const prevMonthStartDate = new Date(
      prevMonthDate.getFullYear(),
      prevMonthDate.getMonth(),
      1,
    );
    const prevMonthEndDate = new Date(
      prevMonthDate.getFullYear(),
      prevMonthDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const currentMonthStatsPromise = getStatsForPeriod(
      baseWhere,
      currentMonthStartDate,
      currentMonthEndDate,
    );
    const lastMonthStatsPromise = getStatsForPeriod(
      baseWhere,
      prevMonthStartDate,
      prevMonthEndDate,
    );

    // Calculate additional statistics
    const genderStatsPromise = this.getGenderDistribution(baseWhere);
    const averageAgePromise = this.calculateAverageAge(baseWhere);
    const ageGroupsPromise = this.getAgeGroups(baseWhere);
    const statusDistributionPromise =
      this.getMemberStatusDistribution(baseWhere);
    const membershipStatusDistributionPromise =
      this.getMembershipStatusDistribution(baseWhere);

    const [
      currentMonthStats,
      lastMonthStats,
      genderStats,
      averageAge,
      ageGroups,
      membersByStatus,
      membersByMembershipStatus,
    ] = await Promise.all([
      currentMonthStatsPromise,
      lastMonthStatsPromise,
      genderStatsPromise,
      averageAgePromise,
      ageGroupsPromise,
      statusDistributionPromise,
      membershipStatusDistributionPromise,
    ]);

    // Calculate growth rate
    const growthRate =
      lastMonthStats.totalMembers > 0
        ? ((currentMonthStats.totalMembers - lastMonthStats.totalMembers) /
            lastMonthStats.totalMembers) *
          100
        : 0;

    // Calculate retention rate (simplified - active members / total members)
    const retentionRate =
      currentMonthStats.totalMembers > 0
        ? (currentMonthStats.activeMembers / currentMonthStats.totalMembers) *
          100
        : 0;

    // Calculate conversion rate (new members / visitors)
    const conversionRate =
      currentMonthStats.visitorsInPeriod > 0
        ? (currentMonthStats.newMembersInPeriod /
            currentMonthStats.visitorsInPeriod) *
          100
        : 0;

    return {
      ...currentMonthStats,
      growthRate,
      retentionRate,
      conversionRate,
      averageAge,
      genderDistribution: genderStats,
      ageGroups,
      lastMonth: lastMonthStats,
      membersByStatus,
      membersByMembershipStatus,
    };
  }

  private async getGenderDistribution(
    whereClause: Prisma.MemberWhereInput,
  ): Promise<GenderDistribution> {
    const [maleCount, femaleCount, otherCount] = await Promise.all([
      this.count({ ...whereClause, gender: 'MALE' }),
      this.count({ ...whereClause, gender: 'FEMALE' }),
      this.count({ ...whereClause, gender: 'UNKNOWN' as any }),
    ]);

    const total = maleCount + femaleCount + otherCount;

    return {
      maleCount,
      femaleCount,
      otherCount,
      malePercentage: total > 0 ? (maleCount / total) * 100 : 0,
      femalePercentage: total > 0 ? (femaleCount / total) * 100 : 0,
      otherPercentage: total > 0 ? (otherCount / total) * 100 : 0,
    };
  }

  private async calculateAverageAge(
    whereClause: Prisma.MemberWhereInput,
  ): Promise<number> {
    const members = await this.prisma.member.findMany({
      where: {
        ...whereClause,
        dateOfBirth: {
          not: null,
        },
      },
      select: {
        dateOfBirth: true,
      },
    });

    if (members.length === 0) return 0;

    const totalAge = members.reduce((sum, member) => {
      if (member.dateOfBirth) {
        const age =
          new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();
        return sum + age;
      }
      return sum;
    }, 0);

    return totalAge / members.length;
  }

  private async getAgeGroups(
    whereClause: Prisma.MemberWhereInput,
  ): Promise<MemberAgeGroup[]> {
    const members = await this.prisma.member.findMany({
      where: {
        ...whereClause,
        dateOfBirth: {
          not: null,
        },
      },
      select: {
        dateOfBirth: true,
      },
    });

    const ageGroups = {
      '0-14': 0,
      '15-40': 0,
      '41-59': 0,
      '60+': 0,
    };

    members.forEach((member) => {
      if (member.dateOfBirth) {
        const age =
          new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();
        if (age >= 0 && age <= 14) {
          ageGroups['0-14']++;
        } else if (age >= 15 && age <= 40) {
          ageGroups['15-40']++;
        } else if (age >= 41 && age <= 59) {
          ageGroups['41-59']++;
        } else if (age >= 60) {
          ageGroups['60+']++;
        }
      }
    });

    const total = Object.values(ageGroups).reduce(
      (sum, count) => sum + count,
      0,
    );

    return Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }

  private async getMemberStatusDistribution(
    whereClause: Prisma.MemberWhereInput,
  ): Promise<MemberStatusDistribution[]> {
    const totalMembers = await this.count(whereClause);
    if (totalMembers === 0) return [];

    const statusCounts = await this.prisma.member.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    return statusCounts.map((item) => ({
      status: item.status,
      count: item._count.id,
      percentage: (item._count.id / totalMembers) * 100,
    }));
  }

  private async getMembershipStatusDistribution(
    whereClause: Prisma.MemberWhereInput,
  ): Promise<MemberMembershipStatusDistribution[]> {
    const totalMembers = await this.count(whereClause);
    if (totalMembers === 0) return [];

    const statusCounts = await this.prisma.member.groupBy({
      by: ['membershipStatus'],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    return statusCounts.map((item) => ({
      status: item.membershipStatus,
      count: item._count.id,
      percentage: (item._count.id / totalMembers) * 100,
    }));
  }

  async getMemberDashboard(memberId: string): Promise<MemberDashboard> {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: {
        groupMemberships: {
          include: {
            ministry: true,
            smallGroup: true,
          },
        },
        spiritualMilestones: true,
        branch: true,
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Stats
    const groupCount = member.groupMemberships.length;

    const totalSessions = await this.prisma.attendanceSession.count({
      where: { branchId: member.branchId },
    });
    const attendanceRecords = await this.prisma.attendanceRecord.count({
      where: { memberId: memberId },
    });
    const attendanceRate =
      totalSessions > 0 ? (attendanceRecords / totalSessions) * 100 : 0;

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const totalGiving = await this.prisma.contribution.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        memberId: memberId,
        date: { gte: startOfYear },
      },
    });

    // Upcoming Events
    const upcomingEvents = await this.prisma.event.findMany({
      where: {
        branchId: member.branchId,
        startDate: { gte: new Date() },
      },
      orderBy: {
        startDate: 'asc',
      },
      take: 5,
    });

    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      profileImageUrl: member.profileImageUrl ?? undefined,
      membershipStatus: member.status,
      membershipDate: member.membershipDate ?? undefined,
      stats: {
        groups: groupCount,
        attendance: attendanceRate,
        giving: `GHS${totalGiving._sum.amount?.toFixed(2) || '0.00'}`,
      },
      upcomingEvents: upcomingEvents.map((e) => ({
        id: e.id,
        name: e.title,
        date: e.startDate,
        location: e.location || 'TBD',
      })),
      groups: member.groupMemberships.map((gm) => ({
        id: gm.id,
        name: gm.ministry?.name || gm.smallGroup?.name || 'Unknown Group',
        role: gm.role,
      })),
      milestones: {
        baptismDate: member.baptismDate ?? undefined,
        confirmationDate: member.confirmationDate ?? undefined,
      },
    };
  }

  async remove(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    try {
      const member = await this.prisma.member.findUnique({ where: { id } });
      if (!member) {
        throw new NotFoundException(`Member with ID ${id} not found`);
      }

      // Deactivate member
      await this.prisma.member.update({
        where: { id },
        data: {
          isDeactivated: true,
          deactivatedAt: new Date(),
          deactivatedBy: userId,
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'DEACTIVATE',
        entityType: 'Member',
        entityId: id,
        description: `Deactivated member: ${member.firstName} ${member.lastName}`,
        userId: userId || 'system',
        ipAddress,
        userAgent,
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Error deactivating member ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async transferMember(
    memberId: string,
    fromBranchId: string,
    toBranchId: string,
    reason?: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Member> {
    try {
      // Check if member exists
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${memberId} not found`);
      }

      // Check if source branch exists
      const fromBranch = await this.prisma.branch.findUnique({
        where: { id: fromBranchId },
      });

      if (!fromBranch) {
        throw new NotFoundException(
          `Source branch with ID ${fromBranchId} not found`,
        );
      }

      // Check if destination branch exists
      const toBranch = await this.prisma.branch.findUnique({
        where: { id: toBranchId },
      });

      if (!toBranch) {
        throw new NotFoundException(
          `Destination branch with ID ${toBranchId} not found`,
        );
      }

      // Transfer member
      const updatedMember = await this.prisma.member.update({
        where: { id: memberId },
        data: {
          branchId: toBranchId,
        },
        include: {
          branch: true,
          spouse: true,
          parent: true,
          children: true,
          spiritualMilestones: true,
          families: true,
          prayerRequests: true,
          contributions: true,
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'TRANSFER',
        entityType: 'Member',
        entityId: memberId,
        description: `Transferred member ${member.firstName} ${member.lastName} from branch ${fromBranch.name} to ${toBranch.name}`,
        userId: userId || '5453df9a-003a-4319-a532-84b527b9e285', // Use super_admin as fallback
        ipAddress,
        userAgent,
      });

      return updatedMember as unknown as Member;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error transferring member: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async addMemberToBranch(
    memberId: string,
    branchId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Member> {
    try {
      // Check if member exists
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${memberId} not found`);
      }

      // Check if branch exists
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
      });

      if (!branch) {
        throw new NotFoundException(`Branch with ID ${branchId} not found`);
      }

      // Update member with branch
      const updatedMember = await this.prisma.member.update({
        where: { id: memberId },
        data: {
          branchId: branchId,
        },
        include: {
          branch: true,
          spouse: true,
          parent: true,
          children: true,
          spiritualMilestones: true,
          families: true,
          prayerRequests: true,
          contributions: true,
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'ADD_TO_BRANCH',
        entityType: 'Member',
        entityId: memberId,
        description: `Added member ${member.firstName} ${member.lastName} to branch ${branch.name}`,
        userId: userId || '5453df9a-003a-4319-a532-84b527b9e285', // Use super_admin as fallback
        ipAddress,
        userAgent,
        branchId,
      });

      return updatedMember as unknown as Member;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error adding member to branch: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async removeMemberFromBranch(
    memberId: string,
    branchId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Member> {
    try {
      // Check if member exists
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${memberId} not found`);
      }

      // Check if branch exists
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
      });

      if (!branch) {
        throw new NotFoundException(`Branch with ID ${branchId} not found`);
      }

      // Remove branch from member
      const updatedMember = await this.prisma.member.update({
        where: { id: memberId },
        data: {
          branchId: null,
        },
        include: {
          branch: true,
          spouse: true,
          parent: true,
          children: true,
          spiritualMilestones: true,
          families: true,
          prayerRequests: true,
          contributions: true,
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'REMOVE_FROM_BRANCH',
        entityType: 'Member',
        entityId: memberId,
        description: `Removed member ${member.firstName} ${member.lastName} from branch ${branch.name}`,
        userId: userId || '5453df9a-003a-4319-a532-84b527b9e285', // Use super_admin as fallback
        ipAddress,
        userAgent,
        branchId,
      });

      return updatedMember as unknown as Member;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error removing member from branch: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  // Communication Preferences Management
  async updateCommunicationPrefs(
    memberId: string,
    prefsData: any,
    userId?: string,
  ): Promise<any> {
    try {
      const updatedPrefs = await this.prisma.communicationPrefs.upsert({
        where: { memberId },
        update: {
          ...prefsData,
        },
        create: {
          memberId,
          ...prefsData,
        },
      });

      await this.auditLogService.create({
        action: 'UPDATE',
        entityType: 'CommunicationPrefs',
        entityId: updatedPrefs.id,
        description: `Updated communication preferences for member ${memberId}`,
        userId: userId || '5453df9a-003a-4319-a532-84b527b9e285', // Use super_admin as fallback
      });

      return updatedPrefs;
    } catch (error) {
      this.logger.error(
        `Error updating communication preferences: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  // Member Relationships Management
  async createMemberRelationship(
    relationshipData: any,
    userId?: string,
  ): Promise<any> {
    try {
      const relationship = await this.prisma.memberRelationship.create({
        data: {
          ...relationshipData,
          createdBy: userId,
        },
        include: {
          primaryMember: {
            select: { id: true, firstName: true, lastName: true },
          },
          relatedMember: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });

      await this.auditLogService.create({
        action: 'CREATE',
        entityType: 'MemberRelationship',
        entityId: relationship.id,
        description: `Created relationship between ${relationship.primaryMember.firstName} ${relationship.primaryMember.lastName} and ${relationship.relatedMember.firstName} ${relationship.relatedMember.lastName}`,
        userId: userId || '5453df9a-003a-4319-a532-84b527b9e285', // Use super_admin as fallback
      });

      return relationship;
    } catch (error) {
      this.logger.error(
        `Error creating member relationship: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async updateMemberRelationship(
    id: string,
    relationshipData: any,
    userId?: string,
  ): Promise<any> {
    try {
      const relationship = await this.prisma.memberRelationship.update({
        where: { id },
        data: {
          ...relationshipData,
          lastModifiedBy: userId,
          lastModifiedAt: new Date(),
        },
        include: {
          primaryMember: {
            select: { id: true, firstName: true, lastName: true },
          },
          relatedMember: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });

      await this.auditLogService.create({
        action: 'UPDATE',
        entityType: 'MemberRelationship',
        entityId: relationship.id,
        description: `Updated relationship between ${relationship.primaryMember.firstName} ${relationship.primaryMember.lastName} and ${relationship.relatedMember.firstName} ${relationship.relatedMember.lastName}`,
        userId: userId || '5453df9a-003a-4319-a532-84b527b9e285', // Use super_admin as fallback
      });

      return relationship;
    } catch (error) {
      this.logger.error(
        `Error updating member relationship: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async deleteMemberRelationship(
    id: string,
    userId?: string,
  ): Promise<boolean> {
    try {
      const relationship = await this.prisma.memberRelationship.findUnique({
        where: { id },
        include: {
          primaryMember: {
            select: { id: true, firstName: true, lastName: true },
          },
          relatedMember: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });

      if (!relationship) {
        throw new NotFoundException(`Relationship with ID ${id} not found`);
      }

      await this.prisma.memberRelationship.delete({
        where: { id },
      });

      await this.auditLogService.create({
        action: 'DELETE',
        entityType: 'MemberRelationship',
        entityId: id,
        description: `Deleted relationship between ${relationship.primaryMember.firstName} ${relationship.primaryMember.lastName} and ${relationship.relatedMember.firstName} ${relationship.relatedMember.lastName}`,
        userId: userId || '5453df9a-003a-4319-a532-84b527b9e285', // Use super_admin as fallback
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Error deleting member relationship: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  // Membership History Management
  async createMembershipHistoryEntry(
    historyData: any,
    userId?: string,
  ): Promise<any> {
    try {
      const historyEntry = await this.prisma.membershipHistory.create({
        data: {
          ...historyData,
          approvedBy: userId,
        },
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true },
          },
          fromBranch: {
            select: { id: true, name: true },
          },
          toBranch: {
            select: { id: true, name: true },
          },
        },
      });

      await this.auditLogService.create({
        action: 'CREATE',
        entityType: 'MembershipHistory',
        entityId: historyEntry.id,
        description: `Created membership history entry for ${historyEntry.member.firstName} ${historyEntry.member.lastName}: ${historyEntry.fromStatus || 'NEW'} → ${historyEntry.toStatus}`,
        userId: userId || '5453df9a-003a-4319-a532-84b527b9e285', // Use super_admin as fallback
      });

      return historyEntry;
    } catch (error) {
      this.logger.error(
        `Error creating membership history entry: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  // Enhanced Member Search with new search index
  async searchMembers(
    query: string,
    filters?: {
      branchId?: string;
      membershipStatus?: string;
      ageGroup?: string;
      gender?: string;
      includeDeactivated?: boolean;
    },
    skip = 0,
    take = 20,
  ): Promise<Member[]> {
    try {
      const searchResults = await this.prisma.memberSearchIndex.findMany({
        where: {
          OR: [
            { searchName: { contains: query.toLowerCase() } },
            { phoneNumbers: { hasSome: [query] } },
            { emails: { hasSome: [query] } },
            { addresses: { hasSome: [query] } },
            { tags: { hasSome: [query.toLowerCase()] } },
          ],
          member: {
            ...(filters?.branchId && { branchId: filters.branchId }),
            ...(filters?.membershipStatus && {
              membershipStatus: filters.membershipStatus as any,
            }),
            ...(filters?.gender && { gender: filters.gender as any }),
            // Exclude deactivated members by default, unless explicitly requested
            ...(!filters?.includeDeactivated && { isDeactivated: false }),
            deletedAt: null, // Exclude soft-deleted members
          },
        },
        include: {
          member: {
            include: {
              branch: true,
              communicationPrefs: true,
              memberAnalytics: true,
            },
          },
        },
        orderBy: [{ searchRank: 'desc' }],
        skip,
        take,
      });

      return searchResults.map(
        (result) => result.member,
      ) as unknown as Member[];
    } catch (error) {
      this.logger.error(
        `Error searching members: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  // Member Analytics and Engagement
  async updateMemberAnalytics(
    memberId: string,
    analyticsData: Partial<any>,
    userId?: string,
  ): Promise<any> {
    try {
      const updatedAnalytics = await this.prisma.memberAnalytics.upsert({
        where: { memberId },
        update: {
          ...analyticsData,
        },
        create: {
          memberId,
          ...analyticsData,
          totalAttendances: analyticsData.totalAttendances || 0,
          attendanceRate: analyticsData.attendanceRate || 0.0,
          attendanceStreak: analyticsData.attendanceStreak || 0,
          totalContributions: analyticsData.totalContributions || 0.0,
          engagementScore: analyticsData.engagementScore || 0.0,
          engagementLevel: analyticsData.engagementLevel || 'NEW',
          ministriesCount: analyticsData.ministriesCount || 0,
          leadershipRoles: analyticsData.leadershipRoles || 0,
          volunteerHours: analyticsData.volunteerHours || 0.0,
          emailOpenRate: analyticsData.emailOpenRate || 0.0,
          smsResponseRate: analyticsData.smsResponseRate || 0.0,
        },
      });

      return updatedAnalytics;
    } catch (error) {
      this.logger.error(
        `Error updating member analytics: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  private calculateAgeGroup(dateOfBirth?: Date): string {
    if (!dateOfBirth) return 'ADULT';

    const age = Math.floor(
      (Date.now() - new Date(dateOfBirth).getTime()) /
        (1000 * 60 * 60 * 24 * 365),
    );

    if (age < 13) return 'CHILD';
    if (age < 18) return 'YOUTH';
    if (age >= 65) return 'SENIOR';
    return 'ADULT';
  }

  async findAll(
    skip = 0,
    take = 10,
    where?: Prisma.MemberWhereInput,
    orderBy?: Prisma.MemberOrderByWithRelationInput,
    search?: string,
  ): Promise<Member[]> {
    try {
      let queryConditions: Prisma.MemberWhereInput = where || {};

      if (search && search.trim().length > 0) {
        const searchTerms = search.trim().split(/\s+/);
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
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              phoneNumber: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              memberId: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            ...(searchTerms.length > 1
              ? [
                  {
                    AND: [
                      {
                        firstName: {
                          contains: searchTerms[0],
                          mode: Prisma.QueryMode.insensitive,
                        },
                      },
                      {
                        lastName: {
                          contains: searchTerms.slice(1).join(' '),
                          mode: Prisma.QueryMode.insensitive,
                        },
                      },
                    ],
                  },
                ]
              : []),
          ],
        };

        queryConditions = {
          ...queryConditions,
          AND: [
            ...(Array.isArray(queryConditions.AND)
              ? queryConditions.AND
              : queryConditions.AND
                ? [queryConditions.AND]
                : []),
            searchFilter,
          ],
        };
      }

      const members = await this.prisma.member.findMany({
        skip,
        take,
        where: queryConditions,
        orderBy: { createdAt: 'desc' },
        include: {
          branch: true,
          communicationPrefs: true,
          memberAnalytics: true,
        },
      });

      return members as unknown as Member[];
    } catch (error) {
      this.logger.error(
        `Error finding members: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<Member> {
    try {
      const member = await this.prisma.member.findUnique({
        where: { id },
        include: {
          branch: true,
          communicationPrefs: true,
          memberAnalytics: true,
          membershipHistory: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${id} not found`);
      }

      return member as unknown as Member;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error finding member: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Issue a physical card for a member
   */
  async issueMemberCard(
    memberId: string,
    cardType: 'NFC' | 'RFID' | 'BARCODE',
    userId: string,
  ): Promise<Member> {
    try {
      const member = await this.prisma.member.findUnique({
        where: { memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member not found with ID: ${memberId}`);
      }

      const updatedMember = await this.prisma.member.update({
        where: { memberId },
        data: {
          cardIssued: true,
          cardIssuedAt: new Date(),
          cardType,
        },
      });

      await this.auditLogService.create({
        action: 'UPDATE',
        entityType: 'Member',
        entityId: member.id,
        description: `Issued ${cardType} card for member: ${member.firstName} ${member.lastName}`,
        userId,
      });

      this.logger.log(`Issued ${cardType} card for member: ${memberId}`);
      return updatedMember as Member;
    } catch (error) {
      this.logger.error(
        `Failed to issue card for member ${memberId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Generate Member ID for existing member
   */
  async generateMemberIdForExisting(
    memberInternalId: string,
    userId: string,
  ): Promise<Member> {
    try {
      const member = await this.prisma.member.findUnique({
        where: { id: memberInternalId },
      });

      if (!member) {
        throw new NotFoundException(
          `Member not found with internal ID: ${memberInternalId}`,
        );
      }

      if (member.memberId) {
        this.logger.warn(
          `Member ${memberInternalId} already has Member ID: ${member.memberId}`,
        );
        return member as Member;
      }

      if (!member.organisationId || !member.branchId) {
        throw new Error(
          'Member must have organisationId and branchId to generate Member ID',
        );
      }

      const membershipYear = member.membershipDate
        ? new Date(member.membershipDate).getFullYear()
        : new Date().getFullYear();

      const memberId = await this.memberIdGenerationService.generateMemberId(
        member.organisationId,
        member.branchId,
      );

      const updatedMember = await this.prisma.member.update({
        where: { id: memberInternalId },
        data: {
          memberId,
          memberIdGeneratedAt: new Date(),
          gender: 'MALE' as any,
        },
      });

      await this.auditLogService.create({
        action: 'UPDATE',
        entityType: 'Member',
        entityId: member.id,
        description: `Generated Member ID: ${memberId} for ${member.firstName} ${member.lastName}`,
        userId,
      });

      this.logger.log(
        `Generated Member ID: ${memberId} for existing member: ${member.firstName} ${member.lastName}`,
      );
      return updatedMember as Member;
    } catch (error) {
      this.logger.error(
        `Failed to generate Member ID for member ${memberInternalId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Bulk generate Member IDs for all members in an organization
   */
  async bulkGenerateMemberIds(
    organisationId: string,
    userId: string,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      this.logger.log(
        `Starting bulk Member ID generation for organization: ${organisationId}`,
      );

      const results =
        await this.memberIdGenerationService.bulkGenerateMemberIds(
          organisationId,
        );

      await this.auditLogService.create({
        action: 'BULK_UPDATE',
        entityType: 'Member',
        entityId: organisationId,
        description: `Bulk generated Member IDs: ${results.success} success, ${results.failed} failed`,
        userId,
      });

      this.logger.log(
        `Bulk Member ID generation completed: ${results.success} success, ${results.failed} failed`,
      );
      return results;
    } catch (error) {
      this.logger.error(`Bulk Member ID generation failed: ${error.message}`);
      throw error;
    }
  }

  async findByMemberId(memberId: string): Promise<Member | null> {
    try {
      const member = await this.prisma.member.findUnique({
        where: { memberId },
        include: {
          branch: true,
          organisation: true,
        },
      });
      return member as Member | null;
    } catch (error) {
      this.logger.error(
        `Failed to find member by Member ID ${memberId}: ${error.message}`,
      );
      throw error;
    }
  }

  async bulkUpdateStatus(
    memberIds: string[],
    status: MemberStatus,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    await this.prisma.member.updateMany({
      where: { id: { in: memberIds } },
      data: { status },
    });

    for (const memberId of memberIds) {
      await this.auditLogService.create({
        action: 'UPDATE_STATUS',
        entityType: 'Member',
        entityId: memberId,
        description: `Updated member status to ${status}`,
        userId,
        ipAddress,
        userAgent,
      });
    }

    return true;
  }

  async bulkDeactivate(
    memberIds: string[],
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    await this.prisma.member.updateMany({
      where: { id: { in: memberIds } },
      data: {
        isDeactivated: true,
        deactivatedAt: new Date(),
        deactivatedBy: userId,
      },
    });

    for (const memberId of memberIds) {
      await this.auditLogService.create({
        action: 'DEACTIVATE',
        entityType: 'Member',
        entityId: memberId,
        description: 'Deactivated member',
        userId,
        ipAddress,
        userAgent,
      });
    }

    return true;
  }

  async bulkAssignRfid(
    memberIds: string[],
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    for (const memberId of memberIds) {
      // This is a simplified example. In a real-world scenario, you would likely have a pool of RFID cards to assign from.
      const rfidCardId = `M-${Date.now()}`;
      await this.prisma.member.update({
        where: { id: memberId },
        data: { memberId: rfidCardId },
      });

      await this.auditLogService.create({
        action: 'ASSIGN_RFID',
        entityType: 'Member',
        entityId: memberId,
        description: `Assigned RFID card ${rfidCardId}`,
        userId,
        ipAddress,
        userAgent,
      });
    }

    return true;
  }

  /**
   * Helper function to build Prisma where clause from member filters
   */
  private buildWhereClauseFromFilters(
    filters: MemberFiltersInput,
  ): Prisma.MemberWhereInput {
    const where: Prisma.MemberWhereInput = {};

    // Exclude deactivated members by default
    where.isDeactivated = false;

    if (filters.branchId) {
      where.branchId = filters.branchId;
    } else if (filters.organisationId) {
      where.organisationId = filters.organisationId;
    }

    if (filters.hasMemberId === true) {
      where.memberId = { not: null };
    } else if (filters.hasMemberId === false) {
      where.memberId = null;
    }

    // Server-side filters
    if (filters.gender && filters.gender.length > 0) {
      where.gender = { in: filters.gender as any };
    }

    if (filters.maritalStatus && filters.maritalStatus.length > 0) {
      where.maritalStatus = { in: filters.maritalStatus as any };
    }

    if (filters.membershipStatus && filters.membershipStatus.length > 0) {
      where.membershipStatus = { in: filters.membershipStatus as any };
    }

    if (filters.memberStatus && filters.memberStatus.length > 0) {
      where.status = { in: filters.memberStatus as any };
    }

    // Age range filtering
    if (filters.minAge !== undefined || filters.maxAge !== undefined) {
      const now = new Date();
      const conditions: Prisma.MemberWhereInput[] = [];

      if (filters.maxAge !== undefined) {
        const minBirthDate = new Date(
          now.getFullYear() - filters.maxAge - 1,
          now.getMonth(),
          now.getDate(),
        );
        conditions.push({ dateOfBirth: { gte: minBirthDate } });
      }

      if (filters.minAge !== undefined) {
        const maxBirthDate = new Date(
          now.getFullYear() - filters.minAge,
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
    if (filters.joinedAfter || filters.joinedBefore) {
      const dateConditions: any = {};
      if (filters.joinedAfter) {
        dateConditions.gte = new Date(filters.joinedAfter);
      }
      if (filters.joinedBefore) {
        dateConditions.lte = new Date(filters.joinedBefore);
      }
      where.membershipDate = dateConditions;
    }

    if (filters.hasProfileImage === true) {
      where.profileImageUrl = { not: null };
    } else if (filters.hasProfileImage === false) {
      where.profileImageUrl = null;
    }

    if (filters.hasEmail === true) {
      where.email = { not: null };
    } else if (filters.hasEmail === false) {
      where.email = null;
    }

    if (filters.hasPhone === true) {
      where.phoneNumber = { not: null };
    } else if (filters.hasPhone === false) {
      where.phoneNumber = null;
    }

    if (filters.isRegularAttendee !== undefined) {
      where.isRegularAttendee = filters.isRegularAttendee;
    }

    return where;
  }

  /**
   * Helper function to add search conditions to where clause
   */
  private addSearchToWhereClause(
    where: Prisma.MemberWhereInput,
    search: string,
  ): Prisma.MemberWhereInput {
    if (!search || search.trim().length === 0) {
      return where;
    }

    const searchTerms = search.trim().split(/\s+/);
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
        { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        {
          phoneNumber: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          memberId: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        ...(searchTerms.length > 1
          ? [
              {
                AND: [
                  {
                    firstName: {
                      contains: searchTerms[0],
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    lastName: {
                      contains: searchTerms.slice(1).join(' '),
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    };

    return {
      ...where,
      AND: [
        ...(Array.isArray(where.AND)
          ? where.AND
          : where.AND
            ? [where.AND]
            : []),
        searchFilter,
      ],
    };
  }

  /**
   * Generate export data based on member IDs or filters
   */
  async bulkExportData(
    exportInput: BulkExportInput,
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    let members: any[] = [];
    let exportDescription = '';

    // Determine how to fetch members - by IDs or by filters
    if (exportInput.memberIds && exportInput.memberIds.length > 0) {
      // Export specific members by IDs
      members = await this.prisma.member.findMany({
        where: {
          id: { in: exportInput.memberIds },
          isDeactivated: false, // Exclude deactivated members
        },
      });
      exportDescription = `Exported data for ${exportInput.memberIds.length} selected members.`;
    } else if (exportInput.filters) {
      // Export members based on filters
      let where = this.buildWhereClauseFromFilters(exportInput.filters);

      // Add search conditions if provided
      if (exportInput.filters.search) {
        where = this.addSearchToWhereClause(where, exportInput.filters.search);
      }

      members = await this.prisma.member.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      exportDescription = `Exported filtered member data (${members.length} members found).`;
    } else {
      // Export all members (fallback)
      members = await this.prisma.member.findMany({
        where: { isDeactivated: false },
        orderBy: { createdAt: 'desc' },
      });
      exportDescription = `Exported all member data (${members.length} members).`;
    }

    // Generate export content based on format
    const format = exportInput.format || 'CSV';
    let exportContent = '';

    if (format === 'CSV') {
      exportContent = this.generateCSVExport(members, exportInput);
    } else if (format === 'EXCEL') {
      // For now, generate CSV format for Excel (can be enhanced later with actual Excel generation)
      exportContent = this.generateCSVExport(members, exportInput);
    } else if (format === 'PDF') {
      // Placeholder for PDF generation
      exportContent = this.generatePDFExport(members, exportInput);
    }

    // Log the export action
    await this.auditLogService.create({
      action: 'BULK_EXPORT',
      entityType: 'Member',
      entityId: exportInput.memberIds?.join(',') || 'filtered',
      description: exportDescription,
      userId: user.id,
      ipAddress,
      userAgent,
    });

    return exportContent;
  }

  /**
   * Generate CSV export content
   */
  private generateCSVExport(
    members: any[],
    exportInput: BulkExportInput,
  ): string {
    const selectedFields = exportInput.fields || [
      'memberId',
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'gender',
      'dateOfBirth',
      'maritalStatus',
      'membershipStatus',
      'membershipDate',
    ];

    let csv = '';

    // Add headers if requested
    if (exportInput.includeHeaders !== false) {
      const headers = selectedFields.map((field) =>
        this.getFieldDisplayName(field),
      );
      csv += headers.join(',') + '\n';
    }

    // Add member data
    csv += members
      .map((member) => {
        return selectedFields
          .map((field) => {
            let value = member[field];

            // Format specific fields
            if (field === 'dateOfBirth' && value) {
              value = new Date(value).toLocaleDateString();
            } else if (field === 'membershipDate' && value) {
              value = new Date(value).toLocaleDateString();
            }

            // Escape commas and quotes in CSV
            if (value && typeof value === 'string') {
              value = value.replace(/"/g, '""');
              if (
                value.includes(',') ||
                value.includes('"') ||
                value.includes('\n')
              ) {
                value = `"${value}"`;
              }
            }

            return value || '';
          })
          .join(',');
      })
      .join('\n');

    return csv;
  }

  /**
   * Generate PDF export content (placeholder)
   */
  private generatePDFExport(
    members: any[],
    exportInput: BulkExportInput,
  ): string {
    // This is a placeholder - in a real implementation, you would use a PDF library
    // like puppeteer, jsPDF, or pdfkit to generate actual PDF content
    return `PDF Export - ${members.length} members (Feature coming soon)`;
  }

  /**
   * Get display name for field
   */
  private getFieldDisplayName(field: string): string {
    const fieldNames: Record<string, string> = {
      memberId: 'Member ID',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phoneNumber: 'Phone Number',
      gender: 'Gender',
      dateOfBirth: 'Date of Birth',
      maritalStatus: 'Marital Status',
      membershipStatus: 'Membership Status',
      membershipDate: 'Membership Date',
      address: 'Address',
      occupation: 'Occupation',
      emergencyContactName: 'Emergency Contact Name',
      emergencyContactPhone: 'Emergency Contact Phone',
    };

    return fieldNames[field] || field;
  }

  async bulkTransfer(
    memberIds: string[],
    newBranchId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    await this.prisma.member.updateMany({
      where: { id: { in: memberIds } },
      data: { branchId: newBranchId },
    });

    for (const memberId of memberIds) {
      await this.auditLogService.create({
        action: 'TRANSFER',
        entityType: 'Member',
        entityId: memberId,
        description: `Transferred member to branch ${newBranchId}`,
        userId,
        ipAddress,
        userAgent,
      });
    }

    return true;
  }

  async bulkAddToGroup(
    bulkAddToGroupInput: BulkAddToGroupInput,
    currentUser: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    const { memberIds, groupId } = bulkAddToGroupInput;

    // 1. Validate that the group exists
    const group = await this.prisma.smallGroup.findUnique({
      where: { id: groupId },
      select: { id: true, name: true },
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // 2. Validate that all members exist
    const existingMembers = await this.prisma.member.findMany({
      where: { id: { in: memberIds } },
      select: { id: true },
    });
    const existingMemberIds = new Set(existingMembers.map((m) => m.id));
    const notFoundIds = memberIds.filter((id) => !existingMemberIds.has(id));
    if (notFoundIds.length > 0) {
      this.logger.warn(
        `bulkAddToGroup: The following member IDs were not found and will be skipped: ${notFoundIds.join(', ')}`,
      );
    }
    const validMemberIds = [...existingMemberIds];
    if (validMemberIds.length === 0) {
      this.logger.warn('bulkAddToGroup: No valid members found to add.');
      return true; // Nothing to do
    }

    // 3. Find which members are already in the group to avoid duplicates
    const existingGroupMembers = await this.prisma.groupMember.findMany({
      where: {
        smallGroupId: groupId,
        memberId: { in: validMemberIds },
      },
      select: { memberId: true },
    });
    const membersAlreadyInGroup = new Set(
      existingGroupMembers.map((gm) => gm.memberId),
    );

    // 4. Determine which new GroupMember entries to create
    const memberIdsToAdd = validMemberIds.filter(
      (id) => !membersAlreadyInGroup.has(id),
    );

    if (memberIdsToAdd.length === 0) {
      this.logger.warn(
        `bulkAddToGroup: All valid members are already in group ${group.name}`,
      );
      return true; // Nothing to add
    }

    // 5. Create the new entries in the join table
    try {
      await this.prisma.groupMember.createMany({
        data: memberIdsToAdd.map((memberId) => ({
          memberId,
          smallGroupId: groupId,
          role: 'MEMBER',
          status: 'ACTIVE',
        })),
        skipDuplicates: true, // As a safeguard
      });

      // 6. Audit Logging
      await this.auditLogService.create({
        action: 'BULK_ADD_TO_GROUP',
        entityType: 'SmallGroup',
        entityId: groupId,
        description: `Bulk added ${memberIdsToAdd.length} members to group: ${group.name}`,
        userId: currentUser.id,
        ipAddress,
        userAgent,
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to bulk add members to group ${groupId}: ${error.message}`,
        error.stack,
      );
      // Re-throw the original error to be handled by the exception filter
      throw error;
    }
  }

  async bulkRemoveFromGroup(
    bulkRemoveFromGroupInput: BulkRemoveFromGroupInput,
    currentUser: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    const { memberIds, groupId } = bulkRemoveFromGroupInput;

    // Correctly delete entries from the GroupMember join table
    await this.prisma.groupMember.deleteMany({
      where: {
        smallGroupId: groupId,
        memberId: { in: memberIds },
      },
    });

    // Audit logging for the bulk removal
    await this.auditLogService.create({
      action: 'BULK_REMOVE_FROM_GROUP',
      entityType: 'SmallGroup',
      entityId: groupId,
      description: `Bulk removed ${memberIds.length} members from group.`,
      userId: currentUser.id,
      ipAddress,
      userAgent,
    });

    return true;
  }

  async bulkAddToMinistry(
    bulkAddToMinistryInput: BulkAddToMinistryInput,
    currentUser: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    const { memberIds, ministryId } = bulkAddToMinistryInput;

    // Ensure the ministry exists
    const ministry = await this.prisma.ministry.findUnique({
      where: { id: ministryId },
    });

    if (!ministry) {
      throw new NotFoundException(`Ministry with ID ${ministryId} not found`);
    }

    const updatePromises = memberIds.map((memberId) =>
      this.prisma.ministry.update({
        where: { id: ministryId },
        data: {
          members: {
            connect: { id: memberId },
          },
        },
      }),
    );

    await this.prisma.$transaction(updatePromises);

    const auditLogPromises = memberIds.map((memberId) =>
      this.auditLogService.create({
        userId: currentUser.id,
        action: 'bulk_add_to_ministry',
        entityId: memberId,
        entityType: 'Member',
        description: `Member added to ministry ${ministryId}`,
        ipAddress,
        userAgent,
      }),
    );
    await Promise.all(auditLogPromises);

    return true;
  }

  async bulkRemoveFromMinistry(
    bulkRemoveFromMinistryInput: BulkRemoveFromMinistryInput,
    currentUser: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    const { memberIds, ministryId } = bulkRemoveFromMinistryInput;

    const updatePromises = memberIds.map((memberId) =>
      this.prisma.ministry.update({
        where: { id: ministryId },
        data: {
          members: {
            disconnect: { id: memberId },
          },
        },
      }),
    );

    await this.prisma.$transaction(updatePromises);

    const auditLogPromises = memberIds.map((memberId) =>
      this.auditLogService.create({
        userId: currentUser.id,
        action: 'bulk_remove_from_ministry',
        entityId: memberId,
        entityType: 'Member',
        description: `Member removed from ministry ${ministryId}`,
        ipAddress,
        userAgent,
      }),
    );
    await Promise.all(auditLogPromises);

    return true;
  }

  /**
   * Import members in bulk from CSV/Excel data
   */
  async importMembers(
    importMembersInput: ImportMembersInput,
    currentUser: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ImportMembersResult> {
    const {
      branchId,
      organisationId,
      members,
      skipDuplicates = false,
      updateExisting = false,
    } = importMembersInput;

    const results: ImportMemberResult[] = [];
    const errors: ImportError[] = [];
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Validate branch and organization exist
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { organisation: true },
    });

    if (!branch || branch.organisationId !== organisationId) {
      throw new NotFoundException(
        'Branch not found or does not belong to the specified organization',
      );
    }

    // Process each member
    for (let i = 0; i < members.length; i++) {
      const memberData = members[i];
      const rowNumber = i + 1;

      try {
        // Set branch and organization IDs
        memberData.branchId = branchId;
        memberData.organisationId = organisationId;

        // Check for duplicates based on email or phone
        let existingMember: Member | null = null;
        if (memberData.email) {
          existingMember = (await this.prisma.member.findFirst({
            where: {
              email: memberData.email,
              branchId: branchId,
              isDeactivated: false,
            },
          })) as Member | null;
          if (
            existingMember &&
            existingMember.gender &&
            typeof existingMember.gender === 'string'
          ) {
            // Convert Prisma Gender enum to app Gender enum
            existingMember.gender = existingMember.gender as any;
          }
        }

        if (!existingMember && memberData.phoneNumber) {
          existingMember = (await this.prisma.member.findFirst({
            where: {
              phoneNumber: memberData.phoneNumber,
              branchId: branchId,
              isDeactivated: false,
            },
          })) as Member | null;
          if (
            existingMember &&
            existingMember.gender &&
            typeof existingMember.gender === 'string'
          ) {
            existingMember.gender = existingMember.gender as any;
          }
        }

        // Handle existing member
        if (existingMember) {
          if (skipDuplicates) {
            results.push({
              id: existingMember.id,
              firstName: memberData.firstName,
              lastName: memberData.lastName,
              email: memberData.email,
              success: false,
              error: 'Skipped - duplicate member',
              row: rowNumber,
            });
            skippedCount++;
            continue;
          } else if (updateExisting) {
            // Update existing member
            const updatedMember = await this.prisma.member.update({
              where: { id: existingMember.id },
              data: {
                ...memberData,
                updatedAt: new Date(),
              },
            });

            // Log audit
            await this.auditLogService.create({
              userId: currentUser.id,
              action: 'update_member_import',
              entityId: updatedMember.id,
              entityType: 'Member',
              description: `Member updated via import: ${memberData.firstName} ${memberData.lastName}`,
              ipAddress,
              userAgent,
            });

            results.push({
              id: updatedMember.id,
              firstName: memberData.firstName,
              lastName: memberData.lastName,
              email: memberData.email,
              success: true,
              row: rowNumber,
            });
            successCount++;
            continue;
          } else {
            // Duplicate found and not handling
            results.push({
              id: existingMember.id,
              firstName: memberData.firstName,
              lastName: memberData.lastName,
              email: memberData.email,
              success: false,
              error: 'Duplicate member found',
              row: rowNumber,
            });
            errorCount++;
            continue;
          }
        }

        // Generate member ID if not provided
        if (!memberData.customFields?.memberId) {
          const memberId =
            await this.memberIdGenerationService.generateMemberId(
              branchId,
              organisationId,
            );
          memberData.customFields = {
            ...memberData.customFields,
            memberId,
          };
        }

        // Create new member
        const newMember = await this.prisma.member.create({
          data: {
            ...memberData,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // Log audit
        await this.auditLogService.create({
          userId: currentUser.id,
          action: 'create_member_import',
          entityId: newMember.id,
          entityType: 'Member',
          description: `Member created via import: ${memberData.firstName} ${memberData.lastName}`,
          ipAddress,
          userAgent,
        });

        // Trigger workflow if applicable
        try {
          await this.workflowsService.triggerWorkflow({
            workflowId: 'MEMBER_CREATED_WORKFLOW_ID', // TODO: replace with actual workflow ID
            targetMemberId: newMember.id,
          });
        } catch (workflowError) {
          this.logger.warn(
            `Workflow trigger failed for member ${newMember.id}: ${workflowError.message}`,
          );
        }

        results.push({
          id: newMember.id,
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          email: memberData.email,
          success: true,
          row: rowNumber,
        });
        successCount++;
      } catch (error) {
        this.logger.error(`Error importing member at row ${rowNumber}:`, error);

        results.push({
          firstName: memberData.firstName || 'Unknown',
          lastName: memberData.lastName || 'Unknown',
          email: memberData.email,
          success: false,
          error: `General import error for ${memberData.firstName} ${memberData.lastName}`,
          row: rowNumber,
        });

        errors.push({
          row: rowNumber,
          column: 'general',
          message: `General import error for ${memberData.firstName} ${memberData.lastName}`,
        });

        errorCount++;
      }
    }

    // Generate summary
    const summary = `Import completed: ${successCount} successful, ${errorCount} errors, ${skippedCount} skipped out of ${members.length} total records.`;

    return {
      totalProcessed: members.length,
      successCount,
      errorCount,
      skippedCount,
      results,
      errors,
      summary,
    };
  }

  async permanentlyDeleteMember(
    memberId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    try {
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${memberId} not found`);
      }

      // Only allow permanent deletion of deactivated members
      if (!member.isDeactivated) {
        throw new BadRequestException(
          'Only deactivated members can be permanently deleted. Please deactivate the member first.',
        );
      }

      // Log the action before deletion
      await this.auditLogService.create({
        action: 'PERMANENT_DELETE',
        entityType: 'Member',
        entityId: memberId,
        description: `Permanently deleted member: ${member.firstName} ${member.lastName}`,
        userId: userId || 'system',
        ipAddress,
        userAgent,
      });

      // Permanently delete the member from the database
      await this.prisma.member.delete({
        where: { id: memberId },
      });

      this.logger.log(
        `Member ${memberId} (${member.firstName} ${member.lastName}) permanently deleted by user ${userId}`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Error permanently deleting member ${memberId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getMemberHistory(
    memberId: string,
    skip = 0,
    take = 50,
  ): Promise<any[]> {
    try {
      // Verify member exists
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${memberId} not found`);
      }

      // Fetch audit logs for this member
      const auditLogs = await this.prisma.auditLog.findMany({
        where: {
          OR: [
            // Direct member changes
            { entityId: memberId },
            // Member-related changes in description
            { entityType: 'Member', description: { contains: memberId } },
            // GroupMember changes - check metadata for memberId
            {
              entityType: 'GroupMember',
              metadata: {
                path: ['memberId'],
                equals: memberId,
              },
            },
          ],
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return auditLogs;
    } catch (error) {
      this.logger.error(
        `Error fetching member history for ${memberId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getMemberHistoryCount(memberId: string): Promise<number> {
    try {
      // Verify member exists
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${memberId} not found`);
      }

      // Count audit logs for this member
      const count = await this.prisma.auditLog.count({
        where: {
          OR: [
            // Direct member changes
            { entityId: memberId },
            // Member-related changes in description
            { entityType: 'Member', description: { contains: memberId } },
            // GroupMember changes - check metadata for memberId
            {
              entityType: 'GroupMember',
              metadata: {
                path: ['memberId'],
                equals: memberId,
              },
            },
          ],
        },
      });

      return count;
    } catch (error) {
      this.logger.error(
        `Error counting member history for ${memberId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
