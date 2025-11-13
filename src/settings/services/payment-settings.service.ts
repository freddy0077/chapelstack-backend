import { Injectable, Logger, HttpException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentSettingsService {
  private readonly logger = new Logger(PaymentSettingsService.name);
  private readonly encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get payment settings
   */
  async getPaymentSettings(branchId: string) {
    let settings = await this.prisma.paymentSettings.findUnique({
      where: { branchId },
    });

    if (!settings) {
      settings = await this.createDefaultSettings(branchId);
    }

    // Decrypt gateway credentials
    if (settings.gateways) {
      settings.gateways = this.decryptGateways(settings.gateways as any);
    }

    return settings;
  }

  /**
   * Update payment settings
   */
  async updatePaymentSettings(branchId: string, data: any, userId: string) {
    // Encrypt gateway credentials
    if (data.gateways) {
      data.gateways = this.encryptGateways(data.gateways);
    }

    const existing = await this.prisma.paymentSettings.findUnique({
      where: { branchId },
    });

    let settings;
    if (existing) {
      settings = await this.prisma.paymentSettings.update({
        where: { branchId },
        data,
      });
    } else {
      settings = await this.prisma.paymentSettings.create({
        data: {
          branchId,
          ...data,
        },
      });
    }

    await this.logSettingsChange(branchId, userId, 'UPDATE', data);
    this.logger.log(`Payment settings updated for branch ${branchId}`);

    return settings;
  }

  /**
   * Update specific gateway configuration
   */
  async updateGateway(
    branchId: string,
    gateway: string,
    config: any,
    userId: string,
  ) {
    const settings = await this.getPaymentSettings(branchId);
    const gateways = (settings.gateways as any) || {};

    // Encrypt the gateway config
    gateways[gateway] = this.encryptGatewayConfig(config);

    const updated = await this.prisma.paymentSettings.update({
      where: { branchId },
      data: {
        gateways: gateways,
      },
    });

    await this.logSettingsChange(branchId, userId, 'UPDATE', {
      gateway,
      action: 'UPDATE_GATEWAY',
    });

    this.logger.log(`Gateway ${gateway} updated for branch ${branchId}`);
    return updated;
  }

  /**
   * Validate gateway credentials
   */
  async validateGatewayCredentials(
    gateway: string,
    credentials: any,
  ): Promise<boolean> {
    try {
      switch (gateway.toLowerCase()) {
        case 'paystack':
          return await this.validatePaystack(credentials);
        case 'stripe':
          return await this.validateStripe(credentials);
        case 'flutterwave':
          return await this.validateFlutterwave(credentials);
        case 'paypal':
          return await this.validatePayPal(credentials);
        default:
          throw new HttpException(`Gateway ${gateway} not supported`, 400);
      }
    } catch (error: any) {
      this.logger.error(`Gateway validation failed for ${gateway}:`, error);
      throw new HttpException(`Validation failed: ${error.message}`, 400);
    }
  }

  /**
   * Validate Paystack credentials
   */
  private async validatePaystack(credentials: any): Promise<boolean> {
    if (!credentials.secretKey) {
      throw new HttpException('Paystack secret key is required', 400);
    }

    // Test API call to Paystack
    // This is a placeholder - implement actual Paystack API validation
    // Example: GET https://api.paystack.co/bank
    return true;
  }

  /**
   * Validate Stripe credentials
   */
  private async validateStripe(credentials: any): Promise<boolean> {
    if (!credentials.secretKey) {
      throw new HttpException('Stripe secret key is required', 400);
    }

    // Test API call to Stripe
    // This is a placeholder - implement actual Stripe API validation
    return true;
  }

  /**
   * Validate Flutterwave credentials
   */
  private async validateFlutterwave(credentials: any): Promise<boolean> {
    if (!credentials.secretKey) {
      throw new HttpException('Flutterwave secret key is required', 400);
    }

    // Test API call to Flutterwave
    return true;
  }

  /**
   * Validate PayPal credentials
   */
  private async validatePayPal(credentials: any): Promise<boolean> {
    if (!credentials.clientId || !credentials.clientSecret) {
      throw new HttpException('PayPal client ID and secret are required', 400);
    }

    // Test API call to PayPal
    return true;
  }

  /**
   * Get enabled payment methods
   */
  async getEnabledMethods(branchId: string): Promise<string[]> {
    const settings = await this.getPaymentSettings(branchId);
    return (settings.enabledMethods as any) || [];
  }

  /**
   * Update enabled payment methods
   */
  async updateEnabledMethods(
    branchId: string,
    methods: string[],
    userId: string,
  ) {
    const settings = await this.prisma.paymentSettings.update({
      where: { branchId },
      data: {
        enabledMethods: methods,
      },
    });

    await this.logSettingsChange(branchId, userId, 'UPDATE', {
      action: 'UPDATE_ENABLED_METHODS',
      methods,
    });

    return settings;
  }

  /**
   * Create default payment settings
   */
  private async createDefaultSettings(branchId: string) {
    return await this.prisma.paymentSettings.create({
      data: {
        branchId,
        autoReceipt: true,
        feeBearer: 'CUSTOMER',
        enabledMethods: ['CARD', 'BANK_TRANSFER', 'CASH'],
      },
    });
  }

  /**
   * Encrypt all gateway configurations
   */
  private encryptGateways(gateways: any): any {
    const encrypted: any = {};
    for (const [gateway, config] of Object.entries(gateways)) {
      encrypted[gateway] = this.encryptGatewayConfig(config);
    }
    return encrypted;
  }

  /**
   * Decrypt all gateway configurations
   */
  private decryptGateways(gateways: any): any {
    const decrypted: any = {};
    for (const [gateway, config] of Object.entries(gateways)) {
      decrypted[gateway] = this.decryptGatewayConfig(config as any);
    }
    return decrypted;
  }

  /**
   * Encrypt gateway configuration
   */
  private encryptGatewayConfig(config: any): any {
    const encrypted: any = {};
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'string' && (key.includes('key') || key.includes('secret'))) {
        encrypted[key] = this.encrypt(value);
      } else {
        encrypted[key] = value;
      }
    }
    return encrypted;
  }

  /**
   * Decrypt gateway configuration
   */
  private decryptGatewayConfig(config: any): any {
    const decrypted: any = {};
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'string' && (key.includes('key') || key.includes('secret'))) {
        try {
          decrypted[key] = this.decrypt(value);
        } catch {
          decrypted[key] = value; // If decryption fails, return as is
        }
      } else {
        decrypted[key] = value;
      }
    }
    return decrypted;
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
          settingType: 'PAYMENT',
          action,
          newValue: JSON.stringify(data),
        },
      });
    } catch (error) {
      this.logger.error('Failed to log settings change:', error);
    }
  }
}
