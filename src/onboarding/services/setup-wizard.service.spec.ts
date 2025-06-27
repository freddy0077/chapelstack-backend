import { Test, TestingModule } from '@nestjs/testing';
import { SetupWizardService } from './setup-wizard.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NotFoundException } from '@nestjs/common';
import { InitialBranchSetupInput } from '../dto/initial-branch-setup.input';
import { BranchesService } from '../../branches/branches.service';
import { OnboardingService } from './onboarding.service';
import { InitialSettingsInput } from '../dto/initial-settings.input';
import { UsersService } from '../../users/users.service';
import { SettingsService } from '../../settings/settings.service';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  createReadStream: jest.fn(),
  createWriteStream: jest.fn().mockReturnValue({
    write: jest.fn(),
    end: jest.fn(),
  }),
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    mkdir: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue('mock file content'),
    stat: jest.fn().mockResolvedValue({ isDirectory: () => true }),
    access: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock path module
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  dirname: jest.fn((path) => path.split('/').slice(0, -1).join('/')),
  resolve: jest.fn((...args) => args.join('/')),
}));

// Mock stream/promises
jest.mock('stream/promises', () => ({
  pipeline: jest.fn().mockResolvedValue(undefined),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
}));

describe('SetupWizardService', () => {
  let service: SetupWizardService;
  let prismaService: DeepMockProxy<PrismaService>;
  let branchesService: DeepMockProxy<BranchesService>;
  let settingsService: DeepMockProxy<SettingsService>;
  let usersService: DeepMockProxy<UsersService>;
  let onboardingService: DeepMockProxy<OnboardingService>;

  const mockBranchId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = '123e4567-e89b-12d3-a456-426614174001';

  // Complete branch mock with all required properties
  const mockBranch = {
    id: mockBranchId,
    name: 'Test Branch',
    createdAt: new Date(),
    updatedAt: new Date(),
    address: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    postalCode: '12345',
    country: 'Test Country',
    email: 'test@example.com',
    phoneNumber: '1234567890',
    timezone: 'UTC',
    currency: 'USD',
    website: 'https://example.com',
    establishedAt: new Date(),
    isActive: true,
  };

  const mockUser = {
    id: mockUserId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'admin@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock setting used in tests
  const mockSetting = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    key: 'church.name',
    value: 'Test Church',
    branchId: mockBranchId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Create deep mocks
    const prismaServiceMock = mockDeep<PrismaService>();
    const branchesServiceMock = mockDeep<BranchesService>();
    const settingsServiceMock = mockDeep<SettingsService>();
    const usersServiceMock = mockDeep<UsersService>();
    const onboardingServiceMock = mockDeep<OnboardingService>();

    // Setup mock implementations for Prisma service
    // Use type assertion to overcome TypeScript limitations with jest-mock-extended

    (prismaServiceMock.branch.create as any) = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetupWizardService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: BranchesService, useValue: branchesServiceMock },
        { provide: SettingsService, useValue: settingsServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: OnboardingService, useValue: onboardingServiceMock },
      ],
    }).compile();

    service = module.get<SetupWizardService>(SetupWizardService);
    prismaService = module.get(PrismaService);
    branchesService = module.get(BranchesService);
    settingsService = module.get(SettingsService);
    usersService = module.get(UsersService);
    onboardingService = module.get(OnboardingService);

    // Manually assign the mocks to our service instances

    (settingsService as any).createOrUpdateSetting = createSettingMock;

    (usersService as any).createUser = createUserMock;

    (usersService as any).assignRolesToUser = assignRolesMock;

    (prismaService.branch.create as any) = jest
      .fn()
      .mockResolvedValue(mockBranch);

    (prismaService.branch.findUnique as any) = jest
      .fn()
      .mockResolvedValue(mockBranch);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiateBranchSetup', () => {
    const branchSetupInput: InitialBranchSetupInput = {
      name: 'Test Branch',
      address: '123 Test St',
      city: 'Test City',
      country: 'Test Country',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      timezone: 'UTC',
      currency: 'USD',
    };

    it('should create a new branch with the provided details', async () => {
      // Use arrow function to avoid 'this' binding issues
      const result = await service.initiateBranchSetup(branchSetupInput);

      expect(prismaService.branch.create as any).toHaveBeenCalled();
      expect(result).toEqual(mockBranch);
    });

    it('should throw NotFoundException if branch creation fails', async () => {
      (prismaService.branch.create as any).mockRejectedValueOnce(
        new Error('Database error'),
      );

      // Use arrow function to avoid 'this' binding issues
      await expect(
        service.initiateBranchSetup(branchSetupInput),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('configureInitialSettings', () => {
    const settingsInput: InitialSettingsInput = {
      branchId: mockBranchId,
      churchName: 'Test Church',
      logoUrl: null,
      logo: {
        filename: 'logo.png',
        mimetype: 'image/png',
        encoding: 'utf-8',
        createReadStream: jest.fn(() => ({
          pipe: jest.fn().mockReturnThis(),
          on: jest.fn().mockImplementation(function (event, handler) {
            if (event === 'end') {
              handler();
            }
            return this;
          }),
        })),
      } as any,
    };

    it('should configure initial settings for the branch', async () => {
      // Setup mock for branch findUnique

      (prismaService.branch.findUnique as any).mockResolvedValue(mockBranch);

      // Use arrow function to avoid 'this' binding issues
      const result = await service.configureInitialSettings(settingsInput);

      expect(settingsService.createOrUpdateSetting as any).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw NotFoundException if the branch does not exist', async () => {
      (prismaService.branch.findUnique as any).mockResolvedValue(null);

      // Use arrow function to avoid 'this' binding issues
      await expect(
        service.configureInitialSettings(settingsInput),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSuperAdminUser', () => {
    const superAdminInput = {
      branchId: mockBranchId,
      email: 'admin@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'securePassword123',
    };

    it('should create a super admin user for the branch', async () => {
      // Setup mock for branch findUnique

      (prismaService.branch.findUnique as any).mockResolvedValue(mockBranch);

      // Our mocks are already configured in beforeEach

      const result = await service.createSuperAdminUser(superAdminInput);

      // Check that our mocks were called correctly
      expect(usersService.createUser as any).toHaveBeenCalled();
      expect(usersService.assignRolesToUser as any).toHaveBeenCalled();
      expect(result).toBe(mockUser);
    });

    it('should throw NotFoundException if the branch does not exist', async () => {
      (prismaService.branch.findUnique as any).mockResolvedValue(null);

      // Use arrow function to avoid 'this' binding issues
      await expect(
        service.createSuperAdminUser(superAdminInput),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
