import { Module, Logger } from '@nestjs/common';
import { MinistriesService } from './services/ministries.service';
import { MinistriesResolver } from './resolvers/ministries.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { MembersModule } from '../members/members.module';
import { SmallGroupsService } from './services/small-groups.service';
import { SmallGroupsResolver } from './resolvers/small-groups.resolver';
import { GroupMembersService } from './services/group-members.service';
import { GroupMembersResolver } from './resolvers/group-members.resolver';
import { GroupExecutivesService } from './services/group-executives.service';
import { GroupExecutivesResolver } from './resolvers/group-executives.resolver';
import { MinistryRoleGuard } from './guards/ministry-role.guard';
import { MinistryIntegrationsService } from './services/ministry-integrations.service';
import { MinistryMembersService } from './services/ministry-members.service';
import { MinistryMembersResolver } from './resolvers/ministry-members.resolver';

// Import enums to ensure GraphQL registration
import './enums/small-group-type.enum';
import './enums/small-group-status.enum';
import './enums/group-member-role.enum';
import './enums/group-executive-role.enum';
import './enums/group-executive-status.enum';

@Module({
  imports: [PrismaModule, MembersModule],
  providers: [
    MinistriesService,
    MinistriesResolver,
    SmallGroupsService,
    SmallGroupsResolver,
    GroupMembersService,
    GroupMembersResolver,
    GroupExecutivesService,
    GroupExecutivesResolver,
    MinistryRoleGuard,
    MinistryIntegrationsService,
    MinistryMembersService,
    MinistryMembersResolver,
    Logger,
  ],
  exports: [
    MinistriesService,
    SmallGroupsService,
    GroupMembersService,
    GroupExecutivesService,
    MinistryMembersService,
    MinistryIntegrationsService,
  ],
})
export class MinistriesModule {}
