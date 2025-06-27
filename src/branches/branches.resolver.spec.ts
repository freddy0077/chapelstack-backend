import { Test, TestingModule } from '@nestjs/testing';
import { BranchesResolver } from './branches.resolver';
import { BranchesService } from './branches.service';
import { CreateBranchInput } from './dto/create-branch.input';
import { Branch } from './entities/branch.entity';
// Mock BranchesService
const mockBranchesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findBranchSettings: jest.fn(),
  updateBranchSetting: jest.fn(),
};

describe('BranchesResolver', () => {
  let resolver: BranchesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesResolver,
        {
          provide: BranchesService,
          useValue: mockBranchesService,
        },
      ],
    }).compile();

    resolver = module.get<BranchesResolver>(BranchesResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createBranch', () => {
    it('should call branchesService.create and return the created branch', async () => {
      const createBranchInput: CreateBranchInput = {
        name: 'New Test Branch',
        address: '456 Oak Ave',
      };
      const expectedBranch: Branch = {
        id: 'new-uuid',
        name: 'New Test Branch',
        address: '456 Oak Ave',
        city: undefined,
        state: undefined,
        postalCode: undefined,
        country: undefined,
        phoneNumber: undefined,
        email: undefined,
        website: undefined,
        isActive: true,
        establishedAt: undefined,
        settings: [], // Assuming settings are resolved separately or empty by default
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBranchesService.create.mockResolvedValue(expectedBranch);

      const result = await resolver.createBranch(createBranchInput);
      expect(mockBranchesService.create).toHaveBeenCalledWith(
        createBranchInput,
      );
      expect(result).toEqual(expectedBranch);
    });
  });

  describe('branch (findOne)', () => {
    it('should call branchesService.findOne and return the branch if found', async () => {
      const branchId = 'find-uuid';
      const expectedBranch: Branch = {
        id: branchId,
        name: 'Found Test Branch',
        address: '789 Pine St',
        city: 'Testville',
        state: undefined,
        postalCode: undefined,
        country: undefined,
        phoneNumber: undefined,
        email: undefined,
        website: undefined,
        isActive: true,
        establishedAt: undefined,
        settings: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBranchesService.findOne.mockResolvedValue(expectedBranch);

      const result = await resolver.findOne(branchId);
      expect(mockBranchesService.findOne).toHaveBeenCalledWith(branchId);
      expect(result).toEqual(expectedBranch);
    });

    it('should return null if branchesService.findOne returns null (as per GraphQL nullable type)', async () => {
      const branchId = 'not-found-uuid';
      // The service's findOne method is expected to return Branch | null
      // For a nullable GraphQL query, if the service returns null (e.g., after handling NotFoundException or simply not finding),
      // the resolver should pass this null through.
      mockBranchesService.findOne.mockResolvedValue(null);

      const result = await resolver.findOne(branchId);
      expect(mockBranchesService.findOne).toHaveBeenCalledWith(branchId);
      expect(result).toBeNull();
    });
  });
});
