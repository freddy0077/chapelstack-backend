import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingResolver } from './onboarding.resolver';
import { OnboardingService } from '../services/onboarding.service';
import { SetupWizardService } from '../services/setup-wizard.service';
import { DataImportService } from '../services/data-import.service';
import {
  OnboardingStep,
  OnboardingProgress,
} from '../entities/onboarding-progress.entity';
import { CompleteOnboardingStepInput } from '../dto/complete-onboarding-step.input';
import { InitialBranchSetupInput } from '../dto/initial-branch-setup.input';
import { InitialSettingsInput } from '../dto/initial-settings.input';
import { mockDeep, MockProxy } from 'jest-mock-extended';
import { FileUpload } from 'graphql-upload';

describe('OnboardingResolver', () => {
  let resolver: OnboardingResolver;
  let onboardingService: MockProxy<OnboardingService>;
  let setupWizardService: MockProxy<SetupWizardService>;
  let dataImportService: MockProxy<DataImportService>;

  const mockBranchId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = '123e4567-e89b-12d3-a456-426614174001';

  const mockProgress: OnboardingProgress = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    branchId: mockBranchId,
    completedSteps: [OnboardingStep.WELCOME],
    currentStep: OnboardingStep.ADMIN_SETUP,
    isCompleted: false,
    importedMembers: false,
    importedFinances: false,
    startedAt: new Date(),
    completedAt: null,
    lastUpdatedAt: new Date(),
  };

  const mockUser = {
    id: mockUserId,
    email: 'user@example.com',
  };

  beforeEach(async () => {
    onboardingService = mockDeep<OnboardingService>();
    setupWizardService = mockDeep<SetupWizardService>();
    dataImportService = mockDeep<DataImportService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingResolver,
        {
          provide: OnboardingService,
          useValue: onboardingService,
        },
        {
          provide: SetupWizardService,
          useValue: setupWizardService,
        },
        {
          provide: DataImportService,
          useValue: dataImportService,
        },
      ],
    }).compile();

    resolver = module.get<OnboardingResolver>(OnboardingResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('onboardingProgress', () => {
    it('should return onboarding progress for a branch', async () => {
      onboardingService.getOnboardingProgress.mockResolvedValue(mockProgress);

      const result = await resolver.onboardingProgress(mockBranchId);

      expect(result).toEqual(mockProgress);
      expect(onboardingService.getOnboardingProgress).toHaveBeenCalledWith(
        mockBranchId,
      );
    });
  });

  describe('initializeOnboarding', () => {
    it('should initialize onboarding for a branch', async () => {
      onboardingService.initializeOnboarding.mockResolvedValue(mockProgress);

      const result = await resolver.initializeOnboarding(mockBranchId);

      expect(result).toEqual(mockProgress);
      expect(onboardingService.initializeOnboarding).toHaveBeenCalledWith(
        mockBranchId,
      );
    });
  });

  describe('completeOnboardingStep', () => {
    it('should mark an onboarding step as completed', async () => {
      const input: CompleteOnboardingStepInput = {
        branchId: mockBranchId,
        stepKey: OnboardingStep.ADMIN_SETUP,
      };

      const updatedProgress = {
        ...mockProgress,
        completedSteps: [
          ...mockProgress.completedSteps,
          OnboardingStep.ADMIN_SETUP,
        ],
        currentStep: OnboardingStep.ORGANIZATION_DETAILS,
      };

      onboardingService.completeOnboardingStep.mockResolvedValue(
        updatedProgress,
      );

      const result = await resolver.completeOnboardingStep(input);

      expect(result).toEqual(updatedProgress);
      expect(onboardingService.completeOnboardingStep).toHaveBeenCalledWith(
        input,
      );
    });
  });

  describe('resetOnboarding', () => {
    it('should reset onboarding progress', async () => {
      const resetProgress = {
        ...mockProgress,
        completedSteps: [],
        currentStep: OnboardingStep.WELCOME,
      };

      onboardingService.resetOnboarding.mockResolvedValue(resetProgress);

      const result = await resolver.resetOnboarding(mockBranchId);

      expect(result).toEqual(resetProgress);
      expect(onboardingService.resetOnboarding).toHaveBeenCalledWith(
        mockBranchId,
      );
    });
  });

  describe('initiateBranchSetup', () => {
    it('should set up a new branch', async () => {
      const input: InitialBranchSetupInput = {
        name: 'Test Branch',
        address: '123 Church St',
        city: 'Test City',
        country: 'Test Country',
        email: 'test@church.com',
        phoneNumber: '1234567890',
        timezone: 'UTC',
        currency: 'USD',
      };

      setupWizardService.initiateBranchSetup.mockResolvedValue({
        id: mockBranchId,
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await resolver.initiateBranchSetup(input, mockUser);

      expect(result).toEqual(mockBranchId);
      expect(setupWizardService.initiateBranchSetup).toHaveBeenCalledWith(
        input,
      );
    });
  });

  describe('configureInitialSettings', () => {
    it('should configure initial settings', async () => {
      const input: InitialSettingsInput = {
        organizationName: 'Test Church',
        organizationDescription: 'A church for testing',
        primaryColor: '#FF0000',
        secondaryColor: '#00FF00',
        websiteUrl: 'https://test.church',
      };

      setupWizardService.configureInitialSettings.mockResolvedValue(true);

      const result = await resolver.configureInitialSettings(
        mockBranchId,
        input,
      );

      expect(result).toBe(true);
      expect(setupWizardService.configureInitialSettings).toHaveBeenCalledWith(
        mockBranchId,
        input,
      );
    });
  });

  describe('createSuperAdminUser', () => {
    it('should create a super admin user', async () => {
      const email = 'admin@test.church';
      const password = 'password123';
      const firstName = 'Super';
      const lastName = 'Admin';

      setupWizardService.createSuperAdminUser.mockResolvedValue({
        id: mockUserId,
        email,
        firstName,
        lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await resolver.createSuperAdminUser(
        email,
        password,
        firstName,
        lastName,
        mockBranchId,
      );

      expect(result).toEqual(mockUserId);
      expect(setupWizardService.createSuperAdminUser).toHaveBeenCalledWith(
        email,
        password,
        firstName,
        lastName,
        mockBranchId,
      );
    });
  });

  describe('importMemberData', () => {
    it('should import member data from CSV', async () => {
      const mockFile = {
        filename: 'members.csv',
        mimetype: 'text/csv',
        encoding: '7bit',
        createReadStream: jest.fn(),
      } as FileUpload;

      const mockMapping = '{"firstName":"First Name","lastName":"Last Name"}';

      const mockResult = {
        success: true,
        totalRecords: 10,
        importedRecords: 8,
        errors: [
          { row: 3, column: 'email', message: 'Invalid email format' },
          { row: 7, column: 'phoneNumber', message: 'Invalid phone number' },
        ],
        message: 'Import completed with 2 errors',
      };

      dataImportService.importMembers.mockResolvedValue(mockResult);

      const result = await resolver.importMemberData(
        mockBranchId,
        mockFile,
        mockMapping,
      );

      expect(result).toEqual(mockResult);
      expect(dataImportService.importMembers).toHaveBeenCalledWith(
        mockFile,
        mockBranchId,
      );
    });
  });

  describe('importFinancialData', () => {
    it('should import financial data from CSV', async () => {
      const mockFile = {
        filename: 'funds.csv',
        mimetype: 'text/csv',
        encoding: '7bit',
        createReadStream: jest.fn(),
      } as FileUpload;

      const mockMapping =
        '{"name":"Fund Name","description":"Fund Description"}';
      const type = 'funds';

      const mockResult = {
        success: true,
        totalRecords: 5,
        importedRecords: 5,
        errors: [],
        message: 'Import completed successfully',
      };

      dataImportService.importFinancialData.mockResolvedValue(mockResult);

      const result = await resolver.importFinancialData(
        mockBranchId,
        mockFile,
        mockMapping,
        type,
      );

      expect(result).toEqual(mockResult);
      expect(dataImportService.importFinancialData).toHaveBeenCalledWith(
        mockBranchId,
        mockFile,
        JSON.parse(mockMapping),
        type,
      );
    });
  });

  describe('generateMemberImportTemplate', () => {
    it('should generate a member import template', async () => {
      const templatePath = '/path/to/template.csv';

      dataImportService.generateMemberImportTemplate.mockResolvedValue(
        templatePath,
      );

      const result = await resolver.generateMemberImportTemplate();

      expect(result).toEqual(templatePath);
      expect(dataImportService.generateMemberImportTemplate).toHaveBeenCalled();
    });
  });

  describe('generateFundsImportTemplate', () => {
    it('should generate a funds import template', async () => {
      const templatePath = '/path/to/template.csv';

      dataImportService.generateFundsImportTemplate.mockResolvedValue(
        templatePath,
      );

      const result = await resolver.generateFundsImportTemplate();

      expect(result).toEqual(templatePath);
      expect(dataImportService.generateFundsImportTemplate).toHaveBeenCalled();
    });
  });
});
