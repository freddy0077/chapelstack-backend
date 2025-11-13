import { Module } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { BranchesResolver } from './branches.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { BranchStatisticsResolver } from './resolvers/branch-statistics.resolver';
import { BranchActivitiesResolver } from './resolvers/branch-activities.resolver';
import { BranchActivitiesService } from './services/branch-activities.service';
import { BranchEventsResolver } from './resolvers/branch-events.resolver';
import { BranchEventsService } from './services/branch-events.service';
import { UsersModule } from '../users/users.module';
import { MembersModule } from '../members/members.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, UsersModule, MembersModule, AuditModule],
  providers: [
    BranchesResolver,
    BranchesService,
    BranchStatisticsResolver,
    BranchActivitiesResolver,
    BranchActivitiesService,
    BranchEventsResolver,
    BranchEventsService,
  ],
  exports: [BranchesService],
})
export class BranchesModule {}
