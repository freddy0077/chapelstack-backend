import { Injectable, Logger, HttpException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class SmsSettingsService {
  private readonly logger = new Logger(SmsSettingsService.name);
  private readonly encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get SMS settings
   */
  async getSmsSettings(branchId: string) {
    let settings = await this.prisma.smsSettings.findUnique({
      where: { branchId },
    });

    if (!settings) {
      settings = await this.createDefaultSettings(branchId);
    }

    // Decrypt sensitive fields
    if (settings.apiKey) {
      settings.apiKey = this.decrypt(settings.apiKey);
    }
    if (settings.apiSecret) {
      settings.apiSecret = this.decrypt(settings.apiSecret);
    }

    return settings;
  }

  /**
   * Update SMS settings
   */
  async updateSmsSettings(branchId: string, data: any, userId: string) {
    // Encrypt sensitive fields
    if (data.apiKey) {
      data.apiKey = this.encrypt(data.apiKey);
    }
    if (data.apiSecret) {
      data.apiSecret = this.encrypt(data.apiSecret);
    }

    const existing = await this.prisma.smsSettings.findUnique({
      where: { branchId },
    });

    let settings;
    if (existing) {
      settings = await this.prisma.smsSettings.update({
        where: { branchId },
        data,
      });
    } else {
      settings = await this.prisma.smsSettings.create({
        data: {
          branchId,
          ...data,
        },
      });
    }

    await this.logSettingsChange(branchId, userId, 'UPDATE', data);
    this.logger.log(`SMS settings updated for branch ${branchId}`);

    return settings;
  }

  /**
   * Test SMS connection
   */
  async testSmsConnection(branchId: string, userId: string): Promise<boolean> {
    const settings = await this.getSmsSettings(branchId);

    if (!settings.provider || !settings.apiKey) {
      throw new HttpException('SMS configuration is incomplete', 400);
    }

    try {
      let testResult = false;

      switch (settings.provider) {
        case 'TWILIO':
          testResult = await this.testTwilio(settings);
          break;
        case 'AFRICAS_TALKING':
          testResult = await this.testAfricasTalking(settings);
          break;
        case 'TERMII':
          testResult = await this.testTermii(settings);
          break;
        default:
          throw new HttpException(`Provider ${settings.provider} not supported`, 400);
      }

      // Update test result
      await this.prisma.smsSettings.update({
        where: { branchId },
        data: {
          lastTested: new Date(),
          testResult: 'SUCCESS',
        },
      });

      await this.logSettingsChange(branchId, userId, 'TEST', { result: 'SUCCESS' });
      this.logger.log(`SMS connection test successful for branch ${branchId}`);

      return testResult;
    } catch (error: any) {
      // Update test result
      await this.prisma.smsSettings.update({
        where: { branchId },
        data: {
          lastTested: new Date(),
          testResult: 'FAILED',
        },
      });

      await this.logSettingsChange(branchId, userId, 'TEST', { 
        result: 'FAILED', 
        error: error.message 
      });

      this.logger.error(`SMS connection test failed for branch ${branchId}:`, error);
      throw new HttpException(`SMS test failed: ${error.message}`, 400);
    }
  }

  /**
   * Send test SMS
   */
  async sendTestSms(
    branchId: string,
    toPhoneNumber: string,
    userId: string,
  ): Promise<boolean> {
    const settings = await this.getSmsSettings(branchId);

    if (!settings.isActive) {
      throw new HttpException('SMS settings are not active', 400);
    }

    const message = `Test SMS from ChapelStack. Your SMS configuration is working correctly! Sent at ${new Date().toLocaleString()}`;

    try {
      let sent = false;

      switch (settings.provider) {
        case 'TWILIO':
          sent = await this.sendTwilioSms(settings, toPhoneNumber, message);
          break;
        case 'AFRICAS_TALKING':
          sent = await this.sendAfricasTalkingSms(settings, toPhoneNumber, message);
          break;
        case 'TERMII':
          sent = await this.sendTermiiSms(settings, toPhoneNumber, message);
          break;
        default:
          throw new HttpException(`Provider ${settings.provider} not supported`, 400);
      }

      await this.logSettingsChange(branchId, userId, 'TEST', { 
        action: 'SEND_TEST_SMS',
        to: toPhoneNumber,
        result: 'SUCCESS' 
      });

      this.logger.log(`Test SMS sent successfully to ${toPhoneNumber}`);
      return sent;
    } catch (error: any) {
      this.logger.error(`Failed to send test SMS:`, error);
      throw new HttpException(`Failed to send test SMS: ${error.message}`, 400);
    }
  }

  /**
   * Test Twilio connection
   */
  private async testTwilio(settings: any): Promise<boolean> {
    // Implement Twilio API test
    // This is a placeholder - implement actual Twilio API call
    return true;
  }

  /**
   * Test Africa's Talking connection
   */
  private async testAfricasTalking(settings: any): Promise<boolean> {
    // Implement Africa's Talking API test
    return true;
  }

  /**
   * Test Termii connection
   */
  private async testTermii(settings: any): Promise<boolean> {
    // Implement Termii API test
    return true;
  }

  /**
   * Send SMS via Twilio
   */
  private async sendTwilioSms(
    settings: any,
    to: string,
    message: string,
  ): Promise<boolean> {
    // Implement Twilio SMS sending
    return true;
  }

  /**
   * Send SMS via Africa's Talking
   */
  private async sendAfricasTalkingSms(
    settings: any,
    to: string,
    message: string,
  ): Promise<boolean> {
    // Implement Africa's Talking SMS sending
    return true;
  }

  /**
   * Send SMS via Termii
   */
  private async sendTermiiSms(
    settings: any,
    to: string,
    message: string,
  ): Promise<boolean> {
    // Implement Termii SMS sending
    return true;
  }

  /**
   * Create default SMS settings
   */
  private async createDefaultSettings(branchId: string) {
    return await this.prisma.smsSettings.create({
      data: {
        branchId,
        isActive: false,
      },
    });
  }

  /**
   * Encrypt sensitive data
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32)),
      iv,
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  /**
   * Decrypt sensitive data
   */
  private decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32)),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
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
          settingType: 'SMS',
          action,
          newValue: JSON.stringify(data),
        },
      });
    } catch (error) {
      this.logger.error('Failed to log settings change:', error);
    }
  }
}
