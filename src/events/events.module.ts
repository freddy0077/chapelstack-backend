import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsResolver } from './events.resolver';
import { BranchesModule } from '../branches/branches.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [BranchesModule, WorkflowsModule],
  providers: [EventsService, EventsResolver],
  exports: [EventsService],
})
export class EventsModule {}
