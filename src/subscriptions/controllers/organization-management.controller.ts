import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { Permission } from '../../auth/enums/permission.enum';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { OrganizationManagementService } from '../services/organization-management.service';
import { OrganizationFilterInput } from '../dto/organization-filter.input';
import { DisableOrganizationInput } from '../dto/disable-organization.input';

@Controller('subscription-manager/organizations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrganizationManagementController {
  constructor(
    private readonly organizationManagementService: OrganizationManagementService,
  ) {}

  @Get()
  @RequirePermissions({
    action: Permission.MANAGE_ORGANIZATION_SUBSCRIPTIONS,
    subject: 'Organization',
  })
  async getOrganizations(@Query() filter: OrganizationFilterInput) {
    return this.organizationManagementService.getOrganizations(filter);
  }

  @Get('stats')
  @RequirePermissions({
    action: Permission.VIEW_SUBSCRIPTION_ANALYTICS,
    subject: 'Organization',
  })
  async getOrganizationStats() {
    return this.organizationManagementService.getOrganizationStats();
  }

  @Get(':id')
  @RequirePermissions({
    action: Permission.MANAGE_ORGANIZATION_SUBSCRIPTIONS,
    subject: 'Organization',
  })
  async getOrganizationById(@Param('id') id: string) {
    return this.organizationManagementService.getOrganizationById(id);
  }

  @Post(':id/enable')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions({
    action: Permission.ENABLE_DISABLE_ORGANIZATIONS,
    subject: 'Organization',
  })
  async enableOrganization(@Param('id') id: string, @CurrentUser() user: User) {
    return this.organizationManagementService.enableOrganization(id, user.id);
  }

  @Post(':id/disable')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions({
    action: Permission.ENABLE_DISABLE_ORGANIZATIONS,
    subject: 'Organization',
  })
  async disableOrganization(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: User,
  ) {
    return this.organizationManagementService.disableOrganization(
      id,
      user.id,
      body.reason,
    );
  }

  @Put(':id/status')
  @RequirePermissions({
    action: Permission.ENABLE_DISABLE_ORGANIZATIONS,
    subject: 'Organization',
  })
  async updateOrganizationStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
    @CurrentUser() user: User,
  ) {
    return this.organizationManagementService.updateOrganizationStatus(
      id,
      body.status as any,
      user.id,
      body.reason,
    );
  }
}
