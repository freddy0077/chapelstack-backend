import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { UseGuards } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import {
  DashboardData,
  DashboardType,
} from '../entities/dashboard-data.entity';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { UserDashboardPreference } from '../entities/user-dashboard-preference.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Resolver()
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class DashboardResolver {
  constructor(private dashboardService: DashboardService) {}

  @Query(() => DashboardData)
  @RequirePermissions({ action: 'view', subject: 'dashboard' })
  async dashboardData(
    @CurrentUser() user: { id: string },
    @Args('dashboardType', { type: () => DashboardType })
    dashboardType: DashboardType,
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
    @Args('organisationId', { type: () => ID, nullable: true })
    organisationId?: string,
  ): Promise<DashboardData> {
    return await this.dashboardService.getDashboardData(
      user.id,
      dashboardType,
      branchId,
      organisationId,
    );
  }

  @Query(() => UserDashboardPreference, { nullable: true })
  @RequirePermissions({ action: 'view', subject: 'dashboard' })
  async userDashboardPreference(
    @CurrentUser() user: { id: string },
    @Args('dashboardType', { type: () => DashboardType })
    dashboardType: DashboardType,
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('organisationId', { type: () => ID, nullable: true })
    organisationId?: string,
  ): Promise<UserDashboardPreference | null> {
    return await this.dashboardService.getUserDashboardPreference(
      user.id,
      dashboardType,
      branchId,
    );
  }

  @Mutation(() => UserDashboardPreference)
  @RequirePermissions({ action: 'update', subject: 'dashboard' })
  async saveUserDashboardPreference(
    @CurrentUser() user: { id: string },
    @Args('dashboardType', { type: () => DashboardType })
    dashboardType: DashboardType,
    @Args('layoutConfig', { type: () => GraphQLJSON })
    layoutConfig: Record<string, any>,
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('organisationId', { type: () => ID, nullable: true })
    organisationId?: string,
  ): Promise<UserDashboardPreference> {
    return await this.dashboardService.saveUserDashboardPreference(
      user.id,
      dashboardType,
      layoutConfig,
      branchId,
      organisationId,
    );
  }
}
