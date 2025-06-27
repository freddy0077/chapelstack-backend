import { Test, TestingModule } from '@nestjs/testing';
import { FamiliesService } from './families.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateFamilyInput } from '../dto/create-family.input';
import { CreateFamilyRelationshipInput } from '../dto/create-family-relationship.input';
import { FamilyRelationshipType } from '../entities/family.entity';

describe('FamiliesService', () => {
  let service: FamiliesService;
  let prismaService: PrismaService;
  let auditLogService: AuditLogService;

  const mockPrismaService = {
    family: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    familyRelationship: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
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
        FamiliesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<FamiliesService>(FamiliesService);
    prismaService = module.get<PrismaService>(PrismaService);
    auditLogService = module.get<AuditLogService>(AuditLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFamily', () => {
    const createFamilyInput: CreateFamilyInput = {
      name: 'Doe Family',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
      phoneNumber: '555-123-4567',
      customFields: { notes: 'Active church members' },
      memberIds: ['member-1', 'member-2'],
    };

    const mockFamily = {
      id: 'family-id',
      name: 'Doe Family',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
      phoneNumber: '555-123-4567',
      customFields: { notes: 'Active church members' },
      members: [
        { id: 'member-1', firstName: 'John', lastName: 'Doe' },
        { id: 'member-2', firstName: 'Jane', lastName: 'Doe' },
      ],
    };

    it('should create a family', async () => {
      mockPrismaService.family.create.mockResolvedValue(mockFamily);

      const result = await service.createFamily(createFamilyInput);

      expect(mockPrismaService.family.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Doe Family',
          address: '123 Main St',
          members: {
            connect: [{ id: 'member-1' }, { id: 'member-2' }],
          },
        }),
        include: {
          members: true,
        },
      });
      expect(mockAuditLogService.create).toHaveBeenCalled();
      expect(result).toEqual(mockFamily);
    });
  });

  describe('findAllFamilies', () => {
    it('should return an array of families', async () => {
      const mockFamilies = [
        { id: '1', name: 'Doe Family' },
        { id: '2', name: 'Smith Family' },
      ];
      mockPrismaService.family.findMany.mockResolvedValue(mockFamilies);

      const result = await service.findAllFamilies();

      expect(mockPrismaService.family.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockFamilies);
    });
  });

  describe('findFamilyById', () => {
    it('should return a single family', async () => {
      const mockFamily = { id: '1', name: 'Doe Family' };
      mockPrismaService.family.findUnique.mockResolvedValue(mockFamily);

      const result = await service.findFamilyById('1');

      expect(mockPrismaService.family.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { members: true },
      });
      expect(result).toEqual(mockFamily);
    });

    it('should throw NotFoundException if family not found', async () => {
      mockPrismaService.family.findUnique.mockResolvedValue(null);

      await expect(service.findFamilyById('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addMemberToFamily', () => {
    const mockFamily = { id: 'family-id', name: 'Doe Family' };
    const mockMember = { id: 'member-id', firstName: 'John', lastName: 'Doe' };
    const mockUpdatedFamily = {
      ...mockFamily,
      members: [mockMember],
    };

    it('should add a member to a family', async () => {
      mockPrismaService.family.findUnique.mockResolvedValue(mockFamily);
      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.family.update.mockResolvedValue(mockUpdatedFamily);

      const result = await service.addMemberToFamily('family-id', 'member-id');

      expect(mockPrismaService.family.findUnique).toHaveBeenCalledWith({
        where: { id: 'family-id' },
      });
      expect(mockPrismaService.member.findUnique).toHaveBeenCalledWith({
        where: { id: 'member-id' },
      });
      expect(mockPrismaService.family.update).toHaveBeenCalledWith({
        where: { id: 'family-id' },
        data: {
          members: {
            connect: { id: 'member-id' },
          },
        },
        include: {
          members: true,
        },
      });
      expect(mockAuditLogService.create).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedFamily);
    });

    it('should throw NotFoundException if family not found', async () => {
      mockPrismaService.family.findUnique.mockResolvedValue(null);

      await expect(
        service.addMemberToFamily('family-id', 'member-id'),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.family.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.family.findUnique.mockResolvedValue(mockFamily);
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(
        service.addMemberToFamily('family-id', 'member-id'),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.family.update).not.toHaveBeenCalled();
    });
  });

  describe('createFamilyRelationship', () => {
    const createRelationshipInput: CreateFamilyRelationshipInput = {
      memberId: 'member-1',
      relatedMemberId: 'member-2',
      relationshipType: FamilyRelationshipType.SPOUSE,
      familyId: 'family-id',
    };

    const mockMember1 = { id: 'member-1', firstName: 'John', lastName: 'Doe' };
    const mockMember2 = { id: 'member-2', firstName: 'Jane', lastName: 'Doe' };
    const mockFamily = { id: 'family-id', name: 'Doe Family' };
    const mockRelationship = {
      id: 'relationship-id',
      memberId: 'member-1',
      relatedMemberId: 'member-2',
      relationshipType: 'SPOUSE',
      familyId: 'family-id',
      member: mockMember1,
      relatedMember: mockMember2,
      family: mockFamily,
    };

    it('should create a family relationship', async () => {
      mockPrismaService.member.findUnique.mockImplementation((args) => {
        if (args.where.id === 'member-1') return Promise.resolve(mockMember1);
        if (args.where.id === 'member-2') return Promise.resolve(mockMember2);
        return Promise.resolve(null);
      });
      mockPrismaService.family.findUnique.mockResolvedValue(mockFamily);
      mockPrismaService.familyRelationship.findFirst.mockResolvedValue(null);
      mockPrismaService.familyRelationship.create.mockResolvedValue(
        mockRelationship,
      );

      const result = await service.createFamilyRelationship(
        createRelationshipInput,
      );

      expect(mockPrismaService.member.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.family.findUnique).toHaveBeenCalledWith({
        where: { id: 'family-id' },
      });
      expect(mockPrismaService.familyRelationship.findFirst).toHaveBeenCalled();
      expect(mockPrismaService.familyRelationship.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          memberId: 'member-1',
          relatedMemberId: 'member-2',
          relationshipType: 'SPOUSE',
          familyId: 'family-id',
        }),
        include: {
          member: true,
          relatedMember: true,
          family: true,
        },
      });
      expect(mockAuditLogService.create).toHaveBeenCalled();
      expect(result).toEqual(mockRelationship);
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(
        service.createFamilyRelationship(createRelationshipInput),
      ).rejects.toThrow(NotFoundException);
      expect(
        mockPrismaService.familyRelationship.create,
      ).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if relationship already exists', async () => {
      mockPrismaService.member.findUnique.mockImplementation((args) => {
        if (args.where.id === 'member-1') return Promise.resolve(mockMember1);
        if (args.where.id === 'member-2') return Promise.resolve(mockMember2);
        return Promise.resolve(null);
      });
      mockPrismaService.family.findUnique.mockResolvedValue(mockFamily);
      mockPrismaService.familyRelationship.findFirst.mockResolvedValue({
        id: 'existing-relationship',
      });

      await expect(
        service.createFamilyRelationship(createRelationshipInput),
      ).rejects.toThrow(ConflictException);
      expect(
        mockPrismaService.familyRelationship.create,
      ).not.toHaveBeenCalled();
    });
  });

  describe('removeFamilyRelationship', () => {
    const mockRelationship = {
      id: 'relationship-id',
      memberId: 'member-1',
      relatedMemberId: 'member-2',
      relationshipType: 'SPOUSE',
      member: { firstName: 'John', lastName: 'Doe' },
      relatedMember: { firstName: 'Jane', lastName: 'Doe' },
    };

    const mockReciprocalRelationship = {
      id: 'reciprocal-id',
      memberId: 'member-2',
      relatedMemberId: 'member-1',
      relationshipType: 'SPOUSE',
    };

    it('should remove a family relationship and its reciprocal', async () => {
      mockPrismaService.familyRelationship.findUnique.mockResolvedValue(
        mockRelationship,
      );
      mockPrismaService.familyRelationship.findFirst.mockResolvedValue(
        mockReciprocalRelationship,
      );
      mockPrismaService.familyRelationship.delete.mockResolvedValue(
        mockRelationship,
      );

      const result = await service.removeFamilyRelationship('relationship-id');

      expect(
        mockPrismaService.familyRelationship.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: 'relationship-id' },
        include: {
          member: true,
          relatedMember: true,
        },
      });
      expect(
        mockPrismaService.familyRelationship.findFirst,
      ).toHaveBeenCalledWith({
        where: {
          memberId: 'member-2',
          relatedMemberId: 'member-1',
        },
      });
      expect(mockPrismaService.familyRelationship.delete).toHaveBeenCalledTimes(
        2,
      );
      expect(mockPrismaService.member.update).toHaveBeenCalledTimes(2);
      expect(mockAuditLogService.create).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw NotFoundException if relationship not found', async () => {
      mockPrismaService.familyRelationship.findUnique.mockResolvedValue(null);

      await expect(
        service.removeFamilyRelationship('relationship-id'),
      ).rejects.toThrow(NotFoundException);
      expect(
        mockPrismaService.familyRelationship.delete,
      ).not.toHaveBeenCalled();
    });
  });
});
