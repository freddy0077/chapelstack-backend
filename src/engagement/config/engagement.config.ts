import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

export interface SmsConfig {
  provider: 'NALO' | 'TWILIO';
  apiKey: string;
  apiSecret?: string;
  senderNumber: string;
}

export interface PaymentConfig {
  provider: 'PAYSTACK';
  publicKey: string;
  secretKey: string;
  webhookSecret?: string;
}

@Injectable()
export class EngagementConfig {
  constructor(private readonly configService: ConfigService) {}

  getEmailConfig(organisationId?: string, branchId?: string): EmailConfig {
    // TODO: Support org/branch-scoped settings from database
    // For now, return global env-based config
    return {
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(this.configService.get<string>('SMTP_PORT') || '587', 10),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      user: this.configService.get<string>('SMTP_USER') || '',
      password: this.configService.get<string>('SMTP_PASSWORD') || '',
      from: this.configService.get<string>('EMAIL_SENDER') || 'info@chapelstack.com',
    };
  }

  getSmsConfig(organisationId?: string, branchId?: string): SmsConfig {
    // TODO: Support org/branch-scoped settings from database
    return {
      provider: 'NALO',
      apiKey: this.configService.get<string>('SMS_API_KEY') || '',
      apiSecret: this.configService.get<string>('SMS_API_SECRET'),
      senderNumber: this.configService.get<string>('SMS_SENDER_NUMBER') || 'CHURCH',
    };
  }

  getPaymentConfig(organisationId?: string, branchId?: string): PaymentConfig {
    // TODO: Support org/branch-scoped settings from database
    return {
      provider: 'PAYSTACK',
      publicKey: this.configService.get<string>('PAYSTACK_PUBLIC_KEY') || '',
      secretKey: this.configService.get<string>('PAYSTACK_SECRET_KEY') || '',
      webhookSecret: this.configService.get<string>('PAYSTACK_WEBHOOK_SECRET'),
    };
  }
}
