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

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [
    // Services
    EmailService,
    SmsService,
    NotificationService,
    TemplateService,
    StatsService,

    // Resolvers
    EmailResolver,
    SmsResolver,
    NotificationResolver,
    TemplateResolver,
    StatsResolver,
    AllMessagesResolver,
  ],
  exports: [
    EmailService,
    SmsService,
    NotificationService,
    TemplateService,
    StatsService,
  ],
})
export class CommunicationsModule {}
