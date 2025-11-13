import { Module, forwardRef } from '@nestjs/common';
import { BroadcastsService } from './broadcasts.service';
import { BroadcastsResolver } from './broadcasts.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { ZoomService } from './integrations/zoom/zoom.service';
import { FacebookService } from './integrations/facebook/facebook.service';
import { InstagramService } from './integrations/instagram/instagram.service';
import { StreamHealthMonitorService } from './services/stream-health-monitor.service';
import { StreamQualityMonitorService } from './services/stream-quality-monitor.service';
import { BroadcastAlertService } from './services/broadcast-alert.service';
import { PlatformCredentialsService } from './services/platform-credentials.service';
import { EngagementModule } from '../engagement/engagement.module';

@Module({
  imports: [forwardRef(() => EngagementModule)],
  providers: [
    BroadcastsService,
    BroadcastsResolver,
    PrismaService,
    ZoomService,
    FacebookService,
    InstagramService,
    StreamHealthMonitorService,
    StreamQualityMonitorService,
    BroadcastAlertService,
    PlatformCredentialsService,
  ],
  exports: [
    BroadcastsService,
    StreamHealthMonitorService,
    StreamQualityMonitorService,
    BroadcastAlertService,
    PlatformCredentialsService,
  ],
})
export class BroadcastsModule {}
