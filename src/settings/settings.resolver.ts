import { Resolver, Mutation, Args, Query, ID, Context } from '@nestjs/graphql';
import { UseGuards, HttpException } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Services
import { BranchSettingsService } from './services/branch-settings.service';
import { EmailSettingsService } from './services/email-settings.service';
import { SmsSettingsService } from './services/sms-settings.service';
import { PaymentSettingsService } from './services/payment-settings.service';
import { ModuleSettingsService } from './services/module-settings.service';
import { MobileAppSettingsService } from './services/mobile-app-settings.service';
import { BackupService } from './services/backup.service';
import { SettingsAuditService } from './services/settings-audit.service';

// Entities
import { BranchSettingsEntity } from './entities/branch-settings.entity';
import { EmailSettingsEntity } from './entities/email-settings.entity';
import { SmsSettingsEntity } from './entities/sms-settings.entity';
import { PaymentSettingsEntity } from './entities/payment-settings.entity';
import { ModuleSettingsEntity, EnabledModulesEntity } from './entities/module-settings.entity';
import { MobileAppSettingsEntity } from './entities/mobile-app-settings.entity';
import { BackupSettingsEntity, BackupEntity, BackupListEntity } from './entities/backup-settings.entity';
import { AuditLogListEntity, AuditStatisticsEntity, ActiveUserEntity, ChangedSettingEntity } from './entities/settings-audit-log.entity';

// DTOs
import { UpdateBranchSettingsInput, UpdateBrandingInput, UpdateCurrencyInput, UpdateAttendanceTypeInput } from './dto/update-branch-settings.input';
import { UpdateEmailSettingsInput, SendTestEmailInput } from './dto/update-email-settings.input';
import { UpdateSmsSettingsInput, SendTestSmsInput } from './dto/update-sms-settings.input';
import { UpdatePaymentSettingsInput, UpdateGatewayInput, ValidateGatewayInput } from './dto/update-payment-settings.input';
import { UpdateModuleSettingsInput, ToggleModuleInput } from './dto/update-module-settings.input';
import { UpdateMobileAppSettingsInput, UpdateAppBrandingInput, ToggleFeatureInput } from './dto/update-mobile-app-settings.input';
import { UpdateBackupSettingsInput, RestoreBackupInput } from './dto/update-backup-settings.input';
import { AuditLogFilterInput } from './dto/audit-log-filter.input';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class SettingsResolver {
  constructor(
    private readonly branchSettings: BranchSettingsService,
    private readonly emailSettings: EmailSettingsService,
    private readonly smsSettings: SmsSettingsService,
    private readonly paymentSettings: PaymentSettingsService,
    private readonly moduleSettings: ModuleSettingsService,
    private readonly mobileAppSettings: MobileAppSettingsService,
    private readonly backupService: BackupService,
    private readonly auditService: SettingsAuditService,
  ) {}

  // ==================== BRANCH SETTINGS ====================

  @Query(() => BranchSettingsEntity, { name: 'branchSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async getBranchSettings(@Context() context: any) {
    const branchId = context.req.user.branchId;
    return this.branchSettings.getBranchSettings(branchId);
  }

  @Mutation(() => BranchSettingsEntity, { name: 'updateBranchSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async updateBranchSettings(
    @Args('input') input: UpdateBranchSettingsInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.branchSettings.updateBranchSettings(branchId, input, userId);
  }

  @Mutation(() => BranchSettingsEntity, { name: 'updateBranding' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async updateBranding(
    @Args('input') input: UpdateBrandingInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.branchSettings.updateBranding(branchId, input, userId);
  }

  @Mutation(() => BranchSettingsEntity, { name: 'updateCurrency' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async updateCurrency(
    @Args('input') input: UpdateCurrencyInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.branchSettings.updateCurrency(branchId, input, userId);
  }

  @Mutation(() => BranchSettingsEntity, { name: 'updateAttendanceType' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async updateAttendanceType(
    @Args('input') input: UpdateAttendanceTypeInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.branchSettings.updateAttendanceType(branchId, input, userId);
  }

  // ==================== EMAIL SETTINGS ====================

  @Query(() => EmailSettingsEntity, { name: 'emailSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async getEmailSettings(
    @Args('branchId', { nullable: true }) branchId?: string,
    @Context() context?: any,
  ) {
    const finalBranchId = branchId || context?.req?.user?.branchId;
    if (!finalBranchId) {
      throw new Error('Branch ID is required. Please provide branchId or ensure user has a branch.');
    }
    return this.emailSettings.getEmailSettings(finalBranchId);
  }

  @Mutation(() => EmailSettingsEntity, { name: 'updateEmailSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async updateEmailSettings(
    @Args('input') input: UpdateEmailSettingsInput,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Context() context?: any,
  ) {
    const finalBranchId = branchId || context?.req?.user?.branchId;
    const userId = context?.req?.user?.id || 'system';
    if (!finalBranchId) {
      throw new Error('Branch ID is required. Please provide branchId or ensure user has a branch.');
    }
    return this.emailSettings.updateEmailSettings(finalBranchId, input, userId);
  }

  @Mutation(() => Boolean, { name: 'testEmailConnection' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async testEmailConnection(
    @Args('branchId', { nullable: true }) branchId?: string,
    @Context() context?: any,
  ) {
    const finalBranchId = branchId || context?.req?.user?.branchId;
    const userId = context?.req?.user?.id || 'system';
    if (!finalBranchId) {
      throw new Error('Branch ID is required. Please provide branchId or ensure user has a branch.');
    }
    return this.emailSettings.testEmailConnection(finalBranchId, userId);
  }

  @Mutation(() => Boolean, { name: 'sendTestEmail' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async sendTestEmail(
    @Args('input') input: SendTestEmailInput,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Context() context?: any,
  ) {
    const finalBranchId = branchId || context?.req?.user?.branchId;
    const userId = context?.req?.user?.id || 'system';
    if (!finalBranchId) {
      throw new Error('Branch ID is required. Please provide branchId or ensure user has a branch.');
    }
    return this.emailSettings.sendTestEmail(finalBranchId, input.toEmail, userId);
  }

  // ==================== SMS SETTINGS ====================

  @Query(() => SmsSettingsEntity, { name: 'smsSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async getSmsSettings(@Context() context: any) {
    const branchId = context.req.user.branchId;
    return this.smsSettings.getSmsSettings(branchId);
  }

  @Mutation(() => SmsSettingsEntity, { name: 'updateSmsSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async updateSmsSettings(
    @Args('input') input: UpdateSmsSettingsInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.smsSettings.updateSmsSettings(branchId, input, userId);
  }

  @Mutation(() => Boolean, { name: 'testSmsConnection' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async testSmsConnection(@Context() context: any) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.smsSettings.testSmsConnection(branchId, userId);
  }

  @Mutation(() => Boolean, { name: 'sendTestSms' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async sendTestSms(
    @Args('input') input: SendTestSmsInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.smsSettings.sendTestSms(branchId, input.toPhoneNumber, userId);
  }

  // ==================== PAYMENT SETTINGS ====================

  @Query(() => PaymentSettingsEntity, { name: 'paymentSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async getPaymentSettings(@Context() context: any) {
    const branchId = context.req.user.branchId;
    return this.paymentSettings.getPaymentSettings(branchId);
  }

  @Mutation(() => PaymentSettingsEntity, { name: 'updatePaymentSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async updatePaymentSettings(
    @Args('input') input: UpdatePaymentSettingsInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.paymentSettings.updatePaymentSettings(branchId, input, userId);
  }

  @Mutation(() => PaymentSettingsEntity, { name: 'updatePaymentGateway' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async updatePaymentGateway(
    @Args('input') input: UpdateGatewayInput,
    @Context() context: any,
  ) {
    const branchId = context?.req?.user?.branchId;
    const userId = context?.req?.user?.id;
    
    if (!branchId) {
      throw new HttpException(
        'Branch ID is required. Please ensure user has a branch assigned.',
        400
      );
    }
    if (!userId) {
      throw new HttpException(
        'User ID is required. Please ensure you are authenticated.',
        401
      );
    }
    
    return this.paymentSettings.updateGateway(branchId, input.gateway, input.config, userId);
  }

  @Mutation(() => Boolean, { name: 'validatePaymentGateway' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async validatePaymentGateway(@Args('input') input: ValidateGatewayInput) {
    return this.paymentSettings.validateGatewayCredentials(input.gateway, input.credentials);
  }

  // ==================== MODULE SETTINGS ====================

  @Query(() => ModuleSettingsEntity, { name: 'moduleSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async getModuleSettings(@Context() context: any) {
    const branchId = context.req.user.branchId;
    return this.moduleSettings.getModuleSettings(branchId);
  }

  @Mutation(() => ModuleSettingsEntity, { name: 'updateModuleSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async updateModuleSettings(
    @Args('input') input: UpdateModuleSettingsInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.moduleSettings.updateModuleSettings(branchId, input, userId);
  }

  @Mutation(() => ModuleSettingsEntity, { name: 'toggleModule' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async toggleModule(
    @Args('input') input: ToggleModuleInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.moduleSettings.toggleModule(branchId, input.moduleName, input.enabled, userId);
  }

  @Query(() => EnabledModulesEntity, { name: 'enabledModules' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async getEnabledModules(@Context() context: any) {
    const branchId = context.req.user.branchId;
    const modules = await this.moduleSettings.getEnabledModules(branchId);
    return { modules };
  }

  // ==================== MOBILE APP SETTINGS ====================

  @Query(() => MobileAppSettingsEntity, { name: 'mobileAppSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async getMobileAppSettings(@Context() context: any) {
    const branchId = context.req.user.branchId;
    return this.mobileAppSettings.getMobileAppSettings(branchId);
  }

  @Mutation(() => MobileAppSettingsEntity, { name: 'updateMobileAppSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async updateMobileAppSettings(
    @Args('input') input: UpdateMobileAppSettingsInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.mobileAppSettings.updateMobileAppSettings(branchId, input, userId);
  }

  @Mutation(() => MobileAppSettingsEntity, { name: 'updateAppBranding' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async updateAppBranding(
    @Args('input') input: UpdateAppBrandingInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.mobileAppSettings.updateAppBranding(branchId, input, userId);
  }

  @Mutation(() => MobileAppSettingsEntity, { name: 'toggleAppFeature' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async toggleAppFeature(
    @Args('input') input: ToggleFeatureInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.mobileAppSettings.toggleFeature(branchId, input.feature, input.enabled, userId);
  }

  // ==================== BACKUP SETTINGS ====================

  @Query(() => BackupSettingsEntity, { name: 'backupSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async getBackupSettings(@Context() context: any) {
    const branchId = context.req.user.branchId;
    return this.backupService.getBackupSettings(branchId);
  }

  @Mutation(() => BackupSettingsEntity, { name: 'updateBackupSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async updateBackupSettings(
    @Args('input') input: UpdateBackupSettingsInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.backupService.updateBackupSettings(branchId, input, userId);
  }

  @Mutation(() => BackupEntity, { name: 'createBackup' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async createBackup(@Context() context: any) {
    const branchId = context.req.user.branchId;
    const userId = context.req.user.id;
    return this.backupService.createBackup(branchId, userId);
  }

  @Query(() => [BackupEntity], { name: 'backups' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async listBackups(
    @Args('limit', { type: () => Number, nullable: true, defaultValue: 50 }) limit: number,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    return this.backupService.listBackups(branchId, limit);
  }

  @Mutation(() => Boolean, { name: 'deleteBackup' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async deleteBackup(
    @Args('backupId', { type: () => ID }) backupId: string,
    @Context() context: any,
  ) {
    const userId = context.req.user.id;
    return this.backupService.deleteBackup(backupId, userId);
  }

  @Mutation(() => Boolean, { name: 'restoreBackup' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN')
  async restoreBackup(
    @Args('input') input: RestoreBackupInput,
    @Context() context: any,
  ) {
    const userId = context.req.user.id;
    return this.backupService.restoreBackup(input.backupId, userId);
  }

  // ==================== AUDIT LOGS ====================

  @Query(() => AuditLogListEntity, { name: 'settingsAuditLogs' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async getAuditLogs(
    @Args('filters', { nullable: true }) filters: AuditLogFilterInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    return this.auditService.getAuditLogs(branchId, {
      ...filters,
      startDate: filters?.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters?.endDate ? new Date(filters.endDate) : undefined,
    });
  }

  @Query(() => AuditStatisticsEntity, { name: 'auditStatistics' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async getAuditStatistics(
    @Args('days', { type: () => Number, nullable: true, defaultValue: 30 }) days: number,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    return this.auditService.getAuditStatistics(branchId, days);
  }

  @Query(() => [ActiveUserEntity], { name: 'mostActiveUsers' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async getMostActiveUsers(
    @Args('limit', { type: () => Number, nullable: true, defaultValue: 10 }) limit: number,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    return this.auditService.getMostActiveUsers(branchId, limit);
  }

  @Query(() => [ChangedSettingEntity], { name: 'mostChangedSettings' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async getMostChangedSettings(
    @Args('limit', { type: () => Number, nullable: true, defaultValue: 10 }) limit: number,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    return this.auditService.getMostChangedSettings(branchId, limit);
  }

  @Query(() => String, { name: 'exportAuditLogs' })
  // @Roles('ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async exportAuditLogs(
    @Args('filters', { nullable: true }) filters: AuditLogFilterInput,
    @Context() context: any,
  ) {
    const branchId = context.req.user.branchId;
    return this.auditService.exportAuditLogs(branchId, filters);
  }
}
