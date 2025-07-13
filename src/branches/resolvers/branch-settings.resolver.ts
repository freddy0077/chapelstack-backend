import {
  Resolver,
  Query,
  Args,
  ResolveField,
  Parent,
  Mutation,
} from '@nestjs/graphql';
import { BranchSettings } from '../entities/branch-settings.entity';
import { Branch } from '../entities/branch.entity';
import { BranchesService } from '../branches.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateBranchSettingsInput } from '../dto/update-branch-settings.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { ForbiddenException } from '@nestjs/common';

@Resolver(() => Branch)
@UseGuards(GqlAuthGuard)
export class BranchSettingsResolver {
  constructor(
    private branchesService: BranchesService,
    private prisma: PrismaService,
  ) {}

  @ResolveField(() => BranchSettings, { nullable: true })
  async branchSettings(@Parent() branch: Branch): Promise<BranchSettings> {
    const branchId = branch.id;

    // Find existing settings in the database
    const existingSettings = await this.prisma.branchSetting.findFirst({
      where: {
        branchId,
      },
    });

    if (existingSettings) {
      // Parse nested JSON settings
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
        id: existingSettings.id,
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
        createdAt: existingSettings.createdAt,
        updatedAt: existingSettings.updatedAt,
      };
    }

    // Return default settings if none exist
    return {
      id: `default-${branchId}`,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  @Mutation(() => BranchSettings)
  async updateBranchSettings(
    @Args('branchId') branchId: string,
    @Args('input') input: UpdateBranchSettingsInput,
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

    if (isSuperAdmin) {
      // Super admin has permission
    } else {
      // Check if user is a branch admin for this branch
      const isBranchAdmin = await this.prisma.userBranch.findFirst({
        where: {
          userId: user.id,
          branchId: branchId,
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

      if (!isBranchAdmin && !hasPermission) {
        throw new ForbiddenException(
          'You do not have permission to update branch settings',
        );
      }
    }

    // Find existing settings in the database
    const existingSettings = await this.prisma.branchSetting.findFirst({
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
      ...(input.brandingSettings || {}),
    };

    // Merge new notification settings with existing ones
    const notificationSettings = {
      ...(existingValue.notificationSettings || {
        emailNotifications: true,
        smsNotifications: false,
        transferNotifications: true,
        financialNotifications: true,
      }),
      ...(input.notificationSettings || {}),
    };

    // Update or create branch settings
    const updatedSettings = await this.prisma.branchSetting.upsert({
      where: {
        id: existingSettings?.id || 'create-new',
      },
      create: {
        branchId,
        allowMemberTransfers: input.allowMemberTransfers ?? true,
        value: JSON.stringify({
          brandingSettings,
          notificationSettings,
        }),
      },
      update: {
        allowMemberTransfers:
          input.allowMemberTransfers ??
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
      allowResourceSharing: input.allowResourceSharing || true,
      visibilityToOtherBranches: input.visibilityToOtherBranches || 'limited',
      financialReportingLevel: input.financialReportingLevel || 'summary',
      attendanceReportingLevel: input.attendanceReportingLevel || 'summary',
      memberDataVisibility: input.memberDataVisibility || 'limited',
      timezone: input.timezone || 'UTC',
      currency: input.currency || 'USD',
      language: input.language || 'en',
      brandingSettings,
      notificationSettings,
      createdAt: updatedSettings.createdAt,
      updatedAt: updatedSettings.updatedAt,
    };
  }

  @ResolveField(() => Boolean)
  async canUpdateSettings(
    @Parent() branch: Branch,
    @CurrentUser() user: User,
  ): Promise<boolean> {
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

    if (isSuperAdmin) {
      return true;
    }

    // Check if user is a branch admin for this branch
    const isBranchAdmin = await this.prisma.userBranch.findFirst({
      where: {
        userId: user.id,
        branchId: branch.id,
        role: {
          name: 'BRANCH_ADMIN',
        },
      },
    });

    if (isBranchAdmin) {
      return true;
    }

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

    return !!hasPermission;
  }
}
