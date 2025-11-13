import { Module, forwardRef } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsResolver } from './events.resolver';
import { EventNotificationService } from './services/event-notification.service';
import { BranchesModule } from '../branches/branches.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { CommunicationsModule } from '../communications/communications.module';
import { EngagementModule } from '../engagement/engagement.module';
import { AuditModule } from '../audit/audit.module';
// Import to register GraphQL enums
import './enums/graphql-enums';

@Module({
  imports: [BranchesModule, WorkflowsModule, CommunicationsModule, forwardRef(() => EngagementModule), AuditModule],
  providers: [EventsService, EventsResolver, EventNotificationService],
  exports: [EventsService],
})
export class EventsModule {}
