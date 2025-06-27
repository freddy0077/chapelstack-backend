import { Resolver, Mutation, Args, Query, ID } from '@nestjs/graphql';
import { SettingsService } from './settings.service';
import { Setting } from './entities/setting.entity';
import { CreateSettingInput } from './dto/create-setting.input';
import { UpdateSettingInput } from './dto/update-setting.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver(() => Setting)
@UseGuards(GqlAuthGuard, RolesGuard)
export class SettingsResolver {
  constructor(private readonly settingsService: SettingsService) {}

  @Mutation(() => Setting, { name: 'createBranchSetting' })
  //   @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async createBranchSetting(
    @Args('input') input: CreateSettingInput,
  ): Promise<Setting> {
    // Allow branchId to be optional/null for global settings
    return this.settingsService.create(input);
  }

  @Mutation(() => Setting, { name: 'updateSetting' })
  async updateSetting(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSettingInput,
  ): Promise<Setting> {
    return this.settingsService.update(id, input);
  }

  @Query(() => [Setting], { name: 'settings' })
  async getSettings(
    @Args('branchId', { type: () => String, nullable: true }) branchId?: string,
  ): Promise<Setting[]> {
    // If branchId is provided, fetch settings for that branch and global (null) settings
    // If not provided, fetch only global (branchId is null) settings
    if (branchId) {
      return this.settingsService.findAll(branchId);
    }
    // Fetch only settings where branchId is null
    return this.settingsService.findAll(undefined, true);
  }
}
