import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ModuleSettingsService } from '../services/module-settings.service';

@ObjectType()
export class ModuleSettingType {
  @Field()
  key: string;

  @Field()
  value: String;

  @Field()
  type: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class ModuleType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  enabled: boolean;

  @Field()
  icon: string;

  @Field()
  category: string;

  @Field(() => [String])
  dependencies: string[];

  @Field(() => [ModuleSettingType])
  settings: ModuleSettingType[];

  @Field(() => [String], { nullable: true })
  features?: string[];
}

@ObjectType()
export class ModulesResponseType {
  @Field(() => [ModuleType])
  modules: ModuleType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
export class ModuleDependencyType {
  @Field()
  moduleId: string;

  @Field(() => [String])
  dependencies: string[];

  @Field()
  canDisable: boolean;

  @Field(() => [String])
  dependentModules: string[];
}

@ObjectType()
export class ModuleCategoryType {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => [String])
  modules: string[];
}

@ObjectType()
export class ModuleCategoriesResponseType {
  @Field(() => [ModuleCategoryType])
  categories: ModuleCategoryType[];
}

@ObjectType()
export class ModulePerformanceType {
  @Field()
  avgResponseTime: string;

  @Field()
  errorRate: string;

  @Field()
  uptime: string;
}

@ObjectType()
export class ModuleUsageStatsType {
  @Field()
  moduleId: string;

  @Field()
  lastUsed: Date;

  @Field(() => Int)
  usageCount: number;

  @Field(() => Int)
  activeUsers: number;

  @Field()
  dataSize: string;

  @Field(() => ModulePerformanceType)
  performance: ModulePerformanceType;
}

@ObjectType()
export class UpdateModuleSettingsResponseType {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => ModuleType)
  module: ModuleType;
}

@ObjectType()
export class ConfigureModuleResponseType {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => ModuleType)
  module: ModuleType;
}

@ObjectType()
export class ResetModuleResponseType {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => ModuleType)
  module: ModuleType;
}

@InputType()
export class ModuleSettingsInputType {
  @Field()
  moduleId: string;

  @Field()
  enabled: boolean;

  @Field({ nullable: true })
  settings?: String;
}

@InputType()
export class ModuleConfigInputType {
  @Field()
  moduleId: string;

  @Field()
  config: String;
}

@Resolver()
export class ModuleSettingsResolver {
  constructor(private moduleSettingsService: ModuleSettingsService) {}

  @Query(() => ModulesResponseType, { name: 'godModeAllModules' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getAllModules(
    @Args('skip', { type: () => Int, nullable: true }) skip: number = 0,
    @Args('take', { type: () => Int, nullable: true }) take: number = 20,
    @Context() context: any,
  ) {
    return this.moduleSettingsService.getAllModules(skip, take);
  }

  @Query(() => ModuleType, { name: 'godModeModuleById' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getModuleById(
    @Args('moduleId') moduleId: string,
    @Context() context: any,
  ) {
    return this.moduleSettingsService.getModuleById(moduleId);
  }

  @Query(() => ModuleDependencyType, { name: 'godModeModuleDependencies' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getModuleDependencies(
    @Args('moduleId') moduleId: string,
    @Context() context?: any,
  ) {
    return this.moduleSettingsService.getModuleDependencies(moduleId);
  }

  @Query(() => ModuleCategoriesResponseType, { name: 'godModeModuleCategories' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getModuleCategories(@Context() context: any) {
    return this.moduleSettingsService.getModuleCategories();
  }

  @Query(() => ModuleUsageStatsType, { name: 'godModeModuleUsageStats' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getModuleUsageStats(
    @Args('moduleId') moduleId: string,
    @Context() context: any,
  ) {
    return this.moduleSettingsService.getModuleUsageStats(moduleId);
  }

  @Mutation(() => UpdateModuleSettingsResponseType, { name: 'godModeUpdateModuleSettings' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async updateModuleSettings(
    @Args('moduleId') moduleId: string,
    @Args('enabled') enabled: boolean,
    @Args('settings', { nullable: true }) settings?: string,
    @Context() context?: any,
  ) {
    return this.moduleSettingsService.updateModuleSettings({
      moduleId,
      enabled,
      settings: settings ? JSON.parse(settings) : undefined,
    });
  }

  @Mutation(() => ConfigureModuleResponseType, { name: 'godModeConfigureModule' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async configureModule(
    @Args('moduleId') moduleId: string,
    @Args('config') config: string,
    @Context() context: any,
  ) {
    return this.moduleSettingsService.configureModule({
      moduleId,
      config: JSON.parse(config),
    });
  }

  @Mutation(() => ResetModuleResponseType, { name: 'godModeResetModuleSettings' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async resetModuleSettings(
    @Args('moduleId') moduleId: string,
    @Context() context: any,
  ) {
    return this.moduleSettingsService.resetModuleSettings(moduleId);
  }
}
