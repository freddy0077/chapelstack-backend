import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ModuleSettingsService {
  private readonly logger = new Logger(ModuleSettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get module settings
   */
  async getModuleSettings(branchId: string) {
    let settings = await this.prisma.moduleSettings.findUnique({
      where: { branchId },
    });

    if (!settings) {
      settings = await this.createDefaultSettings(branchId);
    }

    return settings;
  }

  /**
   * Update module settings
   */
  async updateModuleSettings(branchId: string, data: any, userId: string) {
    const existing = await this.prisma.moduleSettings.findUnique({
      where: { branchId },
    });

    let settings;
    if (existing) {
      settings = await this.prisma.moduleSettings.update({
        where: { branchId },
        data,
      });
    } else {
      settings = await this.prisma.moduleSettings.create({
        data: {
          branchId,
          ...data,
        },
      });
    }

    await this.logSettingsChange(branchId, userId, 'UPDATE', data);
    this.logger.log(`Module settings updated for branch ${branchId}`);

    return settings;
  }

  /**
   * Toggle a specific module
   */
  async toggleModule(
    branchId: string,
    moduleName: string,
    enabled: boolean,
    userId: string,
  ) {
    const fieldName = `${moduleName}Enabled`;
    
    const settings = await this.prisma.moduleSettings.update({
      where: { branchId },
      data: {
        [fieldName]: enabled,
      },
    });

    await this.logSettingsChange(branchId, userId, 'UPDATE', {
      module: moduleName,
      enabled,
    });

    this.logger.log(`Module ${moduleName} ${enabled ? 'enabled' : 'disabled'} for branch ${branchId}`);
    return settings;
  }

  /**
   * Check if a module is enabled
   */
  async isModuleEnabled(branchId: string, moduleName: string): Promise<boolean> {
    const settings = await this.getModuleSettings(branchId);
    const fieldName = `${moduleName}Enabled`;
    return settings[fieldName] ?? true;
  }

  /**
   * Get list of enabled modules
   */
  async getEnabledModules(branchId: string): Promise<string[]> {
    const settings = await this.getModuleSettings(branchId);
    const enabledModules: string[] = [];

    const modules = [
      'members',
      'events',
      'donations',
      'finance',
      'broadcasts',
      'groups',
      'attendance',
      'reports',
      'mobileApp',
      'sms',
      'email',
      'certificates',
    ];

    for (const module of modules) {
      const fieldName = `${module}Enabled`;
      if (settings[fieldName]) {
        enabledModules.push(module);
      }
    }

    return enabledModules;
  }

  /**
   * Create default module settings (all enabled except SMS)
   */
  private async createDefaultSettings(branchId: string) {
    return await this.prisma.moduleSettings.create({
      data: {
        branchId,
        membersEnabled: true,
        eventsEnabled: true,
        donationsEnabled: true,
        financeEnabled: true,
        broadcastsEnabled: true,
        groupsEnabled: true,
        attendanceEnabled: true,
        reportsEnabled: true,
        mobileAppEnabled: true,
        smsEnabled: false,
        emailEnabled: true,
        certificatesEnabled: true,
      },
    });
  }

  /**
   * Log settings changes
   */
  private async logSettingsChange(
    branchId: string,
    userId: string,
    action: string,
    data: any,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      await this.prisma.settingsAuditLog.create({
        data: {
          branchId,
          userId,
          userEmail: user?.email || 'unknown',
          settingType: 'MODULE',
          action,
          newValue: JSON.stringify(data),
        },
      });
    } catch (error) {
      this.logger.error('Failed to log settings change:', error);
    }
  }
}
