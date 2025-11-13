import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SystemConfigService } from '../services/system-config.service';
import { ObjectType, Field, InputType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class SystemConfigType {
  @Field()
  key: string;

  @Field()
  value: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  type?: string;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class FeatureFlagsType {
  @Field()
  newDashboard: boolean;

  @Field()
  advancedReporting: boolean;

  @Field()
  apiIntegrations: boolean;

  @Field()
  customRoles: boolean;

  @Field()
  bulkOperations: boolean;

  @Field()
  dataExport: boolean;

  @Field()
  maintenanceMode: boolean;
}

@ObjectType()
export class EmailSettingsType {
  @Field()
  provider: string;

  @Field()
  apiKey: string;

  @Field()
  fromEmail: string;

  @Field()
  fromName: string;

  @Field()
  replyTo: string;
}

@ObjectType()
export class PaymentSettingsType {
  @Field()
  provider: string;

  @Field()
  publicKey: string;

  @Field()
  secretKey: string;

  @Field()
  currency: string;

  @Field()
  testMode: boolean;
}

@ObjectType()
export class SecuritySettingsType {
  @Field()
  sessionTimeout: number;

  @Field()
  maxLoginAttempts: number;

  @Field()
  passwordMinLength: number;

  @Field()
  requireMFA: boolean;

  @Field(() => [String])
  ipWhitelist: string[];

  @Field()
  enableAuditLogging: boolean;

  @Field()
  dataEncryption: boolean;
}

@InputType()
export class UpdateSystemConfigInputType {
  @Field()
  key: string;

  @Field()
  value: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  type?: string;
}

@InputType()
export class UpdateEmailSettingsInputType {
  @Field({ nullable: true })
  provider?: string;

  @Field({ nullable: true })
  apiKey?: string;

  @Field({ nullable: true })
  fromEmail?: string;

  @Field({ nullable: true })
  fromName?: string;

  @Field({ nullable: true })
  replyTo?: string;
}

@InputType()
export class UpdatePaymentSettingsInputType {
  @Field({ nullable: true })
  provider?: string;

  @Field({ nullable: true })
  publicKey?: string;

  @Field({ nullable: true })
  secretKey?: string;

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  testMode?: boolean;
}

@InputType()
export class UpdateSecuritySettingsInputType {
  @Field({ nullable: true })
  sessionTimeout?: number;

  @Field({ nullable: true })
  maxLoginAttempts?: number;

  @Field({ nullable: true })
  passwordMinLength?: number;

  @Field({ nullable: true })
  requireMFA?: boolean;

  @Field(() => [String], { nullable: true })
  ipWhitelist?: string[];

  @Field({ nullable: true })
  enableAuditLogging?: boolean;

  @Field({ nullable: true })
  dataEncryption?: boolean;
}

@Resolver()
export class SystemConfigResolver {
  constructor(private systemConfigService: SystemConfigService) {}

  @Query(() => String, { name: 'godModeSystemConfigs' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getAllConfigs(@Context() context: any) {
    const configs = await this.systemConfigService.getAllConfigs();
    return JSON.stringify(configs);
  }

  @Query(() => String, { name: 'godModeSystemConfig' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getConfig(
    @Args('key') key: string,
    @Context() context: any,
  ) {
    const config = await this.systemConfigService.getConfig(key);
    return JSON.stringify(config);
  }

  @Query(() => FeatureFlagsType, { name: 'godModeFeatureFlags' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getFeatureFlags(@Context() context: any) {
    return this.systemConfigService.getFeatureFlags();
  }

  @Query(() => EmailSettingsType, { name: 'godModeEmailSettings' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getEmailSettings(@Context() context: any) {
    return this.systemConfigService.getEmailSettings();
  }

  @Query(() => PaymentSettingsType, { name: 'godModePaymentSettings' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getPaymentSettings(@Context() context: any) {
    return this.systemConfigService.getPaymentSettings();
  }

  @Query(() => SecuritySettingsType, { name: 'godModeSecuritySettings' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getSecuritySettings(@Context() context: any) {
    return this.systemConfigService.getSecuritySettings();
  }

  @Mutation(() => SystemConfigType, { name: 'godModeUpdateSystemConfig' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async updateConfig(
    @Args('input') input: UpdateSystemConfigInputType,
    @Context() context: any,
  ) {
    return this.systemConfigService.updateConfig(input);
  }

  @Mutation(() => FeatureFlagsType, { name: 'godModeToggleFeatureFlag' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async toggleFeatureFlag(
    @Args('flag') flag: string,
    @Args('enabled') enabled: boolean,
    @Context() context: any,
  ) {
    await this.systemConfigService.toggleFeatureFlag(flag, enabled);
    return this.systemConfigService.getFeatureFlags();
  }

  @Mutation(() => EmailSettingsType, { name: 'godModeUpdateEmailSettings' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async updateEmailSettings(
    @Args('input') input: UpdateEmailSettingsInputType,
    @Context() context: any,
  ) {
    return this.systemConfigService.updateEmailSettings(input);
  }

  @Mutation(() => PaymentSettingsType, { name: 'godModeUpdatePaymentSettings' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async updatePaymentSettings(
    @Args('input') input: UpdatePaymentSettingsInputType,
    @Context() context: any,
  ) {
    return this.systemConfigService.updatePaymentSettings(input);
  }

  @Mutation(() => SecuritySettingsType, { name: 'godModeUpdateSecuritySettings' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async updateSecuritySettings(
    @Args('input') input: UpdateSecuritySettingsInputType,
    @Context() context: any,
  ) {
    return this.systemConfigService.updateSecuritySettings(input);
  }
}
