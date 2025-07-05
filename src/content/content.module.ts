import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { SpeakersService } from './services/speakers.service';
import { SeriesService } from './services/series.service';
import { SermonsService } from './services/sermons.service';
import { MediaItemsService } from './services/media-items.service';
import { S3UploadService } from './services/s3-upload.service';
import { SpeakersResolver } from './resolvers/speakers.resolver';
import { SeriesResolver } from './resolvers/series.resolver';
import { SermonsResolver } from './resolvers/sermons.resolver';
import { MediaItemsResolver } from './resolvers/media-items.resolver';
import { FileUploadResolver } from './resolvers/file-upload.resolver';
import s3Config from '../config/s3-config';

@Module({
  imports: [PrismaModule, ConfigModule.forFeature(s3Config)],
  providers: [
    // Services
    SpeakersService,
    SeriesService,
    SermonsService,
    MediaItemsService,
    S3UploadService,

    // Resolvers
    SpeakersResolver,
    SeriesResolver,
    SermonsResolver,
    MediaItemsResolver,
    FileUploadResolver,
  ],
  exports: [
    SpeakersService,
    SeriesService,
    SermonsService,
    MediaItemsService,
    S3UploadService,
  ],
})
export class ContentModule {}
