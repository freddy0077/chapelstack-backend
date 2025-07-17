import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { NotificationService } from './services/notification.service';
import { TemplateService } from './services/template.service';
import { StatsService } from './services/stats.service';
import { EmailResolver } from './resolvers/email.resolver';
import { SmsResolver } from './resolvers/sms.resolver';
import { NotificationResolver } from './resolvers/notification.resolver';
import { TemplateResolver } from './resolvers/template.resolver';
import { StatsResolver } from './resolvers/stats.resolver';
import { AllMessagesResolver } from './resolvers/all-messages.resolver';
import { MessageUnion } from './unions/message-union';
import { ConfigModule } from '@nestjs/config';
import { RecipientResolver } from './resolvers/recipient.resolver';
import { RecipientService } from './services/recipient.service';
import { HttpModule } from '@nestjs/axios';
import { NaloSmsProvider } from './providers/nalo-sms.provider';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule, PrismaModule, ConfigModule, HttpModule],
  providers: [
    // Services
    EmailService,
    SmsService,
    NotificationService,
    TemplateService,
    StatsService,
    RecipientService,

    // Resolvers
    EmailResolver,
    SmsResolver,
    NotificationResolver,
    TemplateResolver,
    StatsResolver,
    AllMessagesResolver,
    RecipientResolver,

    NaloSmsProvider,
  ],
  exports: [
    EmailService,
    SmsService,
    NotificationService,
    TemplateService,
    StatsService,
    RecipientService,
  ],
})
export class CommunicationsModule {}
