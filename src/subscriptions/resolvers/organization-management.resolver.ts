import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { Permission } from '../../auth/enums/permission.enum';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { OrganizationManagementService } from '../services/organization-management.service';
import { OrganizationFilterInput } from '../dto/organization-filter.input';
import { DisableOrganizationInput } from '../dto/disable-organization.input';
import {
  OrganizationWithSubscription,
  OrganizationStats,
} from '../entities/organization-management.entity';

@Resolver(() => OrganizationWithSubscription)
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class OrganizationManagementResolver {
  constructor(
    private readonly organizationManagementService: OrganizationManagementService,
  ) {}

  @Query(() => [OrganizationWithSubscription], {
    name: 'subscriptionOrganizations',
  })
  // @RequirePermissions({
  //   action: Permission.MANAGE_ORGANIZATION_SUBSCRIPTIONS,
  //   subject: 'Organization',
  // })
  async getOrganizations(
    @Args('filter', { type: () => OrganizationFilterInput, nullable: true })
    filter?: OrganizationFilterInput,
  ): Promise<OrganizationWithSubscription[]> {
    return this.organizationManagementService.getOrganizations(filter);
  }

  @Query(() => OrganizationWithSubscription, {
    name: 'organizationSubscriptionDetails',
  })
  @RequirePermissions({
    action: Permission.MANAGE_ORGANIZATION_SUBSCRIPTIONS,
    subject: 'Organization',
  })
  async getOrganizationById(
    @Args('id', { type: () => String }) id: string,
  ): Promise<OrganizationWithSubscription> {
    return this.organizationManagementService.getOrganizationById(id);
  }

  @Query(() => OrganizationStats, { name: 'organizationStats' })
  // @RequirePermissions({
  //   action: Permission.VIEW_SUBSCRIPTION_ANALYTICS,
  //   subject: 'Organization',
  // })
  async getOrganizationStats(): Promise<OrganizationStats> {
    return this.organizationManagementService.getOrganizationStats();
  }

  @Mutation(() => OrganizationWithSubscription, { name: 'enableOrganization' })
  // @RequirePermissions({
  //   action: Permission.ENABLE_DISABLE_ORGANIZATIONS,
  //   subject: 'Organization',
  // })
  async enableOrganization(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user: User,
  ): Promise<OrganizationWithSubscription> {
    return this.organizationManagementService.enableOrganization(id, user.id);
  }

  @Mutation(() => OrganizationWithSubscription, { name: 'disableOrganization' })
  @RequirePermissions({
    action: Permission.ENABLE_DISABLE_ORGANIZATIONS,
    subject: 'Organization',
  })
  async disableOrganization(
    @Args('input', { type: () => DisableOrganizationInput })
    input: DisableOrganizationInput,
    @CurrentUser() user: User,
  ): Promise<OrganizationWithSubscription> {
    return this.organizationManagementService.disableOrganization(
      input.organizationId,
      user.id,
      input.reason,
    );
  }
}
