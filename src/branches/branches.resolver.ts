import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards, NotFoundException } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Branch } from './entities/branch.entity';
import { BranchSetting } from './entities/branch-setting.entity';
import { CreateBranchInput } from './dto/create-branch.input';
import { UpdateBranchInput } from './dto/update-branch.input';
import { UpdateBranchSettingInput } from './dto/update-branch-setting.input';
import { UpdateBranchSettingsInput } from './dto/update-branch-settings.input';
import { PaginationInput } from '../common/dto/pagination.input';
import { BranchFilterInput } from './dto/branch-filter.input';
import { PaginatedBranches } from './dto/paginated-branches.output';
import { MembersService } from '../members/services/members.service';
import { MemberStatus } from '../members/entities/member.entity';
import { BranchStatistics } from './dto/branch-statistics.output';
import { PrismaService } from '../prisma/prisma.service';
import { BranchSettings } from './entities/branch-settings.entity';
import { SacramentType } from '@prisma/client';
import { TransferRequest } from '../transfers/entities/transfer-request.entity';
import { PaginatedTransferRequests } from '../transfers/dto/paginated-transfer-requests.output';
import { ForbiddenException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Resolver(() => Branch)
export class BranchesResolver {
  constructor(
    private readonly branchesService: BranchesService,
    private readonly membersService: MembersService, // Injected MembersService
    private readonly prisma: PrismaService, // Adding PrismaService
  ) {}

  @Mutation(() => Branch, { name: 'createBranch' })
  async createBranch(
    @Args('createBranchInput') createBranchInput: CreateBranchInput,
  ): Promise<Branch> {
    return this.branchesService.create(createBranchInput);
  }

  @Query(() => PaginatedBranches, { name: 'branches' })
  async findAll(
    @Args('filterInput', { nullable: true }) filterInput: BranchFilterInput,
    @Args('paginationInput', { nullable: true })
    paginationInput: PaginationInput,
  ): Promise<PaginatedBranches> {
    return this.branchesService.findAll(paginationInput || {}, filterInput);
  }

  @Query(() => [User], { name: 'branchUsers' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR)
  async getBranchUsers(
    @Args('branchId', { type: () => String }) branchId: string,
  ): Promise<User[]> {
    // Get all users associated with this branch through their UserBranch records
    const branchUsers = await this.prisma.user.findMany({
      where: {
        userBranches: {
          some: {
            branchId,
          },
        },
      },
      include: {
        userBranches: {
          where: {
            branchId,
          },
          include: {
            role: true,
          },
        },
      },
    });

    // Transform the data to include roles as a string array
    return branchUsers.map((user) => {
      const roles = user.userBranches.map((ub) => ub.role.name);
      return {
        ...user,
        roles,
        // Ensure name getter works by providing firstName and lastName
        get name() {
          return (
            [user.firstName, user.lastName].filter(Boolean).join(' ') ||
            'Unknown'
          );
        },
      };
    });
  }

  @Query(() => Branch, { name: 'branch', nullable: true })
  findOne(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Branch | null> {
    return this.branchesService.findOne(id);
  }

  @Mutation(() => Branch, { name: 'updateBranch' })
  updateBranch(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('updateBranchInput') updateBranchInput: UpdateBranchInput,
  ): Promise<Branch> {
    return this.branchesService.update(id, updateBranchInput);
  }

  @Mutation(() => Branch, { name: 'removeBranch' })
  removeBranch(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Branch> {
    return this.branchesService.remove(id);
  }

  @ResolveField('settings', () => BranchSettings)
  async getBranchSettings(@Parent() branch: Branch): Promise<BranchSettings> {
    const { id: branchId } = branch;

    // Try to find existing settings
    const existingSettings = await this.prisma.branchSetting.findFirst({
      where: { branchId },
    });

    if (existingSettings) {
      // Parse JSON fields or use defaults
      const brandingSettings = existingSettings.value
        ? JSON.parse(existingSettings.value).brandingSettings || {
            primaryColor: '#4f46e5',
            secondaryColor: '#9333ea',
            fontFamily: 'Inter, sans-serif',
          }
        : {
            primaryColor: '#4f46e5',
            secondaryColor: '#9333ea',
            fontFamily: 'Inter, sans-serif',
          };

      const notificationSettings = existingSettings.value
        ? JSON.parse(existingSettings.value).notificationSettings || {
            emailNotifications: true,
            smsNotifications: false,
            transferNotifications: true,
            financialNotifications: true,
          }
        : {
            emailNotifications: true,
            smsNotifications: false,
            transferNotifications: true,
            financialNotifications: true,
          };

      // Map database settings to GraphQL type
      return {
        branchId,
        allowMemberTransfers: existingSettings.allowMemberTransfers || true,
        allowResourceSharing: true,
        visibilityToOtherBranches: 'limited',
        financialReportingLevel: 'summary',
        attendanceReportingLevel: 'summary',
        memberDataVisibility: 'limited',
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
        brandingSettings,
        notificationSettings,
      };
    }

    // Return default settings if none exist
    return {
      branchId,
      allowMemberTransfers: true,
      allowResourceSharing: true,
      visibilityToOtherBranches: 'limited',
      financialReportingLevel: 'summary',
      attendanceReportingLevel: 'summary',
      memberDataVisibility: 'limited',
      timezone: 'UTC',
      currency: 'USD',
      language: 'en',
      brandingSettings: {
        primaryColor: '#4f46e5',
        secondaryColor: '#9333ea',
        fontFamily: 'Inter, sans-serif',
      },
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: false,
        transferNotifications: true,
        financialNotifications: true,
      },
    };
  }

  @Mutation(() => BranchSettings)
  async updateBranchSettings(
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('input') updateBranchSettingsInput: UpdateBranchSettingsInput,
    @CurrentUser() user: User,
  ): Promise<BranchSettings> {
    // Check if user is a super admin
    const isSuperAdmin = await this.prisma.role.findFirst({
      where: {
        users: {
          some: {
            id: user.id,
          },
        },
        name: 'SUPER_ADMIN',
      },
    });

    // Check if user is a branch admin for this branch
    const isBranchAdmin = await this.prisma.userBranch.findFirst({
      where: {
        userId: user.id,
        branchId,
        role: {
          name: 'BRANCH_ADMIN',
        },
      },
    });

    // Check if user has CUSTOMIZE_MODULES permission
    const hasPermission = await this.prisma.permission.findFirst({
      where: {
        roles: {
          some: {
            users: {
              some: {
                id: user.id,
              },
            },
          },
        },
        action: 'CUSTOMIZE_MODULES',
      },
    });

    if (!isSuperAdmin && !isBranchAdmin && !hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to update branch settings',
      );
    }

    // Find existing settings or create new ones
    let existingSettings = await this.prisma.branchSetting.findFirst({
      where: {
        branchId,
      },
    });

    // Parse existing settings or use defaults
    const existingValue = existingSettings?.value
      ? JSON.parse(existingSettings.value)
      : {};

    // Merge new branding settings with existing ones
    const brandingSettings = {
      ...(existingValue.brandingSettings || {
        primaryColor: '#4f46e5',
        secondaryColor: '#9333ea',
        fontFamily: 'Inter, sans-serif',
      }),
      ...(updateBranchSettingsInput.brandingSettings || {}),
    };

    // Merge new notification settings with existing ones
    const notificationSettings = {
      ...(existingValue.notificationSettings || {
        emailNotifications: true,
        smsNotifications: false,
        transferNotifications: true,
        financialNotifications: true,
      }),
      ...(updateBranchSettingsInput.notificationSettings || {}),
    };

    // Create or update settings
    const updatedSettings = await this.prisma.branchSetting.upsert({
      where: {
        id: existingSettings?.id || 'create-new',
      },
      create: {
        branchId,
        allowMemberTransfers:
          updateBranchSettingsInput.allowMemberTransfers ?? true,
        value: JSON.stringify({
          brandingSettings,
          notificationSettings,
        }),
      },
      update: {
        allowMemberTransfers:
          updateBranchSettingsInput.allowMemberTransfers ??
          existingSettings?.allowMemberTransfers ??
          true,
        value: JSON.stringify({
          brandingSettings,
          notificationSettings,
        }),
      },
    });

    // Return formatted settings
    return {
      id: updatedSettings.id,
      branchId,
      allowMemberTransfers: updatedSettings.allowMemberTransfers || true,
      allowResourceSharing:
        updateBranchSettingsInput.allowResourceSharing || true,
      visibilityToOtherBranches:
        updateBranchSettingsInput.visibilityToOtherBranches || 'limited',
      financialReportingLevel:
        updateBranchSettingsInput.financialReportingLevel || 'summary',
      attendanceReportingLevel:
        updateBranchSettingsInput.attendanceReportingLevel || 'summary',
      memberDataVisibility:
        updateBranchSettingsInput.memberDataVisibility || 'limited',
      timezone: updateBranchSettingsInput.timezone || 'UTC',
      currency: updateBranchSettingsInput.currency || 'USD',
      language: updateBranchSettingsInput.language || 'en',
      brandingSettings,
      notificationSettings,
      createdAt: updatedSettings.createdAt,
      updatedAt: updatedSettings.updatedAt,
    };
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async assignUserRole(
    @Args('userId', { type: () => String }) userId: string,
    @Args('branchId', { type: () => String }) branchId: string,
    @Args('role', { type: () => String }) roleName: string,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    // Check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if the branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    // Check if the role exists
    const role = await this.prisma.role.findFirst({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }

    // Check if the current user has permission to assign this role
    // Only SUPER_ADMIN can assign ADMIN role
    const currentUserRoles = await this.prisma.userBranch.findMany({
      where: { userId: currentUser.id },
      include: { role: true },
    });

    const currentUserRoleNames = currentUserRoles.map((ur) => ur.role.name);

    if (
      roleName === Role.ADMIN &&
      !currentUserRoleNames.includes(Role.SUPER_ADMIN)
    ) {
      throw new ForbiddenException('Only SUPER_ADMIN can assign ADMIN role');
    }

    // Check if the user already has this role in this branch
    const existingUserBranch = await this.prisma.userBranch.findFirst({
      where: {
        userId,
        branchId,
        role: {
          name: roleName,
        },
      },
    });

    if (existingUserBranch) {
      // User already has this role, return the user
      const userWithRoles = await this.getUserWithRoles(userId, branchId);
      return userWithRoles;
    }

    // Assign the role to the user
    await this.prisma.userBranch.create({
      data: {
        user: {
          connect: { id: userId },
        },
        branch: {
          connect: { id: branchId },
        },
        role: {
          connect: { id: role.id },
        },
      },
    });

    // Return the updated user with roles
    return this.getUserWithRoles(userId, branchId);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async removeUserRole(
    @Args('userId', { type: () => String }) userId: string,
    @Args('branchId', { type: () => String }) branchId: string,
    @Args('role', { type: () => String }) roleName: string,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    // Check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if the branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    // Check if the role exists
    const role = await this.prisma.role.findFirst({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }

    // Check if the current user has permission to remove this role
    // Only SUPER_ADMIN can remove ADMIN role
    const currentUserRoles = await this.prisma.userBranch.findMany({
      where: { userId: currentUser.id },
      include: { role: true },
    });

    const currentUserRoleNames = currentUserRoles.map((ur) => ur.role.name);

    if (
      roleName === Role.ADMIN &&
      !currentUserRoleNames.includes(Role.SUPER_ADMIN)
    ) {
      throw new ForbiddenException('Only SUPER_ADMIN can remove ADMIN role');
    }

    // Find the user branch role to remove
    const userBranch = await this.prisma.userBranch.findFirst({
      where: {
        userId,
        branchId,
        role: {
          name: roleName,
        },
      },
    });

    if (!userBranch) {
      throw new NotFoundException(
        `User does not have role ${roleName} in this branch`,
      );
    }

    // Remove the role from the user
    await this.prisma.userBranch.delete({
      where: {
        userId_roleId: {
          userId: userBranch.userId,
          roleId: userBranch.roleId,
        },
      },
    });

    // Return the updated user with roles
    return this.getUserWithRoles(userId, branchId);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async addUserToBranch(
    @Args('userId', { type: () => String }) userId: string,
    @Args('branchId', { type: () => String }) branchId: string,
    @Args('role', { type: () => String }) roleName: string,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    // Check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if the branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    // Check if the role exists
    const role = await this.prisma.role.findFirst({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }

    // Check if the current user has permission to assign this role
    // Only SUPER_ADMIN can assign ADMIN role
    const currentUserRoles = await this.prisma.userBranch.findMany({
      where: { userId: currentUser.id },
      include: { role: true },
    });

    const currentUserRoleNames = currentUserRoles.map((ur) => ur.role.name);

    if (
      roleName === Role.ADMIN &&
      !currentUserRoleNames.includes(Role.SUPER_ADMIN)
    ) {
      throw new ForbiddenException('Only SUPER_ADMIN can assign ADMIN role');
    }

    // Check if the user is already in the branch
    const existingUserBranch = await this.prisma.userBranch.findFirst({
      where: {
        userId,
        branchId,
      },
    });

    if (existingUserBranch) {
      // User is already in the branch, assign the role
      return this.assignUserRole(userId, branchId, roleName, currentUser);
    }

    // Add the user to the branch with the specified role
    await this.prisma.userBranch.create({
      data: {
        user: {
          connect: { id: userId },
        },
        branch: {
          connect: { id: branchId },
        },
        role: {
          connect: { id: role.id },
        },
      },
    });

    // Return the updated user with roles
    return this.getUserWithRoles(userId, branchId);
  }

  // Helper method to get user with roles
  private async getUserWithRoles(
    userId: string,
    branchId: string,
  ): Promise<User> {
    const userWithBranches = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userBranches: {
          where: {
            branchId,
          },
          include: {
            role: true,
          },
        },
      },
    });

    if (!userWithBranches) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const roles = userWithBranches.userBranches.map((ub) => ub.role.name);

    return {
      ...userWithBranches,
      roles,
      // Ensure name getter works by providing firstName and lastName
      get name() {
        return (
          [userWithBranches.firstName, userWithBranches.lastName]
            .filter(Boolean)
            .join(' ') || 'Unknown'
        );
      },
    };
  }

  @ResolveField('location', () => String, { nullable: true })
  location(@Parent() branch: Branch): string | null {
    // Compose location from address, city, country (ignore empty/null values)
    const parts = [branch.address, branch.city, branch.country].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  }

  @ResolveField('statistics', () => BranchStatistics)
  async getBranchStatistics(
    @Parent() branch: Branch,
  ): Promise<BranchStatistics> {
    const { id: branchId } = branch;

    // Helper function to get statistics for a given period
    const getStatsForPeriod = async (
      periodBranchId: string,
      periodStartDate: Date,
      periodEndDate: Date,
    ): Promise<Omit<BranchStatistics, 'lastMonth'>> => {
      const totalMembersPromise = this.membersService.count({
        branchId: periodBranchId,
      });
      const activeMembersPromise = this.membersService.count({
        branchId: periodBranchId,
        status: MemberStatus.ACTIVE,
      });
      const inactiveMembersPromise = this.membersService.count({
        branchId: periodBranchId,
        status: MemberStatus.INACTIVE,
      });
      // Assuming 'membershipDate' for new members
      const newMembersInPeriodPromise = this.membersService.count({
        branchId: periodBranchId,
        membershipDate: {
          gte: periodStartDate,
          lte: periodEndDate,
        },
      });

      // Get total families count
      const totalFamiliesPromise = this.prisma.family.count({
        where: {
          members: {
            some: {
              branchId: periodBranchId,
            },
          },
        },
      });

      // Get ministry count
      const totalMinistriesPromise = this.prisma.ministry.count({
        where: {
          branchId: periodBranchId,
        },
      });

      // Get sacrament counts for the current year
      const currentYear = periodEndDate.getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

      const baptismsYTDPromise = this.prisma.sacramentalRecord.count({
        where: {
          branchId: periodBranchId,
          sacramentType: SacramentType.BAPTISM,
          createdAt: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
      });

      const firstCommunionsYTDPromise = this.prisma.sacramentalRecord.count({
        where: {
          branchId: periodBranchId,
          sacramentType: SacramentType.EUCHARIST_FIRST_COMMUNION,
          createdAt: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
      });

      const confirmationsYTDPromise = this.prisma.sacramentalRecord.count({
        where: {
          branchId: periodBranchId,
          sacramentType: SacramentType.CONFIRMATION,
          createdAt: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
      });

      const marriagesYTDPromise = this.prisma.sacramentalRecord.count({
        where: {
          branchId: periodBranchId,
          sacramentType: SacramentType.MATRIMONY,
          createdAt: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
      });

      // Calculate average weekly attendance
      // We'll use attendance records from the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const attendanceRecordsPromise = this.prisma.attendanceRecord.findMany({
        where: {
          branchId: periodBranchId,
          checkInTime: {
            gte: threeMonthsAgo,
            lte: periodEndDate,
          },
        },
      });

      // Get financial data for the branch
      const financialDataPromise = this.prisma.contribution.groupBy({
        by: ['branchId'],
        where: {
          branchId: periodBranchId,
          createdAt: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const expensesPromise = this.prisma.expense.groupBy({
        by: ['branchId'],
        where: {
          branchId: periodBranchId,
          createdAt: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const budgetPromise = this.prisma.budget.findFirst({
        where: {
          branchId: periodBranchId,
          fiscalYear: currentYear,
        },
        select: {
          totalAmount: true,
        },
      });

      const [
        totalMembers,
        activeMembers,
        inactiveMembers,
        newMembersInPeriod,
        totalFamilies,
        totalMinistries,
        baptismsYTD,
        firstCommunionsYTD,
        confirmationsYTD,
        marriagesYTD,
        attendanceRecords,
        financialData,
        expenses,
        budget,
      ] = await Promise.all([
        totalMembersPromise,
        activeMembersPromise,
        inactiveMembersPromise,
        newMembersInPeriodPromise,
        totalFamiliesPromise,
        totalMinistriesPromise,
        baptismsYTDPromise,
        firstCommunionsYTDPromise,
        confirmationsYTDPromise,
        marriagesYTDPromise,
        attendanceRecordsPromise,
        financialDataPromise,
        expensesPromise,
        budgetPromise,
      ]);

      // Calculate average weekly attendance
      let averageWeeklyAttendance = 0;
      if (attendanceRecords.length > 0) {
        // Just count the number of attendance records
        averageWeeklyAttendance = Math.round(attendanceRecords.length / 12); // Assuming 12 weeks in 3 months
      }

      return {
        totalMembers,
        activeMembers,
        inactiveMembers,
        newMembersInPeriod,
        totalFamilies,
        totalMinistries,
        baptismsYTD,
        firstCommunionsYTD,
        confirmationsYTD,
        marriagesYTD,
        averageWeeklyAttendance,
        annualBudget: budget?.totalAmount
          ? Number(budget.totalAmount)
          : undefined,
        ytdIncome: financialData[0]?._sum?.amount
          ? Number(financialData[0]._sum.amount)
          : undefined,
        ytdExpenses: expenses[0]?._sum?.amount
          ? Number(expenses[0]._sum.amount)
          : undefined,
      };
    };

    // Current month calculations
    const now = new Date();
    const currentMonthStartDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );
    const currentMonthEndDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Previous month calculations
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
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
      branchId,
      currentMonthStartDate,
      currentMonthEndDate,
    );
    const lastMonthStatsPromise = getStatsForPeriod(
      branchId,
      prevMonthStartDate,
      prevMonthEndDate,
    );

    const [currentMonthStats, lastMonthStats] = await Promise.all([
      currentMonthStatsPromise,
      lastMonthStatsPromise,
    ]);

    return {
      ...currentMonthStats,
      lastMonth: lastMonthStats,
    };
  }

  @ResolveField('incomingTransfers', () => PaginatedTransferRequests)
  async getIncomingTransfers(
    @Parent() branch: Branch,
    @Args('paginationInput', { nullable: true })
    paginationInput?: PaginationInput,
  ): Promise<PaginatedTransferRequests> {
    const { id: branchId } = branch;
    const { skip = 0, take = 10 } = paginationInput || {};

    const where = { destinationBranchId: branchId };

    const [items, totalCount] = await Promise.all([
      this.prisma.transferRequest.findMany({
        where,
        skip,
        take,
        orderBy: { requestDate: 'desc' },
      }),
      this.prisma.transferRequest.count({ where }),
    ]);

    return {
      items: items as unknown as TransferRequest[],
      hasNextPage: skip + take < totalCount,
      totalCount,
    };
  }

  @ResolveField('outgoingTransfers', () => PaginatedTransferRequests)
  async getOutgoingTransfers(
    @Parent() branch: Branch,
    @Args('paginationInput', { nullable: true })
    paginationInput?: PaginationInput,
  ): Promise<PaginatedTransferRequests> {
    const { id: branchId } = branch;
    const { skip = 0, take = 10 } = paginationInput || {};

    const where = { sourceBranchId: branchId };

    const [items, totalCount] = await Promise.all([
      this.prisma.transferRequest.findMany({
        where,
        skip,
        take,
        orderBy: { requestDate: 'desc' },
      }),
      this.prisma.transferRequest.count({ where }),
    ]);

    return {
      items: items as unknown as TransferRequest[],
      hasNextPage: skip + take < totalCount,
      totalCount,
    };
  }

  @ResolveField('branchAdmin', () => User, { nullable: true })
  async getBranchAdmin(@Parent() branch: Branch): Promise<User | null> {
    const { id: branchId } = branch;

    // Find the first user with BRANCH_ADMIN role for this branch
    const branchAdmin = await this.prisma.user.findFirst({
      where: {
        userBranches: {
          some: {
            branchId,
            role: {
              name: 'BRANCH_ADMIN',
            },
          },
        },
      },
      include: {
        roles: true,
      },
    });

    return branchAdmin as unknown as User;
  }
}
