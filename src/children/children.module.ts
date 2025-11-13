import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChildrenService } from './services/children.service';
import { GuardiansService } from './services/guardians.service';
import { CheckinService } from './services/checkin.service';
import { VolunteersService } from './services/volunteers.service';
import { EventsService } from './services/events.service';
import { ChildrenResolver } from './resolvers/children.resolver';
import { GuardiansResolver } from './resolvers/guardians.resolver';
import { CheckinResolver } from './resolvers/checkin.resolver';
import { VolunteersResolver } from './resolvers/volunteers.resolver';
import { EventsResolver } from './resolvers/events.resolver';
import { ChildrenController } from './controllers/children.controller';
import { GuardiansController } from './controllers/guardians.controller';
import { CheckinController } from './controllers/checkin.controller';
import { VolunteersController } from './controllers/volunteers.controller';
import { EventsController } from './controllers/events.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  providers: [
    // Services
    ChildrenService,
    GuardiansService,
    CheckinService,
    VolunteersService,
    EventsService,

    // GraphQL Resolvers
    ChildrenResolver,
    GuardiansResolver,
    CheckinResolver,
    VolunteersResolver,
    EventsResolver,
  ],
  controllers: [
    ChildrenController,
    GuardiansController,
    CheckinController,
    VolunteersController,
    EventsController,
  ],
  exports: [
    ChildrenService,
    GuardiansService,
    CheckinService,
    VolunteersService,
    EventsService,
  ],
})
export class ChildrenModule {}
