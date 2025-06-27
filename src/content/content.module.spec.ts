import { Test } from '@nestjs/testing';
import { ContentModule } from './content.module';
import { SpeakersService } from './services/speakers.service';
import { SeriesService } from './services/series.service';
import { SermonsService } from './services/sermons.service';
import { MediaItemsService } from './services/media-items.service';
import { SpeakersResolver } from './resolvers/speakers.resolver';
import { SeriesResolver } from './resolvers/series.resolver';
import { SermonsResolver } from './resolvers/sermons.resolver';
import { MediaItemsResolver } from './resolvers/media-items.resolver';
import { PrismaModule } from '../prisma/prisma.module';

describe('ContentModule', () => {
  let contentModule: ContentModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ContentModule],
    }).compile();

    contentModule = moduleRef.get<ContentModule>(ContentModule);
  });

  it('should be defined', () => {
    expect(contentModule).toBeDefined();
  });

  it('should provide SpeakersService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ContentModule, PrismaModule],
    }).compile();

    const speakersService = moduleRef.get<SpeakersService>(SpeakersService);
    expect(speakersService).toBeDefined();
  });

  it('should provide SeriesService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ContentModule, PrismaModule],
    }).compile();

    const seriesService = moduleRef.get<SeriesService>(SeriesService);
    expect(seriesService).toBeDefined();
  });

  it('should provide SermonsService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ContentModule, PrismaModule],
    }).compile();

    const sermonsService = moduleRef.get<SermonsService>(SermonsService);
    expect(sermonsService).toBeDefined();
  });

  it('should provide MediaItemsService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ContentModule, PrismaModule],
    }).compile();

    const mediaItemsService =
      moduleRef.get<MediaItemsService>(MediaItemsService);
    expect(mediaItemsService).toBeDefined();
  });

  it('should provide SpeakersResolver', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ContentModule, PrismaModule],
    }).compile();

    const speakersResolver = moduleRef.get<SpeakersResolver>(SpeakersResolver);
    expect(speakersResolver).toBeDefined();
  });

  it('should provide SeriesResolver', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ContentModule, PrismaModule],
    }).compile();

    const seriesResolver = moduleRef.get<SeriesResolver>(SeriesResolver);
    expect(seriesResolver).toBeDefined();
  });

  it('should provide SermonsResolver', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ContentModule, PrismaModule],
    }).compile();

    const sermonsResolver = moduleRef.get<SermonsResolver>(SermonsResolver);
    expect(sermonsResolver).toBeDefined();
  });

  it('should provide MediaItemsResolver', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ContentModule, PrismaModule],
    }).compile();

    const mediaItemsResolver =
      moduleRef.get<MediaItemsResolver>(MediaItemsResolver);
    expect(mediaItemsResolver).toBeDefined();
  });
});
