import { Test, TestingModule } from '@nestjs/testing';
import { SpiritualMilestonesService } from './spiritual-milestones.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { NotFoundException } from '@nestjs/common';
import { CreateSpiritualMilestoneInput } from '../dto/create-spiritual-milestone.input';
import { SpiritualMilestoneType } from '../entities/spiritual-milestone.entity';

describe('SpiritualMilestonesService', () => {
  let service: SpiritualMilestonesService;
  let prismaService: PrismaService;
  let auditLogService: AuditLogService;

  const mockPrismaService = {
    spiritualMilestone: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    member: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAuditLogService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpiritualMilestonesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<SpiritualMilestonesService>(
      SpiritualMilestonesService,
    );
    prismaService = module.get<PrismaService>(PrismaService);
    auditLogService = module.get<AuditLogService>(AuditLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockMember = {
      id: 'member-id',
      firstName: 'John',
      lastName: 'Doe',
    };

    const mockMilestone = {
      id: 'milestone-id',
      type: 'BAPTISM',
      date: new Date(),
      location: 'Church',
      performedBy: 'Pastor Smith',
      description: 'Baptism ceremony',
      additionalDetails: {},
      memberId: 'member-id',
      member: mockMember,
    };

    const createInput: CreateSpiritualMilestoneInput = {
      type: SpiritualMilestoneType.BAPTISM,
      date: new Date(),
      location: 'Church',
      performedBy: 'Pastor Smith',
      description: 'Baptism ceremony',
      additionalDetails: {},
      memberId: 'member-id',
    };

    it('should create a spiritual milestone', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.spiritualMilestone.create.mockResolvedValue(
        mockMilestone,
      );

      const result = await service.create(createInput);

      expect(mockPrismaService.member.findUnique).toHaveBeenCalledWith({
        where: { id: 'member-id' },
      });
      expect(mockPrismaService.spiritualMilestone.create).toHaveBeenCalled();
      expect(mockAuditLogService.create).toHaveBeenCalled();
      expect(mockPrismaService.member.update).toHaveBeenCalled();
      expect(result).toEqual(mockMilestone);
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.create(createInput)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockPrismaService.spiritualMilestone.create,
      ).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of spiritual milestones', async () => {
      const mockMilestones = [
        { id: '1', type: 'BAPTISM' },
        { id: '2', type: 'CONFIRMATION' },
      ];
      mockPrismaService.spiritualMilestone.findMany.mockResolvedValue(
        mockMilestones,
      );

      const result = await service.findAll();

      expect(mockPrismaService.spiritualMilestone.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockMilestones);
    });
  });

  describe('findOne', () => {
    it('should return a single spiritual milestone', async () => {
      const mockMilestone = { id: '1', type: 'BAPTISM' };
      mockPrismaService.spiritualMilestone.findUnique.mockResolvedValue(
        mockMilestone,
      );

      const result = await service.findOne('1');

      expect(
        mockPrismaService.spiritualMilestone.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { member: true },
      });
      expect(result).toEqual(mockMilestone);
    });

    it('should throw NotFoundException if milestone not found', async () => {
      mockPrismaService.spiritualMilestone.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByMember', () => {
    it('should return milestones for a specific member', async () => {
      const mockMilestones = [
        { id: '1', type: 'BAPTISM', memberId: 'member-id' },
        { id: '2', type: 'CONFIRMATION', memberId: 'member-id' },
      ];
      mockPrismaService.spiritualMilestone.findMany.mockResolvedValue(
        mockMilestones,
      );

      const result = await service.findByMember('member-id');

      expect(
        mockPrismaService.spiritualMilestone.findMany,
      ).toHaveBeenCalledWith({
        where: { memberId: 'member-id' },
        include: { member: true },
        orderBy: { date: 'desc' },
      });
      expect(result).toEqual(mockMilestones);
    });
  });

  describe('remove', () => {
    it('should delete a spiritual milestone', async () => {
      const mockMilestone = {
        id: '1',
        type: 'BAPTISM',
        member: { firstName: 'John', lastName: 'Doe' },
      };
      mockPrismaService.spiritualMilestone.findUnique.mockResolvedValue(
        mockMilestone,
      );
      mockPrismaService.spiritualMilestone.delete.mockResolvedValue(
        mockMilestone,
      );

      const result = await service.remove('1');

      expect(
        mockPrismaService.spiritualMilestone.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { member: true },
      });
      expect(mockPrismaService.spiritualMilestone.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockAuditLogService.create).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw NotFoundException if milestone not found', async () => {
      mockPrismaService.spiritualMilestone.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
      expect(
        mockPrismaService.spiritualMilestone.delete,
      ).not.toHaveBeenCalled();
    });
  });
});
