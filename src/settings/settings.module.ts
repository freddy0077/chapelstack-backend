import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

// Services
import { SettingsService } from './settings.service';
import { BranchSettingsService } from './services/branch-settings.service';
import { EmailSettingsService } from './services/email-settings.service';
import { SmsSettingsService } from './services/sms-settings.service';
import { PaymentSettingsService } from './services/payment-settings.service';
import { ModuleSettingsService } from './services/module-settings.service';
import { MobileAppSettingsService } from './services/mobile-app-settings.service';
import { BackupService } from './services/backup.service';
import { SettingsAuditService } from './services/settings-audit.service';

// Resolver
import { SettingsResolver } from './settings.resolver';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    PrismaService,
    SettingsService,
    BranchSettingsService,
    EmailSettingsService,
    SmsSettingsService,
    PaymentSettingsService,
    ModuleSettingsService,
    MobileAppSettingsService,
    BackupService,
    SettingsAuditService,
    SettingsResolver,
  ],
  exports: [
    SettingsService,
    BranchSettingsService,
    EmailSettingsService,
    SmsSettingsService,
    PaymentSettingsService,
    ModuleSettingsService,
    MobileAppSettingsService,
    BackupService,
    SettingsAuditService,
  ],
})
export class SettingsModule {}
