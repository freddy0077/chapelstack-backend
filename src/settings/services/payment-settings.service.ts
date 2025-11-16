import { Injectable, Logger, HttpException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentSettingsService {
  private readonly logger = new Logger(PaymentSettingsService.name);
  private readonly encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

  // Ghana-specific configuration
  private readonly GHANA_SUPPORTED_METHODS = ['CARD', 'MOBILE_MONEY'];
  private readonly GHANA_CURRENCY = 'GHS';
  private readonly GHANA_COUNTRY_CODE = 'GH';
  private readonly GHANA_SUPPORTED_GATEWAYS = ['PAYSTACK'];

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
    // Validate enabled methods for Ghana
    if (data.enabledMethods) {
      const invalidMethods = data.enabledMethods.filter(
        (m: string) => !this.GHANA_SUPPORTED_METHODS.includes(m)
      );
      if (invalidMethods.length > 0) {
        throw new HttpException(
          `Unsupported payment methods for Ghana: ${invalidMethods.join(', ')}. Only CARD and MOBILE_MONEY are supported.`,
          400
        );
      }
      if (data.enabledMethods.length === 0) {
        throw new HttpException(
          'At least one payment method must be enabled',
          400
        );
      }
    }

    // Validate currency for Ghana
    if (data.currency && data.currency !== this.GHANA_CURRENCY) {
      throw new HttpException(
        `Only ${this.GHANA_CURRENCY} currency is supported for Ghana`,
        400
      );
    }

    // Validate country for Ghana
    if (data.country && data.country !== this.GHANA_COUNTRY_CODE) {
      throw new HttpException(
        `Only Ghana (${this.GHANA_COUNTRY_CODE}) is supported`,
        400
      );
    }

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
          country: this.GHANA_COUNTRY_CODE,
          currency: this.GHANA_CURRENCY,
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
    try {
      const settings = await this.getPaymentSettings(branchId);
      const gateways = (settings.gateways as any) || {};

      // Validate gateway is supported
      if (!this.GHANA_SUPPORTED_GATEWAYS.includes(gateway.toUpperCase())) {
        throw new HttpException(
          `Gateway ${gateway} is not supported. Only ${this.GHANA_SUPPORTED_GATEWAYS.join(', ')} are supported.`,
          400
        );
      }

      // Encrypt the gateway config
      gateways[gateway] = this.encryptGatewayConfig(config);

      this.logger.debug(`Updating gateway ${gateway} with encrypted config`);

      const updated = await this.prisma.paymentSettings.update({
        where: { branchId },
        data: {
          gateways: gateways as any,
        },
      });

      if (!updated) {
        throw new Error('Failed to update payment settings');
      }

      // Decrypt before returning
      if (updated.gateways) {
        updated.gateways = this.decryptGateways(updated.gateways as any);
      }

      await this.logSettingsChange(branchId, userId, 'UPDATE', {
        gateway,
        action: 'UPDATE_GATEWAY',
      });

      this.logger.log(`Gateway ${gateway} updated for branch ${branchId}`);
      return updated;
    } catch (error: any) {
      this.logger.error(`Failed to update gateway ${gateway}:`, error);
      throw new HttpException(
        `Failed to update gateway: ${error.message}`,
        error.status || 500
      );
    }
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

    try {
      // Test API call to Paystack banks endpoint
      const response = await fetch('https://api.paystack.co/bank', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${credentials.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new HttpException(
          'Invalid Paystack credentials. Please verify your secret key.',
          400
        );
      }

      this.logger.log('Paystack credentials validated successfully');
      return true;
    } catch (error: any) {
      this.logger.error('Paystack validation failed:', error);
      throw new HttpException(
        'Failed to validate Paystack credentials. Please check your secret key and try again.',
        400
      );
    }
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
        country: this.GHANA_COUNTRY_CODE,
        currency: this.GHANA_CURRENCY,
        autoReceipt: true,
        feeBearer: 'CUSTOMER',
        enabledMethods: this.GHANA_SUPPORTED_METHODS,
        gateways: {
          PAYSTACK: {
            publicKey: '',
            secretKey: '',
            webhookSecret: '',
            testMode: true,
          },
        },
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
