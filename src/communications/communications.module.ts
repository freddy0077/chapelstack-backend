import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
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
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { RecipientResolver } from './resolvers/recipient.resolver'; // Temporarily disabled due to compilation errors
import { RecipientCountResolver } from './resolvers/recipient-count.resolver';
import { RecipientService } from './services/recipient.service';
import { HttpModule } from '@nestjs/axios';
import { NaloSmsProvider } from './providers/nalo-sms.provider';
import { EmailModule } from '../email/email.module';
import { CommunicationsGateway } from './gateways/communications.gateway';
import { ConversationService } from './services/conversation.service';
import { ConversationResolver } from './resolvers/conversation.resolver';

@Module({
  imports: [
    EmailModule,
    PrismaModule,
    ConfigModule,
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    // Services
    EmailService,
    SmsService,
    NotificationService,
    TemplateService,
    StatsService,
    RecipientService,
    ConversationService,

    // Resolvers
    EmailResolver,
    SmsResolver,
    NotificationResolver,
    TemplateResolver,
    StatsResolver,
    AllMessagesResolver,
    // RecipientResolver, // Temporarily disabled
    RecipientCountResolver,
    ConversationResolver,

    // Gateways
    CommunicationsGateway,

    NaloSmsProvider,
  ],
  exports: [
    EmailService,
    SmsService,
    NotificationService,
    TemplateService,
    StatsService,
    RecipientService,
    ConversationService,
    CommunicationsGateway,
  ],
})
export class CommunicationsModule {}
