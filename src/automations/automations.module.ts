import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AutomationsService } from './services/automations.service';
import { AutomationSchedulerService } from './services/automation-scheduler.service';
import { AutomationExecutionService } from './services/automation-execution.service';
import { AutomationProcessor } from './processors/automation.processor';
import { AutomationsResolver } from './resolvers/automations.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    BullModule.registerQueue({
      name: 'automations',
      defaultJobOptions: {
        attempts: 3, // Retry 3 times
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 seconds
        },
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
        },
        removeOnFail: false, // Keep failed jobs for debugging
      },
    }),
  ],
  providers: [
    AutomationsService,
    AutomationSchedulerService,
    AutomationExecutionService,
    AutomationProcessor,
    AutomationsResolver,
  ],
  exports: [AutomationsService, AutomationSchedulerService],
})
export class AutomationsModule {}
