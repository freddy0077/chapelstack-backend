import { Test, TestingModule } from '@nestjs/testing';
import { SeriesService } from './series.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, Series } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('SeriesService', () => {
  let service: SeriesService;
  let prisma: DeepMockProxy<PrismaClient>;

  const mockSeries: Series = {
    id: 'series-id-1',
    title: 'Test Series',
    description: 'Test description',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    artworkUrl: 'https://example.com/artwork.jpg',
    branchId: 'branch-id-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeriesService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        },
      ],
    }).compile();

    service = module.get<SeriesService>(SeriesService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a series', async () => {
      const createSeriesInput = {
        title: 'Test Series',
        description: 'Test description',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        artworkUrl: 'https://example.com/artwork.jpg',
        branchId: 'branch-id-1',
      };

      prisma.series.create.mockResolvedValue(mockSeries);

      const result = await service.create(createSeriesInput);

      expect(prisma.series.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Series',
          description: 'Test description',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          artworkUrl: 'https://example.com/artwork.jpg',
          branchId: 'branch-id-1',
        },
      });
      expect(result).toEqual(mockSeries);
    });

    it('should handle null dates', async () => {
      const createSeriesInput = {
        title: 'Test Series',
        description: 'Test description',
        branchId: 'branch-id-1',
      };

      const mockSeriesWithNullDates = {
        ...mockSeries,
        startDate: null,
        endDate: null,
      };

      prisma.series.create.mockResolvedValue(mockSeriesWithNullDates);

      const result = await service.create(createSeriesInput);

      expect(prisma.series.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Series',
          description: 'Test description',
          startDate: null,
          endDate: null,
          artworkUrl: undefined,
          branchId: 'branch-id-1',
        },
      });
      expect(result).toEqual(mockSeriesWithNullDates);
    });
  });

  describe('findAll', () => {
    it('should return all series', async () => {
      prisma.series.findMany.mockResolvedValue([mockSeries]);

      const result = await service.findAll();

      expect(prisma.series.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          sermons: true,
        },
      });
      expect(result).toEqual([mockSeries]);
    });

    it('should return series filtered by branchId', async () => {
      const branchId = 'branch-id-1';
      prisma.series.findMany.mockResolvedValue([mockSeries]);

      const result = await service.findAll(branchId);

      expect(prisma.series.findMany).toHaveBeenCalledWith({
        where: { branchId },
        include: {
          sermons: true,
        },
      });
      expect(result).toEqual([mockSeries]);
    });
  });

  describe('findOne', () => {
    it('should return a series by id', async () => {
      prisma.series.findUnique.mockResolvedValue(mockSeries);

      const result = await service.findOne('series-id-1');

      expect(prisma.series.findUnique).toHaveBeenCalledWith({
        where: { id: 'series-id-1' },
        include: {
          sermons: true,
        },
      });
      expect(result).toEqual(mockSeries);
    });

    it('should throw NotFoundException if series not found', async () => {
      prisma.series.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a series', async () => {
      const updateSeriesInput = {
        id: 'series-id-1',
        title: 'Updated Title',
        startDate: '2025-02-01',
      };

      prisma.series.findUnique.mockResolvedValue(mockSeries);
      prisma.series.update.mockResolvedValue({
        ...mockSeries,
        title: 'Updated Title',
        startDate: new Date('2025-02-01'),
      });

      const result = await service.update(updateSeriesInput);

      expect(prisma.series.update).toHaveBeenCalledWith({
        where: { id: 'series-id-1' },
        data: {
          title: 'Updated Title',
          startDate: new Date('2025-02-01'),
        },
        include: {
          sermons: true,
        },
      });
      expect(result.title).toEqual('Updated Title');
      expect(result.startDate).toEqual(new Date('2025-02-01'));
    });

    it('should throw NotFoundException if series to update not found', async () => {
      const updateSeriesInput = {
        id: 'non-existent-id',
        title: 'Updated Title',
      };

      prisma.series.findUnique.mockResolvedValue(null);

      await expect(service.update(updateSeriesInput)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a series', async () => {
      prisma.series.findUnique.mockResolvedValueOnce(mockSeries);
      prisma.series.findUnique.mockResolvedValueOnce({
        ...mockSeries,
        sermons: [],
      });
      prisma.series.delete.mockResolvedValue(mockSeries);

      const result = await service.remove('series-id-1');

      expect(prisma.series.delete).toHaveBeenCalledWith({
        where: { id: 'series-id-1' },
      });
      expect(result).toEqual(mockSeries);
    });

    it('should throw NotFoundException if series to remove not found', async () => {
      prisma.series.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw Error if series has associated sermons', async () => {
      prisma.series.findUnique.mockResolvedValueOnce(mockSeries);
      prisma.series.findUnique.mockResolvedValueOnce({
        ...mockSeries,
        sermons: [{ id: 'sermon-id-1' }],
      });

      await expect(service.remove('series-id-1')).rejects.toThrow(
        'Cannot delete series with ID series-id-1 because it has associated sermons',
      );
    });
  });

  describe('getActiveSeries', () => {
    beforeEach(() => {
      // Mock Date.now to return a fixed date for testing
      jest.useFakeTimers().setSystemTime(new Date('2025-06-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return active series (with end date in the future or null)', async () => {
      const activeSeries = [
        mockSeries, // End date in the future
        { ...mockSeries, id: 'series-id-2', endDate: null }, // No end date
      ];

      prisma.series.findMany.mockResolvedValue(activeSeries);

      const result = await service.getActiveSeries();

      expect(prisma.series.findMany).toHaveBeenCalledWith({
        where: {
          branchId: undefined,
          OR: [{ endDate: { gte: expect.any(Date) } }, { endDate: null }],
        },
        include: {
          sermons: true,
        },
        orderBy: {
          startDate: 'desc',
        },
      });
      expect(result).toEqual(activeSeries);
    });

    it('should filter active series by branchId', async () => {
      const branchId = 'branch-id-1';
      prisma.series.findMany.mockResolvedValue([mockSeries]);

      const result = await service.getActiveSeries(branchId);

      expect(prisma.series.findMany).toHaveBeenCalledWith({
        where: {
          branchId,
          OR: [{ endDate: { gte: expect.any(Date) } }, { endDate: null }],
        },
        include: {
          sermons: true,
        },
        orderBy: {
          startDate: 'desc',
        },
      });
      expect(result).toEqual([mockSeries]);
    });
  });
});
