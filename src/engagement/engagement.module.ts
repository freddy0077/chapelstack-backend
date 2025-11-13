import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NotificationsFacade } from './notifications/notifications.facade';
import { PaymentsFacade } from './payments/payments.facade';
import { CommunicationsModule } from '../communications/communications.module';
import { DispatcherService } from './notifications/services/dispatcher.service';
import { TemplateService } from './notifications/services/template.service';
import { GatewayRegistryService } from './payments/services/gateway-registry.service';
import { PaystackGateway } from './payments/services/paystack.gateway';
import { NotificationsResolver } from './notifications/resolvers/notifications.resolver';
import { PaymentsResolver } from './payments/resolvers/payments.resolver';
import { EngagementConfig } from './config/engagement.config';
import { NotificationsProcessor } from './notifications/queue/notifications.processor';
import { ReceiptService } from './payments/services/receipt.service';
import { WebhookService as EngagementWebhookService } from './payments/services/webhook.service';
import { WebhookController } from './payments/controllers/webhook.controller';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    CommunicationsModule,
    HttpModule,
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  controllers: [WebhookController],
  providers: [
    // Config
    EngagementConfig,
    // Notifications
    NotificationsFacade,
    DispatcherService,
    TemplateService,
    NotificationsResolver,
    NotificationsProcessor,
    // Payments
    PaymentsFacade,
    GatewayRegistryService,
    PaystackGateway,
    PaymentsResolver,
    ReceiptService,
    EngagementWebhookService,
  ],
  exports: [NotificationsFacade, PaymentsFacade, ReceiptService, EngagementWebhookService],
})
export class EngagementModule {}
