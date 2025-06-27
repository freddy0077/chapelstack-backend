import { Test, TestingModule } from '@nestjs/testing';
import { BranchesService } from './branches.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchInput } from './dto/create-branch.input';
import { Branch as PrismaBranchType } from '../../generated/prisma'; // Using an alias to avoid confusion
import { NotFoundException } from '@nestjs/common';

// Mock PrismaService
const mockPrismaService = {
  branch: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(), // Added for findAll
  },
  branchSetting: {
    findMany: jest.fn(),
    upsert: jest.fn(),
  },
  $transaction: jest.fn(async (prismaOperations) =>
    Promise.all(prismaOperations),
  ),
};

describe('BranchesService', () => {
  let service: BranchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BranchesService>(BranchesService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new branch and return it transformed', async () => {
      const createBranchInput: CreateBranchInput = {
        name: 'Test Branch',
        address: '123 Main St',
        city: undefined, // Input DTO expects string or undefined
        state: undefined,
      };

      // This is what Prisma would return from the database
      const mockPrismaBranch: PrismaBranchType = {
        id: 'some-uuid',
        name: 'Test Branch',
        address: '123 Main St',
        city: null,
        state: null,
        postalCode: null,
        country: null,
        phoneNumber: null,
        email: null,
        website: null,
        isActive: true,
        establishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.branch.create.mockResolvedValue(mockPrismaBranch);

      const result = await service.create(createBranchInput);

      expect(mockPrismaService.branch.create).toHaveBeenCalledWith({
        data: {
          // This is what's passed to Prisma create
          name: 'Test Branch',
          address: '123 Main St',
          city: undefined, // Matches createBranchInput.city
          state: undefined, // Service passes input as is to Prisma
        },
      });
      // This is the GraphQL Branch object returned by the service
      expect(result.id).toEqual(mockPrismaBranch.id);
      expect(result.name).toEqual(mockPrismaBranch.name);
      expect(result.address).toEqual(mockPrismaBranch.address);
      expect(result.city).toBeUndefined(); // Transformed from null
      expect(result.state).toBeUndefined(); // Transformed from null
    });
  });

  describe('findOne', () => {
    it('should find a branch by ID and return it transformed', async () => {
      const branchId = 'some-uuid';
      const mockPrismaBranch: PrismaBranchType = {
        id: branchId,
        name: 'Found Branch',
        address: null,
        city: 'Test City',
        state: null,
        postalCode: '12345',
        country: null,
        phoneNumber: '555-1234',
        email: null,
        website: 'http://example.com',
        isActive: true,
        establishedAt: new Date('2020-01-01T00:00:00.000Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.branch.findUnique.mockResolvedValue(mockPrismaBranch);

      const result = await service.findOne(branchId);

      expect(mockPrismaService.branch.findUnique).toHaveBeenCalledWith({
        where: { id: branchId },
      });
      expect(result.id).toEqual(branchId);
      expect(result.name).toEqual('Found Branch');
      expect(result.address).toBeUndefined(); // Transformed from null
      expect(result.city).toEqual('Test City');
      expect(result.postalCode).toEqual('12345');
      expect(result.website).toEqual('http://example.com');
      expect(result.establishedAt).toEqual(
        new Date('2020-01-01T00:00:00.000Z'),
      );
    });

    it('should throw NotFoundException if branch is not found', async () => {
      const branchId = 'non-existent-uuid';
      mockPrismaService.branch.findUnique.mockResolvedValue(null);

      await expect(service.findOne(branchId)).rejects.toThrow(
        new NotFoundException(`Branch with ID ${branchId} not found`),
      );
      expect(mockPrismaService.branch.findUnique).toHaveBeenCalledWith({
        where: { id: branchId },
      });
    });
  });

  describe('findAll', () => {
    const paginationInputDefault = { skip: 0, take: 10 };

    const mockPrismaBranch1: PrismaBranchType = {
      id: 'uuid-1',
      name: 'Alpha Church',
      address: null, // To test null to undefined transformation
      city: 'Alphaville',
      state: 'AS',
      postalCode: '11111',
      country: 'AC',
      phoneNumber: '111-1111',
      email: 'alpha@church.com',
      website: null, // To test null to undefined transformation
      isActive: true,
      establishedAt: new Date('2000-01-01T00:00:00.000Z'),
      createdAt: new Date('2023-01-01T10:00:00.000Z'),
      updatedAt: new Date('2023-01-01T10:00:00.000Z'),
    };

    const mockPrismaBranch2: PrismaBranchType = {
      id: 'uuid-2',
      name: 'Beta Chapel',
      address: '2 Beta Road',
      city: 'Betatown',
      state: 'BS',
      postalCode: '22222',
      country: 'BC',
      phoneNumber: '222-2222',
      email: 'beta@chapel.com',
      website: 'beta.chapel',
      isActive: false,
      establishedAt: new Date('2010-01-01T00:00:00.000Z'),
      createdAt: new Date('2023-01-02T10:00:00.000Z'),
      updatedAt: new Date('2023-01-02T10:00:00.000Z'),
    };

    const mockPrismaBranch3: PrismaBranchType = {
      id: 'uuid-3',
      name: 'Gamma Cathedral',
      address: '3 Gamma Street',
      city: 'Gammacity',
      state: 'GS',
      postalCode: '33333',
      country: 'GC',
      phoneNumber: '333-3333',
      email: 'gamma@cathedral.com',
      website: 'gamma.cathedral',
      isActive: true,
      establishedAt: new Date('2020-01-01T00:00:00.000Z'),
      createdAt: new Date('2023-01-03T10:00:00.000Z'),
      updatedAt: new Date('2023-01-03T10:00:00.000Z'),
    };

    const allMockBranches = [
      mockPrismaBranch3,
      mockPrismaBranch2,
      mockPrismaBranch1,
    ]; // Ordered by createdAt desc by default

    it('should return paginated branches with default pagination, no filters, and hasNextPage = true', async () => {
      mockPrismaService.branch.findMany.mockImplementation(() => [
        mockPrismaBranch3,
        mockPrismaBranch2,
      ]); // Explicitly 2 items
      mockPrismaService.branch.count.mockImplementation(
        () => allMockBranches.length,
      ); // Total 3

      const result = await service.findAll(paginationInputDefault, undefined);

      expect(mockPrismaService.branch.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaService.branch.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(result.items.length).toBe(2);
      expect(result.items[0].name).toBe(mockPrismaBranch3.name);
      expect(result.items[1].name).toBe(mockPrismaBranch2.name);
      expect(result.totalCount).toBe(3);
      expect(result.hasNextPage).toBe(true); // 0 + 2 < 3

      // Test transformation for the first item (mockPrismaBranch1 equivalent, but here it's mockPrismaBranch3)
      expect(result.items[0].address).toEqual(mockPrismaBranch3.address); // address is not null for branch3
      expect(result.items[0].website).toEqual(mockPrismaBranch3.website);
    });

    it('should return paginated branches with hasNextPage = false', async () => {
      mockPrismaService.branch.findMany.mockResolvedValue(allMockBranches);
      mockPrismaService.branch.count.mockResolvedValue(allMockBranches.length);

      const result = await service.findAll(paginationInputDefault, undefined);
      expect(result.items.length).toBe(3);
      expect(result.totalCount).toBe(3);
      expect(result.hasNextPage).toBe(false); // 0 + 3 < 3 is false
    });

    it('should filter by nameContains', async () => {
      const filterInput = { nameContains: 'Alpha' };
      const filteredBranches = [mockPrismaBranch1];
      mockPrismaService.branch.findMany.mockResolvedValue(filteredBranches);
      mockPrismaService.branch.count.mockResolvedValue(filteredBranches.length);

      const result = await service.findAll(paginationInputDefault, filterInput);

      const expectedWhere = {
        name: { contains: 'Alpha', mode: 'insensitive' },
      };
      expect(mockPrismaService.branch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        }),
      );
      expect(mockPrismaService.branch.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(result.items.length).toBe(1);
      expect(result.items[0].name).toBe(mockPrismaBranch1.name);
      expect(result.items[0].address).toBeUndefined(); // mockPrismaBranch1.address is null
      expect(result.items[0].website).toBeUndefined(); // mockPrismaBranch1.website is null
      expect(result.totalCount).toBe(1);
      expect(result.hasNextPage).toBe(false);
    });

    it('should filter by isActive status', async () => {
      const filterInput = { isActive: false };
      const filteredBranches = [mockPrismaBranch2];
      mockPrismaService.branch.findMany.mockResolvedValue(filteredBranches);
      mockPrismaService.branch.count.mockResolvedValue(filteredBranches.length);

      const result = await service.findAll(paginationInputDefault, filterInput);

      const expectedWhere = { isActive: false };
      expect(mockPrismaService.branch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        }),
      );
      expect(mockPrismaService.branch.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(result.items.length).toBe(1);
      expect(result.items[0].name).toBe(mockPrismaBranch2.name);
      expect(result.totalCount).toBe(1);
    });

    it('should use custom pagination (skip and take)', async () => {
      const pagination = { skip: 1, take: 1 };
      // Assuming default order (createdAt: desc), newest is mockPrismaBranch3.
      // Skipping 1, taking 1 should yield mockPrismaBranch2.
      const paginatedBranches = [mockPrismaBranch2];
      mockPrismaService.branch.findMany.mockResolvedValue(paginatedBranches);
      mockPrismaService.branch.count.mockResolvedValue(allMockBranches.length);

      const result = await service.findAll(pagination, undefined);

      expect(mockPrismaService.branch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          take: 1,
        }),
      );
      expect(result.items.length).toBe(1);
      expect(result.items[0].name).toBe(mockPrismaBranch2.name);
      expect(result.totalCount).toBe(3);
      expect(result.hasNextPage).toBe(true); // 1 + 1 < 3
    });

    it('should return empty items and hasNextPage=false when no branches match filters', async () => {
      const filterInput = { nameContains: 'NonExistentName' };
      mockPrismaService.branch.findMany.mockResolvedValue([]);
      mockPrismaService.branch.count.mockResolvedValue(0);

      const result = await service.findAll(paginationInputDefault, filterInput);

      const expectedWhere = {
        name: { contains: 'NonExistentName', mode: 'insensitive' },
      };
      expect(mockPrismaService.branch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        }),
      );
      expect(mockPrismaService.branch.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(result.items.length).toBe(0);
      expect(result.totalCount).toBe(0);
      expect(result.hasNextPage).toBe(false);
    });
  });
});
