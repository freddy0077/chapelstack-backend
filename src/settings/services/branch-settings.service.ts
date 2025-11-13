import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BranchSettingsService {
  private readonly logger = new Logger(BranchSettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get branch settings
   */
  async getBranchSettings(branchId: string) {
    let settings = await this.prisma.branchSettings.findUnique({
      where: { branchId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await this.createDefaultSettings(branchId);
    }

    return settings;
  }

  /**
   * Update branch settings
   */
  async updateBranchSettings(branchId: string, data: any, userId: string) {
    const existing = await this.prisma.branchSettings.findUnique({
      where: { branchId },
    });

    let settings;
    if (existing) {
      // Update existing settings
      settings = await this.prisma.branchSettings.update({
        where: { branchId },
        data,
      });
    } else {
      // Create new settings
      settings = await this.prisma.branchSettings.create({
        data: {
          branchId,
          ...data,
        },
      });
    }

    // Log the change
    await this.logSettingsChange(branchId, userId, 'UPDATE', data);

    this.logger.log(`Branch settings updated for branch ${branchId}`);
    return settings;
  }

  /**
   * Update branding (logo, colors, theme)
   */
  async updateBranding(branchId: string, data: any, userId: string) {
    const settings = await this.prisma.branchSettings.update({
      where: { branchId },
      data: {
        logoUrl: data.logoUrl,
        secondaryLogoUrl: data.secondaryLogoUrl,
        faviconUrl: data.faviconUrl,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        accentColor: data.accentColor,
        textColorLight: data.textColorLight,
        textColorDark: data.textColorDark,
        backgroundColor: data.backgroundColor,
        theme: data.theme,
        customCss: data.customCss,
      },
    });

    await this.logSettingsChange(branchId, userId, 'UPDATE', data);
    return settings;
  }

  /**
   * Update currency settings
   */
  async updateCurrency(branchId: string, data: any, userId: string) {
    const settings = await this.prisma.branchSettings.update({
      where: { branchId },
      data: {
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        currencyPosition: data.currencyPosition,
        decimalPlaces: data.decimalPlaces,
        thousandSeparator: data.thousandSeparator,
        decimalSeparator: data.decimalSeparator,
      },
    });

    await this.logSettingsChange(branchId, userId, 'UPDATE', data);
    return settings;
  }

  /**
   * Update attendance type
   */
  async updateAttendanceType(branchId: string, data: any, userId: string) {
    const settings = await this.prisma.branchSettings.update({
      where: { branchId },
      data: {
        attendanceType: data.attendanceType,
        attendanceMethods: data.attendanceMethods,
      },
    });

    await this.logSettingsChange(branchId, userId, 'UPDATE', data);
    return settings;
  }

  /**
   * Create default settings for a branch
   */
  private async createDefaultSettings(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException(`Branch ${branchId} not found`);
    }

    return await this.prisma.branchSettings.create({
      data: {
        branchId,
        branchName: branch.name,
        timezone: 'UTC',
        language: 'en',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        textColorLight: '#FFFFFF',
        textColorDark: '#1F2937',
        backgroundColor: '#FFFFFF',
        theme: 'light',
        currency: 'USD',
        currencySymbol: '$',
        currencyPosition: 'before',
        decimalPlaces: 2,
        thousandSeparator: ',',
        decimalSeparator: '.',
        attendanceType: 'MANUAL',
      },
    });
  }

  /**
   * Log settings changes for audit trail
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
          settingType: 'BRANCH',
          action,
          newValue: JSON.stringify(data),
        },
      });
    } catch (error) {
      this.logger.error('Failed to log settings change:', error);
    }
  }
}
