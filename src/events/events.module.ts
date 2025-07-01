import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsResolver } from './events.resolver';
import { BranchesModule } from '../branches/branches.module';

@Module({
  imports: [BranchesModule],
  providers: [EventsService, EventsResolver],
  exports: [EventsService],
})
export class EventsModule {}
