import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { CommunicationsModule } from '../communications/communications.module';
// Note: avoid importing EngagementModule to prevent circular dependency.
// Notifications are enqueued via Bull 'notifications' queue from this module.
import { ScheduleModule } from '@nestjs/schedule';

// Services
import { SubscriptionsService } from './services/subscriptions.service';
import { PaystackService } from './services/paystack.service';
import { SubscriptionPlansService } from './services/subscription-plans.service';
import { WebhookService } from './services/webhook.service';
import { OrganizationManagementService } from './services/organization-management.service';
import { SubscriptionWorkflowService } from './services/subscription-workflow.service';
import { SubscriptionLifecycleService } from './services/subscription-lifecycle.service';
import { SubscriptionDashboardService } from './services/subscription-dashboard.service';

// Controllers
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { WebhookController } from './controllers/webhook.controller';
import { OrganizationManagementController } from './controllers/organization-management.controller';

// Resolvers
import { SubscriptionsResolver } from './resolvers/subscriptions.resolver';
import { SubscriptionPlansResolver } from './resolvers/subscription-plans.resolver';
import { OrganizationManagementResolver } from './resolvers/organization-management.resolver';

@Module({
  imports: [
    PrismaModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    forwardRef(() => WorkflowsModule),
    CommunicationsModule,
    BullModule.registerQueue({ name: 'notifications' }),
    ScheduleModule.forRoot(), // Enable cron jobs
  ],
  providers: [
    SubscriptionsService,
    PaystackService,
    SubscriptionPlansService,
    WebhookService,
    OrganizationManagementService,
    SubscriptionWorkflowService,
    SubscriptionLifecycleService,
    SubscriptionDashboardService,
    SubscriptionsResolver,
    SubscriptionPlansResolver,
    OrganizationManagementResolver,
  ],
  controllers: [
    SubscriptionsController,
    WebhookController,
    OrganizationManagementController,
  ],
  exports: [
    SubscriptionsService,
    PaystackService,
    SubscriptionPlansService,
    WebhookService,
    OrganizationManagementService,
    SubscriptionWorkflowService,
    SubscriptionLifecycleService,
    SubscriptionDashboardService,
  ],
})
export class SubscriptionsModule {}
