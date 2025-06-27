import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenService } from './children.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateChildInput } from '../dto/create-child.input';
import { UpdateChildInput } from '../dto/update-child.input';
import { ChildFilterInput } from '../dto/child-filter.input';
import { Child } from '../entities/child.entity';

// Define gender constants to match the string values in the database
const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
};

// Mock data
const mockChild: Child = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: new Date('2020-01-01'),
  gender: GENDER.MALE,
  allergies: 'None',
  specialNeeds: null,
  emergencyContactName: '123-456-7890',
  emergencyContactPhone: '123-456-7890',
  photoConsent: true,
  notes: null,
  branchId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
  age: undefined,
  fullName: undefined,
  guardianRelations: [],
  checkInRecords: [],
};

const mockChildren: Child[] = [
  mockChild,
  {
    ...mockChild,
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    gender: GENDER.FEMALE,
  },
];

// Mock PrismaService
const mockPrismaService = {
  child: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  checkInRecord: {
    findMany: jest.fn(),
  },
};

describe('ChildrenService', () => {
  let service: ChildrenService;
  // We'll use this to access the mock methods directly
  let prismaService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChildrenService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ChildrenService>(ChildrenService);
    prismaService = mockPrismaService;

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new child', async () => {
      const createChildInput: CreateChildInput = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2020-01-01'),
        gender: GENDER.MALE,
        allergies: 'None',
        specialNeeds: null,
        emergencyContactName: '123-456-7890',
        emergencyContactPhone: '123-456-7890',
        photoConsent: true,
        notes: null,
        branchId: '1',
      };

      mockPrismaService.child.create.mockResolvedValue(mockChild);

      const result = await service.create(createChildInput);

      expect(result).toEqual(mockChild);
      expect(mockPrismaService.child.create).toHaveBeenCalledWith({
        data: createChildInput,
      });
    });
  });

  describe('findAll', () => {
    it('should return all children when no filter is provided', async () => {
      mockPrismaService.child.findMany.mockResolvedValue(mockChildren);

      const result = await service.findAll();

      expect(result).toEqual(mockChildren);
      expect(mockPrismaService.child.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { lastName: 'asc' },
      });
    });

    it('should filter children by firstName', async () => {
      const filter: ChildFilterInput = { firstName: 'John' };
      mockPrismaService.child.findMany.mockResolvedValue([mockChild]);

      const result = await service.findAll(filter);

      expect(result).toEqual([mockChild]);
      expect(mockPrismaService.child.findMany).toHaveBeenCalledWith({
        where: { firstName: { contains: 'John', mode: 'insensitive' } },
        orderBy: { lastName: 'asc' },
      });
    });

    it('should filter children by dateOfBirth range', async () => {
      const filter: ChildFilterInput = {
        dateOfBirthFrom: new Date('2019-01-01'),
        dateOfBirthTo: new Date('2021-01-01'),
      };
      mockPrismaService.child.findMany.mockResolvedValue(mockChildren);

      const result = await service.findAll(filter);

      expect(result).toEqual(mockChildren);
      expect(mockPrismaService.child.findMany).toHaveBeenCalledWith({
        where: {
          dateOfBirth: {
            gte: filter.dateOfBirthFrom,
            lte: filter.dateOfBirthTo,
          },
        },
        orderBy: { lastName: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a child if found', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);

      const result = await service.findOne('1');

      expect(result).toEqual(mockChild);
      expect(mockPrismaService.child.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          guardianRelations: {
            include: {
              guardian: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if child not found', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.child.findUnique).toHaveBeenCalledWith({
        where: { id: '999' },
        include: {
          guardianRelations: {
            include: {
              guardian: true,
            },
          },
        },
      });
    });
  });

  describe('update', () => {
    it('should update a child if found', async () => {
      const updateChildInput: UpdateChildInput = {
        firstName: 'Johnny',
      };

      const updatedChild = { ...mockChild, firstName: 'Johnny' };

      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);
      mockPrismaService.child.update.mockResolvedValue(updatedChild);

      const result = await service.update('1', updateChildInput);

      expect(result).toEqual(updatedChild);
      expect(mockPrismaService.child.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          guardianRelations: {
            include: {
              guardian: true,
            },
          },
        },
      });
      expect(mockPrismaService.child.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateChildInput,
      });
    });

    it('should throw NotFoundException if child not found during update', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(null);

      await expect(
        service.update('999', { id: '999', firstName: 'Johnny' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.child.findUnique).toHaveBeenCalledWith({
        where: { id: '999' },
        include: {
          guardianRelations: {
            include: {
              guardian: true,
            },
          },
        },
      });
      expect(mockPrismaService.child.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a child if found', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);
      mockPrismaService.child.delete.mockResolvedValue(mockChild);

      const result = await service.remove('1');

      expect(result).toEqual(mockChild);
      expect(mockPrismaService.child.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          guardianRelations: {
            include: {
              guardian: true,
            },
          },
        },
      });
      expect(mockPrismaService.child.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if child not found during delete', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.child.findUnique).toHaveBeenCalledWith({
        where: { id: '999' },
        include: {
          guardianRelations: {
            include: {
              guardian: true,
            },
          },
        },
      });
      expect(mockPrismaService.child.delete).not.toHaveBeenCalled();
    });
  });

  describe('findByGuardian', () => {
    it('should return children for a specific guardian', async () => {
      mockPrismaService.child.findMany.mockResolvedValue(mockChildren);

      const result = await service.findByGuardian('guardian1');

      expect(result).toEqual(mockChildren);
      expect(mockPrismaService.child.findMany).toHaveBeenCalledWith({
        where: {
          guardianRelations: {
            some: {
              guardianId: 'guardian1',
            },
          },
        },
        orderBy: { lastName: 'asc' },
      });
    });
  });

  describe('getRecentCheckIns', () => {
    it('should return recent check-ins for a child', async () => {
      const mockCheckIns = [
        { id: '1', childId: '1', checkedInAt: new Date() },
        { id: '2', childId: '1', checkedInAt: new Date() },
      ];

      mockPrismaService.checkInRecord.findMany.mockResolvedValue(mockCheckIns);

      const result = await service.getRecentCheckIns('1');

      expect(result).toEqual(mockCheckIns);
      expect(mockPrismaService.checkInRecord.findMany).toHaveBeenCalledWith({
        where: { childId: '1' },
        orderBy: { checkedInAt: 'desc' },
        take: 5,
        include: {
          event: true,
          checkedInBy: true,
          checkedOutBy: true,
        },
      });
    });

    it('should respect the limit parameter', async () => {
      const mockCheckIns = [{ id: '1', childId: '1', checkedInAt: new Date() }];

      mockPrismaService.checkInRecord.findMany.mockResolvedValue(mockCheckIns);

      const result = await service.getRecentCheckIns('1', 1);

      expect(result).toEqual(mockCheckIns);
      expect(mockPrismaService.checkInRecord.findMany).toHaveBeenCalledWith({
        where: { childId: '1' },
        orderBy: { checkedInAt: 'desc' },
        take: 1,
        include: {
          event: true,
          checkedInBy: true,
          checkedOutBy: true,
        },
      });
    });
  });
});
