import { Test, TestingModule } from '@nestjs/testing';
import { SpeakersService } from './speakers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, Speaker } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('SpeakersService', () => {
  let service: SpeakersService;
  let prisma: DeepMockProxy<PrismaClient>;

  const mockSpeaker: Speaker = {
    id: 'speaker-id-1',
    name: 'John Doe',
    bio: 'Test bio',
    memberId: 'member-id-1',
    branchId: 'branch-id-1',
    imageUrl: 'https://example.com/image.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeakersService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        },
      ],
    }).compile();

    service = module.get<SpeakersService>(SpeakersService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a speaker', async () => {
      const createSpeakerInput = {
        name: 'John Doe',
        bio: 'Test bio',
        memberId: 'member-id-1',
        branchId: 'branch-id-1',
        imageUrl: 'https://example.com/image.jpg',
      };

      prisma.speaker.create.mockResolvedValue(mockSpeaker);

      const result = await service.create(createSpeakerInput);

      expect(prisma.speaker.create).toHaveBeenCalledWith({
        data: createSpeakerInput,
      });
      expect(result).toEqual(mockSpeaker);
    });
  });

  describe('findAll', () => {
    it('should return all speakers', async () => {
      prisma.speaker.findMany.mockResolvedValue([mockSpeaker]);

      const result = await service.findAll();

      expect(prisma.speaker.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          member: true,
          sermons: true,
        },
      });
      expect(result).toEqual([mockSpeaker]);
    });

    it('should return speakers filtered by branchId', async () => {
      const branchId = 'branch-id-1';
      prisma.speaker.findMany.mockResolvedValue([mockSpeaker]);

      const result = await service.findAll(branchId);

      expect(prisma.speaker.findMany).toHaveBeenCalledWith({
        where: { branchId },
        include: {
          member: true,
          sermons: true,
        },
      });
      expect(result).toEqual([mockSpeaker]);
    });
  });

  describe('findOne', () => {
    it('should return a speaker by id', async () => {
      prisma.speaker.findUnique.mockResolvedValue(mockSpeaker);

      const result = await service.findOne('speaker-id-1');

      expect(prisma.speaker.findUnique).toHaveBeenCalledWith({
        where: { id: 'speaker-id-1' },
        include: {
          member: true,
          sermons: true,
        },
      });
      expect(result).toEqual(mockSpeaker);
    });

    it('should throw NotFoundException if speaker not found', async () => {
      prisma.speaker.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a speaker', async () => {
      const updateSpeakerInput = {
        id: 'speaker-id-1',
        name: 'Updated Name',
      };

      prisma.speaker.findUnique.mockResolvedValue(mockSpeaker);
      prisma.speaker.update.mockResolvedValue({
        ...mockSpeaker,
        name: 'Updated Name',
      });

      const result = await service.update(updateSpeakerInput);

      expect(prisma.speaker.update).toHaveBeenCalledWith({
        where: { id: 'speaker-id-1' },
        data: { name: 'Updated Name' },
        include: {
          member: true,
          sermons: true,
        },
      });
      expect(result.name).toEqual('Updated Name');
    });

    it('should throw NotFoundException if speaker to update not found', async () => {
      const updateSpeakerInput = {
        id: 'non-existent-id',
        name: 'Updated Name',
      };

      prisma.speaker.findUnique.mockResolvedValue(null);

      await expect(service.update(updateSpeakerInput)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a speaker', async () => {
      prisma.speaker.findUnique.mockResolvedValueOnce(mockSpeaker);
      prisma.speaker.findUnique.mockResolvedValueOnce({
        ...mockSpeaker,
        sermons: [],
      });
      prisma.speaker.delete.mockResolvedValue(mockSpeaker);

      const result = await service.remove('speaker-id-1');

      expect(prisma.speaker.delete).toHaveBeenCalledWith({
        where: { id: 'speaker-id-1' },
      });
      expect(result).toEqual(mockSpeaker);
    });

    it('should throw NotFoundException if speaker to remove not found', async () => {
      prisma.speaker.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw Error if speaker has associated sermons', async () => {
      prisma.speaker.findUnique.mockResolvedValueOnce(mockSpeaker);
      prisma.speaker.findUnique.mockResolvedValueOnce({
        ...mockSpeaker,
        sermons: [{ id: 'sermon-id-1' }],
      });

      await expect(service.remove('speaker-id-1')).rejects.toThrow(
        'Cannot delete speaker with ID speaker-id-1 because they have associated sermons',
      );
    });
  });

  describe('findByMember', () => {
    it('should return a speaker by memberId', async () => {
      prisma.speaker.findUnique.mockResolvedValue(mockSpeaker);

      const result = await service.findByMember('member-id-1');

      expect(prisma.speaker.findUnique).toHaveBeenCalledWith({
        where: { memberId: 'member-id-1' },
        include: {
          sermons: true,
        },
      });
      expect(result).toEqual(mockSpeaker);
    });

    it('should return null if no speaker found for member', async () => {
      prisma.speaker.findUnique.mockResolvedValue(null);

      const result = await service.findByMember('non-existent-id');

      expect(result).toBeNull();
    });
  });
});
