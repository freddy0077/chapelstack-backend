import { Test, TestingModule } from '@nestjs/testing';
import { SermonsService } from './sermons.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { ContentStatus, PrismaClient, Sermon } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('SermonsService', () => {
  let service: SermonsService;
  let prisma: DeepMockProxy<PrismaClient>;

  const mockSermon: Sermon = {
    id: 'sermon-id-1',
    title: 'Test Sermon',
    description: 'Test description',
    datePreached: new Date('2025-05-01'),
    speakerId: 'speaker-id-1',
    seriesId: 'series-id-1',
    mainScripture: 'John 3:16',
    audioUrl: 'https://example.com/audio.mp3',
    videoUrl: 'https://example.com/video.mp4',
    transcriptUrl: 'https://example.com/transcript.pdf',
    transcriptText: 'This is the transcript text',
    duration: 3600, // 1 hour in seconds
    status: ContentStatus.PUBLISHED,
    branchId: 'branch-id-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSpeaker = {
    id: 'speaker-id-1',
    name: 'John Doe',
  };

  const mockSeries = {
    id: 'series-id-1',
    title: 'Test Series',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SermonsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        },
      ],
    }).compile();

    service = module.get<SermonsService>(SermonsService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a sermon', async () => {
      const createSermonInput = {
        title: 'Test Sermon',
        description: 'Test description',
        datePreached: '2025-05-01',
        speakerId: 'speaker-id-1',
        seriesId: 'series-id-1',
        mainScripture: 'John 3:16',
        audioUrl: 'https://example.com/audio.mp3',
        videoUrl: 'https://example.com/video.mp4',
        transcriptUrl: 'https://example.com/transcript.pdf',
        transcriptText: 'This is the transcript text',
        duration: 3600,
        branchId: 'branch-id-1',
        status: ContentStatus.PUBLISHED,
      };

      prisma.speaker.findUnique.mockResolvedValue(mockSpeaker);
      prisma.series.findUnique.mockResolvedValue(mockSeries);
      prisma.sermon.create.mockResolvedValue(mockSermon);

      const result = await service.create(createSermonInput);

      expect(prisma.speaker.findUnique).toHaveBeenCalledWith({
        where: { id: 'speaker-id-1' },
      });
      expect(prisma.series.findUnique).toHaveBeenCalledWith({
        where: { id: 'series-id-1' },
      });
      expect(prisma.sermon.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Sermon',
          description: 'Test description',
          datePreached: new Date('2025-05-01'),
          mainScripture: 'John 3:16',
          audioUrl: 'https://example.com/audio.mp3',
          videoUrl: 'https://example.com/video.mp4',
          transcriptUrl: 'https://example.com/transcript.pdf',
          transcriptText: 'This is the transcript text',
          duration: 3600,
          status: ContentStatus.PUBLISHED,
          branchId: 'branch-id-1',
          speaker: {
            connect: { id: 'speaker-id-1' },
          },
          series: {
            connect: { id: 'series-id-1' },
          },
        },
        include: {
          speaker: true,
          series: true,
        },
      });
      expect(result).toEqual(mockSermon);
    });

    it('should throw NotFoundException if speaker not found', async () => {
      const createSermonInput = {
        title: 'Test Sermon',
        datePreached: '2025-05-01',
        speakerId: 'non-existent-speaker',
        branchId: 'branch-id-1',
      };

      prisma.speaker.findUnique.mockResolvedValue(null);

      await expect(service.create(createSermonInput)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if series not found', async () => {
      const createSermonInput = {
        title: 'Test Sermon',
        datePreached: '2025-05-01',
        speakerId: 'speaker-id-1',
        seriesId: 'non-existent-series',
        branchId: 'branch-id-1',
      };

      prisma.speaker.findUnique.mockResolvedValue(mockSpeaker);
      prisma.series.findUnique.mockResolvedValue(null);

      await expect(service.create(createSermonInput)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create a sermon with default status if not provided', async () => {
      const createSermonInput = {
        title: 'Test Sermon',
        datePreached: '2025-05-01',
        speakerId: 'speaker-id-1',
        branchId: 'branch-id-1',
      };

      prisma.speaker.findUnique.mockResolvedValue(mockSpeaker);
      prisma.sermon.create.mockResolvedValue({
        ...mockSermon,
        status: ContentStatus.DRAFT,
      });

      await service.create(createSermonInput);

      expect(prisma.sermon.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: ContentStatus.DRAFT,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all sermons', async () => {
      prisma.sermon.findMany.mockResolvedValue([mockSermon]);

      const result = await service.findAll();

      expect(prisma.sermon.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          speaker: true,
          series: true,
        },
        orderBy: {
          datePreached: 'desc',
        },
      });
      expect(result).toEqual([mockSermon]);
    });

    it('should return sermons filtered by branchId', async () => {
      const branchId = 'branch-id-1';
      prisma.sermon.findMany.mockResolvedValue([mockSermon]);

      const result = await service.findAll(branchId);

      expect(prisma.sermon.findMany).toHaveBeenCalledWith({
        where: { branchId },
        include: {
          speaker: true,
          series: true,
        },
        orderBy: {
          datePreached: 'desc',
        },
      });
      expect(result).toEqual([mockSermon]);
    });

    it('should return sermons filtered by speakerId', async () => {
      const speakerId = 'speaker-id-1';
      prisma.sermon.findMany.mockResolvedValue([mockSermon]);

      const result = await service.findAll(undefined, speakerId);

      expect(prisma.sermon.findMany).toHaveBeenCalledWith({
        where: { speakerId },
        include: {
          speaker: true,
          series: true,
        },
        orderBy: {
          datePreached: 'desc',
        },
      });
      expect(result).toEqual([mockSermon]);
    });

    it('should return sermons filtered by seriesId', async () => {
      const seriesId = 'series-id-1';
      prisma.sermon.findMany.mockResolvedValue([mockSermon]);

      const result = await service.findAll(undefined, undefined, seriesId);

      expect(prisma.sermon.findMany).toHaveBeenCalledWith({
        where: { seriesId },
        include: {
          speaker: true,
          series: true,
        },
        orderBy: {
          datePreached: 'desc',
        },
      });
      expect(result).toEqual([mockSermon]);
    });

    it('should return sermons filtered by status', async () => {
      const status = ContentStatus.PUBLISHED;
      prisma.sermon.findMany.mockResolvedValue([mockSermon]);

      const result = await service.findAll(
        undefined,
        undefined,
        undefined,
        status,
      );

      expect(prisma.sermon.findMany).toHaveBeenCalledWith({
        where: { status },
        include: {
          speaker: true,
          series: true,
        },
        orderBy: {
          datePreached: 'desc',
        },
      });
      expect(result).toEqual([mockSermon]);
    });

    it('should return sermons with multiple filters', async () => {
      const branchId = 'branch-id-1';
      const speakerId = 'speaker-id-1';
      const status = ContentStatus.PUBLISHED;
      prisma.sermon.findMany.mockResolvedValue([mockSermon]);

      const result = await service.findAll(
        branchId,
        speakerId,
        undefined,
        status,
      );

      expect(prisma.sermon.findMany).toHaveBeenCalledWith({
        where: { branchId, speakerId, status },
        include: {
          speaker: true,
          series: true,
        },
        orderBy: {
          datePreached: 'desc',
        },
      });
      expect(result).toEqual([mockSermon]);
    });
  });

  describe('findOne', () => {
    it('should return a sermon by id', async () => {
      prisma.sermon.findUnique.mockResolvedValue(mockSermon);

      const result = await service.findOne('sermon-id-1');

      expect(prisma.sermon.findUnique).toHaveBeenCalledWith({
        where: { id: 'sermon-id-1' },
        include: {
          speaker: true,
          series: true,
        },
      });
      expect(result).toEqual(mockSermon);
    });

    it('should throw NotFoundException if sermon not found', async () => {
      prisma.sermon.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a sermon', async () => {
      const updateSermonInput = {
        id: 'sermon-id-1',
        title: 'Updated Title',
        datePreached: '2025-05-15',
      };

      prisma.sermon.findUnique.mockResolvedValue(mockSermon);
      prisma.sermon.update.mockResolvedValue({
        ...mockSermon,
        title: 'Updated Title',
        datePreached: new Date('2025-05-15'),
      });

      const result = await service.update(updateSermonInput);

      expect(prisma.sermon.update).toHaveBeenCalledWith({
        where: { id: 'sermon-id-1' },
        data: {
          title: 'Updated Title',
          datePreached: new Date('2025-05-15'),
        },
        include: {
          speaker: true,
          series: true,
        },
      });
      expect(result.title).toEqual('Updated Title');
      expect(result.datePreached).toEqual(new Date('2025-05-15'));
    });

    it('should throw NotFoundException if sermon to update not found', async () => {
      const updateSermonInput = {
        id: 'non-existent-id',
        title: 'Updated Title',
      };

      prisma.sermon.findUnique.mockResolvedValue(null);

      await expect(service.update(updateSermonInput)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if speaker to update not found', async () => {
      const updateSermonInput = {
        id: 'sermon-id-1',
        speakerId: 'non-existent-speaker',
      };

      prisma.sermon.findUnique.mockResolvedValue(mockSermon);
      prisma.speaker.findUnique.mockResolvedValue(null);

      await expect(service.update(updateSermonInput)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if series to update not found', async () => {
      const updateSermonInput = {
        id: 'sermon-id-1',
        seriesId: 'non-existent-series',
      };

      prisma.sermon.findUnique.mockResolvedValue(mockSermon);
      prisma.series.findUnique.mockResolvedValue(null);

      await expect(service.update(updateSermonInput)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle disconnecting series when seriesId is null', async () => {
      const updateSermonInput = {
        id: 'sermon-id-1',
        seriesId: null,
      };

      prisma.sermon.findUnique.mockResolvedValue(mockSermon);
      prisma.sermon.update.mockResolvedValue({
        ...mockSermon,
        seriesId: null,
        series: null,
      });

      await service.update(updateSermonInput);

      expect(prisma.sermon.update).toHaveBeenCalledWith({
        where: { id: 'sermon-id-1' },
        data: {
          series: { disconnect: true },
        },
        include: {
          speaker: true,
          series: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove a sermon', async () => {
      prisma.sermon.findUnique.mockResolvedValue(mockSermon);
      prisma.sermon.delete.mockResolvedValue(mockSermon);

      const result = await service.remove('sermon-id-1');

      expect(prisma.sermon.delete).toHaveBeenCalledWith({
        where: { id: 'sermon-id-1' },
      });
      expect(result).toEqual(mockSermon);
    });

    it('should throw NotFoundException if sermon to remove not found', async () => {
      prisma.sermon.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update sermon status', async () => {
      prisma.sermon.findUnique.mockResolvedValue(mockSermon);
      prisma.sermon.update.mockResolvedValue({
        ...mockSermon,
        status: ContentStatus.ARCHIVED,
      });

      const result = await service.updateStatus(
        'sermon-id-1',
        ContentStatus.ARCHIVED,
      );

      expect(prisma.sermon.update).toHaveBeenCalledWith({
        where: { id: 'sermon-id-1' },
        data: { status: ContentStatus.ARCHIVED },
        include: {
          speaker: true,
          series: true,
        },
      });
      expect(result.status).toEqual(ContentStatus.ARCHIVED);
    });

    it('should throw NotFoundException if sermon not found', async () => {
      prisma.sermon.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('non-existent-id', ContentStatus.PUBLISHED),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findRecent', () => {
    it('should return recent published sermons', async () => {
      prisma.sermon.findMany.mockResolvedValue([mockSermon]);

      const result = await service.findRecent();

      expect(prisma.sermon.findMany).toHaveBeenCalledWith({
        where: { status: ContentStatus.PUBLISHED },
        take: 5,
        orderBy: {
          datePreached: 'desc',
        },
        include: {
          speaker: true,
          series: true,
        },
      });
      expect(result).toEqual([mockSermon]);
    });

    it('should respect the limit parameter', async () => {
      prisma.sermon.findMany.mockResolvedValue([mockSermon]);

      await service.findRecent(10);

      expect(prisma.sermon.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        }),
      );
    });

    it('should filter by branchId if provided', async () => {
      const branchId = 'branch-id-1';
      prisma.sermon.findMany.mockResolvedValue([mockSermon]);

      await service.findRecent(5, branchId);

      expect(prisma.sermon.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: ContentStatus.PUBLISHED, branchId },
        }),
      );
    });
  });

  describe('search', () => {
    it('should search sermons by query', async () => {
      const query = 'faith';
      prisma.sermon.findMany.mockResolvedValue([mockSermon]);

      const result = await service.search(query);

      expect(prisma.sermon.findMany).toHaveBeenCalledWith({
        where: {
          status: ContentStatus.PUBLISHED,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { mainScripture: { contains: query, mode: 'insensitive' } },
            { transcriptText: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          speaker: true,
          series: true,
        },
        orderBy: {
          datePreached: 'desc',
        },
      });
      expect(result).toEqual([mockSermon]);
    });

    it('should filter search by branchId if provided', async () => {
      const query = 'faith';
      const branchId = 'branch-id-1';
      prisma.sermon.findMany.mockResolvedValue([mockSermon]);

      await service.search(query, branchId);

      expect(prisma.sermon.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            branchId,
          }),
        }),
      );
    });
  });
});
