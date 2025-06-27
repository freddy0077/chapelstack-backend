import { Module } from '@nestjs/common';
import { MembersService } from './services/members.service';
import { SpiritualMilestonesService } from './services/spiritual-milestones.service';
import { FamiliesService } from './services/families.service';
import { MembersResolver } from './resolvers/members.resolver';
import { SpiritualMilestonesResolver } from './resolvers/spiritual-milestones.resolver';
import { FamiliesResolver } from './resolvers/families.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  providers: [
    MembersService,
    SpiritualMilestonesService,
    FamiliesService,
    MembersResolver,
    SpiritualMilestonesResolver,
    FamiliesResolver,
  ],
  exports: [MembersService, SpiritualMilestonesService, FamiliesService],
})
export class MembersModule {}
