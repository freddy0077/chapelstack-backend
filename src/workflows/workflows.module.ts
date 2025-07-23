import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { CommunicationsModule } from '../communications/communications.module';
import { WorkflowsService } from './services/workflows.service';
import { WorkflowTemplateService } from './services/workflow-template.service';
import { WorkflowExecutionService } from './services/workflow-execution.service';
import { WorkflowTriggerService } from './services/workflow-trigger.service';
import { WorkflowProcessor } from './processors/workflow.processor';
import { WorkflowsResolver } from './resolvers/workflows.resolver';

@Module({
  imports: [
    PrismaModule,
    CommunicationsModule,
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'workflow-execution',
    }),
  ],
  providers: [
    WorkflowsService,
    WorkflowTemplateService,
    WorkflowExecutionService,
    WorkflowTriggerService,
    WorkflowProcessor,
    WorkflowsResolver,
  ],
  exports: [
    WorkflowsService,
    WorkflowTemplateService,
    WorkflowExecutionService,
    WorkflowTriggerService,
  ],
})
export class WorkflowsModule {}
