import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommunicationsModule } from '../communications/communications.module';

// Services
import { PastoralVisitService } from './services/pastoral-visit.service';
import { CounselingSessionService } from './services/counseling-session.service';
import { CareRequestService } from './services/care-request.service';
import { FollowUpReminderService } from './services/follow-up-reminder.service';
import { PastoralCareService } from './services/pastoral-care.service';

// Resolvers
import { PastoralVisitResolver } from './resolvers/pastoral-visit.resolver';
import { CounselingSessionResolver } from './resolvers/counseling-session.resolver';
import { CareRequestResolver } from './resolvers/care-request.resolver';
import { FollowUpReminderResolver } from './resolvers/follow-up-reminder.resolver';
import { PastoralCareResolver } from './resolvers/pastoral-care.resolver';

@Module({
  imports: [PrismaModule, CommunicationsModule],
  providers: [
    // Services
    PastoralVisitService,
    CounselingSessionService,
    CareRequestService,
    FollowUpReminderService,
    PastoralCareService,

    // Resolvers
    PastoralVisitResolver,
    CounselingSessionResolver,
    CareRequestResolver,
    FollowUpReminderResolver,
    PastoralCareResolver,
  ],
  exports: [
    PastoralVisitService,
    CounselingSessionService,
    CareRequestService,
    FollowUpReminderService,
    PastoralCareService,
  ],
})
export class PastoralCareModule {}
