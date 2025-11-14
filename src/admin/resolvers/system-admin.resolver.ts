import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { SystemAdminService } from '../services/system-admin.service';
import { SystemHealth } from '../entities/system-health.entity';
import { SystemAnnouncement } from '../entities/announcement.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from '../dto/announcement.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class SystemAdminResolver {
  constructor(private readonly systemAdminService: SystemAdminService) {}

  @Query(() => SystemHealth, { name: 'systemHealth' })
  @Roles('ADMIN', 'SYSTEM_ADMIN')
  async getSystemHealth() {
    return this.systemAdminService.getSystemHealth();
  }

  @Query(() => [SystemAnnouncement], { name: 'systemAnnouncements' })
  async getAnnouncements(
    @CurrentUser() user: any,
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
  ) {
    return this.systemAdminService.getActiveAnnouncements(user.id, branchId);
  }

  @Mutation(() => SystemAnnouncement, { name: 'systemCreateAnnouncement' })
  @Roles('ADMIN', 'SYSTEM_ADMIN')
  async createAnnouncement(
    @Args('input') createAnnouncementInput: CreateAnnouncementInput,
  ) {
    const {
      title,
      content,
      startDate,
      endDate,
      targetRoleIds,
      targetBranchIds,
    } = createAnnouncementInput;

    return this.systemAdminService.createAnnouncement(
      title,
      content,
      new Date(startDate),
      new Date(endDate),
      targetRoleIds,
      targetBranchIds,
    );
  }

  @Mutation(() => SystemAnnouncement, { name: 'systemUpdateAnnouncement' })
  @Roles('ADMIN', 'SYSTEM_ADMIN')
  async updateAnnouncement(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateAnnouncementInput: UpdateAnnouncementInput,
  ) {
    const {
      title,
      content,
      startDate,
      endDate,
      targetRoleIds,
      targetBranchIds,
      isActive,
    } = updateAnnouncementInput;

    return this.systemAdminService.updateAnnouncement(
      id,
      title,
      content,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      targetRoleIds,
      targetBranchIds,
      isActive,
    );
  }

  @Mutation(() => SystemAnnouncement, { name: 'systemDeleteAnnouncement' })
  @Roles('ADMIN', 'SYSTEM_ADMIN')
  async deleteAnnouncement(@Args('id', { type: () => ID }) id: string) {
    return this.systemAdminService.deleteAnnouncement(id);
  }
}
