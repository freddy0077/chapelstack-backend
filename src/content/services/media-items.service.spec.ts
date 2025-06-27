import { Test, TestingModule } from '@nestjs/testing';
import { MediaItemsService } from './media-items.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { MediaItem, MediaType, PrismaClient } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('MediaItemsService', () => {
  let service: MediaItemsService;
  let prisma: DeepMockProxy<PrismaClient>;

  const mockMediaItem: MediaItem = {
    id: 'media-item-id-1',
    title: 'Test Media Item',
    description: 'Test description',
    fileUrl: 'https://example.com/file.mp3',
    mimeType: 'audio/mpeg',
    fileSize: 5000000, // 5MB
    type: MediaType.AUDIO,
    branchId: 'branch-id-1',
    uploadedBy: 'user-id-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaItemsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        },
      ],
    }).compile();

    service = module.get<MediaItemsService>(MediaItemsService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a media item', async () => {
      const createMediaItemInput = {
        title: 'Test Media Item',
        description: 'Test description',
        fileUrl: 'https://example.com/file.mp3',
        mimeType: 'audio/mpeg',
        fileSize: 5000000,
        type: MediaType.AUDIO,
        branchId: 'branch-id-1',
        uploadedBy: 'user-id-1',
      };

      prisma.mediaItem.create.mockResolvedValue(mockMediaItem);

      const result = await service.create(createMediaItemInput);

      expect(prisma.mediaItem.create).toHaveBeenCalledWith({
        data: createMediaItemInput,
      });
      expect(result).toEqual(mockMediaItem);
    });
  });

  describe('findAll', () => {
    it('should return all media items', async () => {
      prisma.mediaItem.findMany.mockResolvedValue([mockMediaItem]);

      const result = await service.findAll();

      expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([mockMediaItem]);
    });

    it('should return media items filtered by branchId', async () => {
      const branchId = 'branch-id-1';
      prisma.mediaItem.findMany.mockResolvedValue([mockMediaItem]);

      const result = await service.findAll(branchId);

      expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
        where: { branchId },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([mockMediaItem]);
    });

    it('should return media items filtered by type', async () => {
      const type = MediaType.AUDIO;
      prisma.mediaItem.findMany.mockResolvedValue([mockMediaItem]);

      const result = await service.findAll(undefined, type);

      expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
        where: { type },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([mockMediaItem]);
    });

    it('should return media items filtered by both branchId and type', async () => {
      const branchId = 'branch-id-1';
      const type = MediaType.AUDIO;
      prisma.mediaItem.findMany.mockResolvedValue([mockMediaItem]);

      const result = await service.findAll(branchId, type);

      expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
        where: { branchId, type },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([mockMediaItem]);
    });
  });

  describe('findOne', () => {
    it('should return a media item by id', async () => {
      prisma.mediaItem.findUnique.mockResolvedValue(mockMediaItem);

      const result = await service.findOne('media-item-id-1');

      expect(prisma.mediaItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'media-item-id-1' },
      });
      expect(result).toEqual(mockMediaItem);
    });

    it('should throw NotFoundException if media item not found', async () => {
      prisma.mediaItem.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a media item', async () => {
      const updateMediaItemInput = {
        id: 'media-item-id-1',
        title: 'Updated Title',
        fileSize: 6000000,
      };

      prisma.mediaItem.findUnique.mockResolvedValue(mockMediaItem);
      prisma.mediaItem.update.mockResolvedValue({
        ...mockMediaItem,
        title: 'Updated Title',
        fileSize: 6000000,
      });

      const result = await service.update(updateMediaItemInput);

      expect(prisma.mediaItem.update).toHaveBeenCalledWith({
        where: { id: 'media-item-id-1' },
        data: {
          title: 'Updated Title',
          fileSize: 6000000,
        },
      });
      expect(result.title).toEqual('Updated Title');
      expect(result.fileSize).toEqual(6000000);
    });

    it('should throw NotFoundException if media item to update not found', async () => {
      const updateMediaItemInput = {
        id: 'non-existent-id',
        title: 'Updated Title',
      };

      prisma.mediaItem.findUnique.mockResolvedValue(null);

      await expect(service.update(updateMediaItemInput)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a media item', async () => {
      prisma.mediaItem.findUnique.mockResolvedValue(mockMediaItem);
      prisma.mediaItem.delete.mockResolvedValue(mockMediaItem);

      const result = await service.remove('media-item-id-1');

      expect(prisma.mediaItem.delete).toHaveBeenCalledWith({
        where: { id: 'media-item-id-1' },
      });
      expect(result).toEqual(mockMediaItem);
    });

    it('should throw NotFoundException if media item to remove not found', async () => {
      prisma.mediaItem.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByType', () => {
    it('should return media items by type', async () => {
      const type = MediaType.AUDIO;
      prisma.mediaItem.findMany.mockResolvedValue([mockMediaItem]);

      const result = await service.findByType(type);

      expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
        where: { type },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([mockMediaItem]);
    });

    it('should filter by branchId if provided', async () => {
      const type = MediaType.AUDIO;
      const branchId = 'branch-id-1';
      prisma.mediaItem.findMany.mockResolvedValue([mockMediaItem]);

      const result = await service.findByType(type, branchId);

      expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
        where: { type, branchId },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([mockMediaItem]);
    });
  });

  describe('search', () => {
    it('should search media items by query', async () => {
      const query = 'test';
      prisma.mediaItem.findMany.mockResolvedValue([mockMediaItem]);

      const result = await service.search(query);

      expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([mockMediaItem]);
    });

    it('should filter search by branchId if provided', async () => {
      const query = 'test';
      const branchId = 'branch-id-1';
      prisma.mediaItem.findMany.mockResolvedValue([mockMediaItem]);

      const result = await service.search(query, branchId);

      expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
        where: {
          branchId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([mockMediaItem]);
    });

    it('should filter search by type if provided', async () => {
      const query = 'test';
      const type = MediaType.AUDIO;
      prisma.mediaItem.findMany.mockResolvedValue([mockMediaItem]);

      const result = await service.search(query, undefined, type);

      expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
        where: {
          type,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([mockMediaItem]);
    });

    it('should filter search by both branchId and type if provided', async () => {
      const query = 'test';
      const branchId = 'branch-id-1';
      const type = MediaType.AUDIO;
      prisma.mediaItem.findMany.mockResolvedValue([mockMediaItem]);

      const result = await service.search(query, branchId, type);

      expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
        where: {
          branchId,
          type,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual([mockMediaItem]);
    });
  });
});
