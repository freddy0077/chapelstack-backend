import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SuperAdminDashboardService } from '../services/super-admin-dashboard.service';
import { SuperAdminDashboardData } from '../entities/super-admin-dashboard-data.entity';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Resolver()
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class SuperAdminDashboardResolver {
  constructor(private superAdminDashboardService: SuperAdminDashboardService) {}

  @Query(() => SuperAdminDashboardData, { name: 'superAdminDashboardData' })
  @RequirePermissions({ action: 'view', subject: 'dashboard' })
  async superAdminDashboardData(
    @CurrentUser() user: { id: string },
    @Args('organisationId', { type: () => ID, nullable: true }) organisationId?: string
  ): Promise<SuperAdminDashboardData> {
    // Aggregate all dashboard info for super admin
    if (!organisationId) throw new Error('organisationId is required');
    return this.superAdminDashboardService.getSuperAdminDashboardData(organisationId);
  }
}
