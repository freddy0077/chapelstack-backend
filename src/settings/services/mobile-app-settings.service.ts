import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MobileAppSettingsService {
  private readonly logger = new Logger(MobileAppSettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get mobile app settings
   */
  async getMobileAppSettings(branchId: string) {
    let settings = await this.prisma.mobileAppSettings.findUnique({
      where: { branchId },
    });

    if (!settings) {
      settings = await this.createDefaultSettings(branchId);
    }

    return settings;
  }

  /**
   * Update mobile app settings
   */
  async updateMobileAppSettings(branchId: string, data: any, userId: string) {
    const existing = await this.prisma.mobileAppSettings.findUnique({
      where: { branchId },
    });

    let settings;
    if (existing) {
      settings = await this.prisma.mobileAppSettings.update({
        where: { branchId },
        data,
      });
    } else {
      settings = await this.prisma.mobileAppSettings.create({
        data: {
          branchId,
          ...data,
        },
      });
    }

    await this.logSettingsChange(branchId, userId, 'UPDATE', data);
    this.logger.log(`Mobile app settings updated for branch ${branchId}`);

    return settings;
  }

  /**
   * Update app branding
   */
  async updateAppBranding(branchId: string, data: any, userId: string) {
    const settings = await this.prisma.mobileAppSettings.update({
      where: { branchId },
      data: {
        appName: data.appName,
        appIconUrl: data.appIconUrl,
        splashScreenUrl: data.splashScreenUrl,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
      },
    });

    await this.logSettingsChange(branchId, userId, 'UPDATE', {
      action: 'UPDATE_BRANDING',
      ...data,
    });

    return settings;
  }

  /**
   * Update Firebase configuration
   */
  async updateFirebaseConfig(branchId: string, config: any, userId: string) {
    const settings = await this.prisma.mobileAppSettings.update({
      where: { branchId },
      data: {
        firebaseConfig: config,
      },
    });

    await this.logSettingsChange(branchId, userId, 'UPDATE', {
      action: 'UPDATE_FIREBASE_CONFIG',
    });

    this.logger.log(`Firebase config updated for branch ${branchId}`);
    return settings;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPrefs(branchId: string, prefs: any, userId: string) {
    const settings = await this.prisma.mobileAppSettings.update({
      where: { branchId },
      data: {
        notificationPrefs: prefs,
      },
    });

    await this.logSettingsChange(branchId, userId, 'UPDATE', {
      action: 'UPDATE_NOTIFICATION_PREFS',
      prefs,
    });

    return settings;
  }

  /**
   * Update enabled features
   */
  async updateEnabledFeatures(
    branchId: string,
    features: string[],
    userId: string,
  ) {
    const settings = await this.prisma.mobileAppSettings.update({
      where: { branchId },
      data: {
        enabledFeatures: features,
      },
    });

    await this.logSettingsChange(branchId, userId, 'UPDATE', {
      action: 'UPDATE_ENABLED_FEATURES',
      features,
    });

    return settings;
  }

  /**
   * Toggle a specific feature
   */
  async toggleFeature(
    branchId: string,
    feature: string,
    enabled: boolean,
    userId: string,
  ) {
    const settings = await this.getMobileAppSettings(branchId);
    const currentFeatures = (settings.enabledFeatures as string[]) || [];

    let updatedFeatures: string[];
    if (enabled) {
      // Add feature if not already present
      updatedFeatures = currentFeatures.includes(feature)
        ? currentFeatures
        : [...currentFeatures, feature];
    } else {
      // Remove feature
      updatedFeatures = currentFeatures.filter((f) => f !== feature);
    }

    const updated = await this.prisma.mobileAppSettings.update({
      where: { branchId },
      data: {
        enabledFeatures: updatedFeatures,
      },
    });

    await this.logSettingsChange(branchId, userId, 'UPDATE', {
      action: 'TOGGLE_FEATURE',
      feature,
      enabled,
    });

    this.logger.log(
      `Feature ${feature} ${enabled ? 'enabled' : 'disabled'} for branch ${branchId}`,
    );

    return updated;
  }

  /**
   * Update deep linking configuration
   */
  async updateDeepLinking(branchId: string, data: any, userId: string) {
    const settings = await this.prisma.mobileAppSettings.update({
      where: { branchId },
      data: {
        deepLinkDomain: data.deepLinkDomain,
        appStoreUrl: data.appStoreUrl,
        playStoreUrl: data.playStoreUrl,
      },
    });

    await this.logSettingsChange(branchId, userId, 'UPDATE', {
      action: 'UPDATE_DEEP_LINKING',
      ...data,
    });

    return settings;
  }

  /**
   * Get enabled features
   */
  async getEnabledFeatures(branchId: string): Promise<string[]> {
    const settings = await this.getMobileAppSettings(branchId);
    return (settings.enabledFeatures as string[]) || [];
  }

  /**
   * Check if a feature is enabled
   */
  async isFeatureEnabled(branchId: string, feature: string): Promise<boolean> {
    const enabledFeatures = await this.getEnabledFeatures(branchId);
    return enabledFeatures.includes(feature);
  }

  /**
   * Create default mobile app settings
   */
  private async createDefaultSettings(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { name: true },
    });

    return await this.prisma.mobileAppSettings.create({
      data: {
        branchId,
        appName: branch?.name || 'ChapelStack',
        enabledFeatures: [
          'EVENTS',
          'DONATIONS',
          'SERMONS',
          'GROUPS',
          'GIVING',
          'PRAYER_REQUESTS',
        ],
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
          settingType: 'MOBILE_APP',
          action,
          newValue: JSON.stringify(data),
        },
      });
    } catch (error) {
      this.logger.error('Failed to log settings change:', error);
    }
  }
}
