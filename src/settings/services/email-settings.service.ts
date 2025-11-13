import { Injectable, Logger, HttpException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class EmailSettingsService {
  private readonly logger = new Logger(EmailSettingsService.name);
  private readonly encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get email settings
   */
  async getEmailSettings(branchId: string) {
    let settings = await this.prisma.emailSettings.findUnique({
      where: { branchId },
    });

    if (!settings) {
      settings = await this.createDefaultSettings(branchId);
    }

    // Decrypt password before returning
    if (settings.smtpPassword) {
      settings.smtpPassword = this.decrypt(settings.smtpPassword);
    }

    return settings;
  }

  /**
   * Update email settings
   */
  async updateEmailSettings(branchId: string, data: any, userId: string) {
    // Encrypt password if provided
    if (data.smtpPassword) {
      data.smtpPassword = this.encrypt(data.smtpPassword);
    }

    const existing = await this.prisma.emailSettings.findUnique({
      where: { branchId },
    });

    let settings;
    if (existing) {
      settings = await this.prisma.emailSettings.update({
        where: { branchId },
        data,
      });
    } else {
      settings = await this.prisma.emailSettings.create({
        data: {
          branchId,
          ...data,
        },
      });
    }

    await this.logSettingsChange(branchId, userId, 'UPDATE', data);
    this.logger.log(`Email settings updated for branch ${branchId}`);

    return settings;
  }

  /**
   * Test email connection
   */
  async testEmailConnection(branchId: string, userId: string): Promise<boolean> {
    const settings = await this.getEmailSettings(branchId);

    if (!settings.smtpHost || !settings.smtpPort) {
      throw new HttpException('SMTP configuration is incomplete', 400);
    }

    try {
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost || undefined,
        port: settings.smtpPort || undefined,
        secure: settings.smtpEncryption === 'SSL',
        auth: settings.smtpUsername && settings.smtpPassword
          ? {
              user: settings.smtpUsername,
              pass: settings.smtpPassword ? this.decrypt(settings.smtpPassword) : '',
            }
          : undefined,
      } as any);

      await transporter.verify();

      // Update test result
      await this.prisma.emailSettings.update({
        where: { branchId },
        data: {
          lastTested: new Date(),
          testResult: 'SUCCESS',
        },
      });

      await this.logSettingsChange(branchId, userId, 'TEST', { result: 'SUCCESS' });
      this.logger.log(`Email connection test successful for branch ${branchId}`);

      return true;
    } catch (error: any) {
      // Update test result
      await this.prisma.emailSettings.update({
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

      this.logger.error(`Email connection test failed for branch ${branchId}:`, error);
      throw new HttpException(`Email test failed: ${error.message}`, 400);
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(branchId: string, toEmail: string, userId: string): Promise<boolean> {
    const settings = await this.getEmailSettings(branchId);

    if (!settings.isActive) {
      throw new HttpException('Email settings are not active', 400);
    }

    try {
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost || undefined,
        port: settings.smtpPort || undefined,
        secure: settings.smtpEncryption === 'SSL',
        auth: {
          user: settings.smtpUsername || undefined,
          pass: settings.smtpPassword ? this.decrypt(settings.smtpPassword) : '',
        },
      } as any);

      await transporter.sendMail({
        from: `"${settings.fromName}" <${settings.fromEmail}>`,
        to: toEmail,
        replyTo: settings.replyToEmail || undefined,
        subject: 'Test Email from ChapelStack',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email from your ChapelStack email configuration.</p>
          <p>If you received this email, your email settings are working correctly!</p>
          <hr>
          <p><small>Sent at ${new Date().toLocaleString()}</small></p>
        `,
      });

      await this.logSettingsChange(branchId, userId, 'TEST', { 
        action: 'SEND_TEST_EMAIL',
        to: toEmail,
        result: 'SUCCESS' 
      });

      this.logger.log(`Test email sent successfully to ${toEmail}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send test email:`, error);
      throw new HttpException(`Failed to send test email: ${error.message}`, 400);
    }
  }

  /**
   * Create default email settings
   */
  private async createDefaultSettings(branchId: string) {
    return await this.prisma.emailSettings.create({
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
          settingType: 'EMAIL',
          action,
          newValue: JSON.stringify(data),
        },
      });
    } catch (error) {
      this.logger.error('Failed to log settings change:', error);
    }
  }
}
