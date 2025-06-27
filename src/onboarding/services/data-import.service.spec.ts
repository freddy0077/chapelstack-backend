import { Test, TestingModule } from '@nestjs/testing';
import { DataImportService } from './data-import.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OnboardingService } from './onboarding.service';
import { FileUpload } from 'graphql-upload';
import { mockDeep, MockProxy } from 'jest-mock-extended';

// Mock the fs module
jest.mock('fs', () => ({
  createWriteStream: jest.fn().mockReturnValue({
    write: jest.fn(),
    end: jest.fn(),
  }),
  createReadStream: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    access: jest.fn().mockResolvedValue(undefined),
    mkdir: jest.fn().mockResolvedValue(undefined),
  },
}));

// This is necessary to mock fs modules properly
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      // Add any prisma client methods you need to mock here
    })),
  };
});

jest.mock('csv-parser', () =>
  jest.fn().mockReturnValue({
    on: jest.fn().mockImplementation(function (event, callback) {
      if (event === 'data') {
        // Simulate some data
        callback({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        });
        callback({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
        });
      }
      if (event === 'end') {
        callback();
      }
      return this;
    }),
  }),
);

describe('DataImportService', () => {
  let service: DataImportService;
  let prismaService: MockProxy<PrismaService>;
  let onboardingService: MockProxy<OnboardingService>;

  const mockBranchId = '123e4567-e89b-12d3-a456-426614174000';
  const mockFileUpload: FileUpload = {
    filename: 'test.csv',
    mimetype: 'text/csv',
    encoding: '7bit',
    createReadStream: jest.fn().mockReturnValue(createReadStream('test.csv')),
  };

  beforeEach(async () => {
    prismaService = mockDeep<PrismaService>();
    onboardingService = mockDeep<OnboardingService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataImportService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: OnboardingService,
          useValue: onboardingService,
        },
      ],
    }).compile();

    service = module.get<DataImportService>(DataImportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateMemberImportTemplate', () => {
    it('should generate a member import template file', async () => {
      const mockPath = '/templates/member_import_template.csv';
      jest
        .spyOn(service as any, 'generateCsvTemplate')
        .mockResolvedValue(mockPath);

      const result = await service.generateMemberImportTemplate();

      expect(result).toBe(mockPath);
    });
  });

  describe('generateFundsImportTemplate', () => {
    it('should generate a funds import template file', async () => {
      const mockPath = '/templates/funds_import_template.csv';
      jest
        .spyOn(service as any, 'generateCsvTemplate')
        .mockResolvedValue(mockPath);

      const result = await service.generateFundsImportTemplate();

      expect(result).toBe(mockPath);
    });
  });

  describe('importMembers', () => {
    it('should import members from CSV file', async () => {
      // Mock the member creation
      prismaService.member.create.mockResolvedValueOnce({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      } as any);

      prismaService.member.create.mockResolvedValueOnce({
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      } as any);

      // Mock completing the onboarding step
      onboardingService.completeOnboardingStep.mockResolvedValue(null);

      const result = await service.importMembers(mockFileUpload, mockBranchId);

      expect(result).toMatchObject({
        success: true,
        totalRecords: 2,
        importedRecords: 2,
      });
      expect(prismaService.member.create).toHaveBeenCalledTimes(2);
      expect(onboardingService.completeOnboardingStep).toHaveBeenCalledWith({
        branchId: mockBranchId,
        stepKey: 'MEMBER_IMPORT',
      });
    });

    it('should handle errors during member import', async () => {
      // Mock an error on the first member creation
      prismaService.member.create.mockRejectedValueOnce(
        new Error('Duplicate email'),
      );

      // Mock success on the second member
      prismaService.member.create.mockResolvedValueOnce({
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      } as any);

      const result = await service.importMembers(mockFileUpload, mockBranchId);

      expect(result).toMatchObject({
        success: true,
        totalRecords: 2,
        importedRecords: 1,
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('Error'),
          }),
        ]),
      });
    });
  });

  describe('importFinancialData', () => {
    it('should import funds data', async () => {
      // Define a simple mapping
      const mapping = {
        name: 'name',
        description: 'description',
      };

      // Mock fund creation
      prismaService.fund.create.mockResolvedValue({
        id: '1',
        name: 'General Fund',
        description: 'Main church fund',
      } as any);

      const result = await service.importFinancialData(
        mockBranchId,
        mockFileUpload,
        mapping,
        'funds',
      );

      expect(result).toMatchObject({
        success: true,
        totalRecords: 2,
        importedRecords: expect.any(Number),
      });
    });

    it('should handle unsupported financial data type', async () => {
      await expect(
        service.importFinancialData(
          mockBranchId,
          mockFileUpload,
          {},
          'unsupported' as any,
        ),
      ).rejects.toThrow('Unsupported financial data type');
    });
  });
});
