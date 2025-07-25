import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
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
} from '../dto/member-statistics.output';
import { GenderDistribution } from '../../reporting/entities/member-demographics-data.entity';
import { MemberDashboard } from '../dto/member-dashboard.dto';
import { WorkflowsService } from '../../workflows/services/workflows.service';

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

      const member = await this.prisma.member.create({
        data: {
          ...data,
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
        await this.workflowsService.handleMemberCreated(
          member.id,
          member.organisationId || '',
          member.branchId || undefined,
        );
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
      let rfidCardId: string;
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
        const id = String(lastMemberCount + 1 + attempt).padStart(6, '0');
        rfidCardId = `${prefix}-${year}-${branchCode}-${id}`;
        // Check for existing RFID
        const exists = await this.prisma.member.findUnique({
          where: { rfidCardId },
        });
        if (!exists) break;
        attempt++;
        if (attempt >= maxAttempts) {
          throw new Error(
            'Failed to generate a unique RFID Card ID after several attempts.',
          );
        }
      }

      const member = await this.prisma.member.create({
        data: {
          firstName: createMemberInput.firstName,
          middleName: createMemberInput.middleName,
          lastName: createMemberInput.lastName,
          email: createMemberInput.email,
          phoneNumber: createMemberInput.phoneNumber,
          address: createMemberInput.address,
          city: createMemberInput.city,
          state: createMemberInput.state,
          postalCode: createMemberInput.postalCode,
          country: createMemberInput.country,
          dateOfBirth: createMemberInput.dateOfBirth,
          gender: createMemberInput.gender as unknown as string,
          maritalStatus: createMemberInput.maritalStatus,
          occupation: createMemberInput.occupation,
          employerName: createMemberInput.employerName,
          status: createMemberInput.status as unknown as string,
          membershipDate: createMemberInput.membershipDate,
          baptismDate: (() => {
            const val: string | Date = createMemberInput.baptismDate as
              | string
              | Date;
            if (val == null) return null;
            if (typeof val === 'string') {
              return val.trim() === '' ? null : val;
            }
            return val;
          })(),
          confirmationDate: (() => {
            const val: string | Date = createMemberInput.confirmationDate as
              | string
              | Date;
            if (val == null) return null;
            if (typeof val === 'string') {
              return val.trim() === '' ? null : val;
            }
            return val;
          })(),
          customFields: createMemberInput.customFields as Prisma.InputJsonValue,
          privacySettings:
            createMemberInput.privacySettings as Prisma.InputJsonValue,
          notes: createMemberInput.notes,
          branchId: createMemberInput.branchId,
          organisationId: createMemberInput.organisationId,
          spouseId: createMemberInput.spouseId,
          parentId: createMemberInput.parentId,
          rfidCardId, // Assign generated RFID Card ID
        },
        include: {
          branch: true,
          spouse: true,
          parent: true,
          children: true,
          spiritualMilestones: true,
          families: true,
          groupMemberships: {
            include: {
              ministry: true,
              smallGroup: true,
            },
          },
          attendanceRecords: {
            orderBy: { checkInTime: 'desc' },
            take: 10,
            include: {
              session: true,
            },
          },
          sacramentalRecords: true,
          guardianProfile: true,
          notifications: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          prayerRequests: true,
          contributions: true,
          familyRelationships: {
            include: {
              member: true,
              relatedMember: true,
              family: true,
            },
          },
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'CREATE',
        entityType: 'Member',
        entityId: member.id,
        description: `Created member: ${member.firstName} ${member.lastName}`,
        userId,
        ipAddress,
        userAgent,
      });

      // Trigger workflow automation for new member
      try {
        await this.workflowsService.handleMemberCreated(
          member.id,
          member.organisationId || '',
          member.branchId || undefined,
        );
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
              rfidCardId: {
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
          attendanceRecords: {
            orderBy: { checkInTime: 'desc' },
            take: 10,
            include: {
              session: true,
            },
          },
          sacramentalRecords: true,
          guardianProfile: true,
          notifications: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          prayerRequests: true,
          contributions: true,
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
      });

      if (!existingMember) {
        throw new NotFoundException(`Member with ID ${id} not found`);
      }

      // Update member
      const updatedMember = await this.prisma.member.update({
        where: { id },
        data: {
          firstName: updateMemberInput.firstName,
          middleName: updateMemberInput.middleName,
          lastName: updateMemberInput.lastName,
          profileImageUrl: updateMemberInput.profileImageUrl,
          email: updateMemberInput.email,
          phoneNumber: updateMemberInput.phoneNumber,
          address: updateMemberInput.address,
          city: updateMemberInput.city,
          state: updateMemberInput.state,
          postalCode: updateMemberInput.postalCode,
          country: updateMemberInput.country,
          dateOfBirth: updateMemberInput.dateOfBirth,
          gender: updateMemberInput.gender as unknown as string,
          maritalStatus: updateMemberInput.maritalStatus,
          occupation: updateMemberInput.occupation,
          employerName: updateMemberInput.employerName,
          status: updateMemberInput.status as unknown as string,
          membershipDate: updateMemberInput.membershipDate,
          baptismDate: (() => {
            const val: string | Date = updateMemberInput.baptismDate as
              | string
              | Date;
            if (val == null) return null;
            if (typeof val === 'string') {
              return val.trim() === '' ? null : val;
            }
            return val;
          })(),
          confirmationDate: (() => {
            const val: string | Date = updateMemberInput.confirmationDate as
              | string
              | Date;
            if (val == null) return null;
            if (typeof val === 'string') {
              return val.trim() === '' ? null : val;
            }
            return val;
          })(),
          customFields: updateMemberInput.customFields as Prisma.InputJsonValue,
          privacySettings:
            updateMemberInput.privacySettings as Prisma.InputJsonValue,
          notes: updateMemberInput.notes,
          branchId: updateMemberInput.branchId,
          // userId is not directly updatable
          spouseId: updateMemberInput.spouseId,
          parentId: updateMemberInput.parentId,
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
        action: 'UPDATE',
        entityType: 'Member',
        entityId: updatedMember.id,
        description: `Updated member: ${updatedMember.firstName} ${updatedMember.lastName}`,
        userId,
        ipAddress,
        userAgent,
      });

      // Trigger workflow automation for member update
      try {
        await this.workflowsService.handleMemberUpdated(
          updatedMember.id,
          updatedMember.organisationId || '',
          updatedMember.branchId || undefined,
        );
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
          status: status as unknown as string,
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
        userId,
        ipAddress,
        userAgent,
      });

      // Trigger workflow automation for member status update
      try {
        await this.workflowsService.handleMemberUpdated(
          updatedMember.id,
          updatedMember.organisationId || '',
          updatedMember.branchId || undefined,
        );
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
          rfidCardId: rfidCardId,
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
          rfidCardId: rfidCardId,
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
        userId,
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

      if (!member.rfidCardId) {
        this.logger.warn(
          `Member ${memberId} does not have an RFID card assigned.`,
        );
        return member as unknown as Member; // Or throw an error if preferred
      }

      // Remove RFID card
      const updatedMember = await this.prisma.member.update({
        where: { id: memberId },
        data: {
          rfidCardId: null,
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
        description: `Removed RFID card ID ${member.rfidCardId} from member ${member.firstName} ${member.lastName}`,
        userId,
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
        where: { rfidCardId: rfidCardId },
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
    const baseWhere: Prisma.MemberWhereInput = {};
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
        status: MemberStatus.ACTIVE,
      });

      const inactiveMembersPromise = this.count({
        ...periodWhere,
        status: MemberStatus.INACTIVE,
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
        status: {
          in: [MemberStatus.VISITOR],
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

    const [
      currentMonthStats,
      lastMonthStats,
      genderStats,
      averageAge,
      ageGroups,
    ] = await Promise.all([
      currentMonthStatsPromise,
      lastMonthStatsPromise,
      genderStatsPromise,
      averageAgePromise,
      ageGroupsPromise,
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
    };
  }

  private async getGenderDistribution(
    whereClause: Prisma.MemberWhereInput,
  ): Promise<GenderDistribution> {
    const [maleCount, femaleCount, otherCount] = await Promise.all([
      this.count({ ...whereClause, gender: 'MALE' }),
      this.count({ ...whereClause, gender: 'FEMALE' }),
      this.count({ ...whereClause, gender: 'OTHER' }),
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
      '18-25': 0,
      '26-35': 0,
      '36-50': 0,
      '51+': 0,
    };

    members.forEach((member) => {
      if (member.dateOfBirth) {
        const age =
          new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();
        if (age >= 18 && age <= 25) {
          ageGroups['18-25']++;
        } else if (age >= 26 && age <= 35) {
          ageGroups['26-35']++;
        } else if (age >= 36 && age <= 50) {
          ageGroups['36-50']++;
        } else if (age >= 51) {
          ageGroups['51+']++;
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
      // Check if member exists
      const member = await this.prisma.member.findUnique({
        where: { id },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${id} not found`);
      }

      // Delete member
      await this.prisma.member.delete({
        where: { id },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'DELETE',
        entityType: 'Member',
        entityId: id,
        description: `Deleted member: ${member.firstName} ${member.lastName}`,
        userId,
        ipAddress,
        userAgent,
      });

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error deleting member: ${(error as Error).message}`,
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
        userId,
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
        userId,
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
        userId,
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
}
