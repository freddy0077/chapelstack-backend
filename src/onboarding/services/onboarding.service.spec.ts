import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingService } from './onboarding.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, MockProxy } from 'jest-mock-extended';
import { OnboardingStep } from '../entities/onboarding-progress.entity';
import { SettingsService } from '../../settings/settings.service';
import { BranchesService } from '../../branches/branches.service';
import { NotFoundException } from '@nestjs/common';
import { CompleteOnboardingStepInput } from '../dto/complete-onboarding-step.input';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let prismaService: MockProxy<PrismaService>;
  let branchesService: MockProxy<BranchesService>;
  let settingsService: MockProxy<SettingsService>;

  const mockBranchId = '123e4567-e89b-12d3-a456-426614174000';
  const mockOnboardingProgress = {
    id: '123e4567-e89b-12d3-a456-426614174001',
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

  beforeEach(async () => {
    prismaService = mockDeep<PrismaService>();
    branchesService = mockDeep<BranchesService>();
    settingsService = mockDeep<SettingsService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: BranchesService,
          useValue: branchesService,
        },
        {
          provide: SettingsService,
          useValue: settingsService,
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOnboardingProgress', () => {
    it('should return onboarding progress for a valid branch ID', async () => {
      prismaService.onboardingProgress.findUnique.mockResolvedValue(
        mockOnboardingProgress,
      );

      const result = await service.getOnboardingProgress(mockBranchId);

      expect(result).toEqual(mockOnboardingProgress);
      expect(prismaService.onboardingProgress.findUnique).toHaveBeenCalledWith({
        where: { branchId: mockBranchId },
      });
    });

    it('should throw NotFoundException if branch onboarding progress is not found', async () => {
      prismaService.onboardingProgress.findUnique.mockResolvedValue(null);

      await expect(service.getOnboardingProgress(mockBranchId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('initializeOnboarding', () => {
    it('should create new onboarding progress if none exists', async () => {
      prismaService.onboardingProgress.findUnique.mockResolvedValue(null);
      prismaService.onboardingProgress.create.mockResolvedValue(
        mockOnboardingProgress,
      );

      const result = await service.initializeOnboarding(mockBranchId);

      expect(result).toEqual(mockOnboardingProgress);
      expect(prismaService.onboardingProgress.create).toHaveBeenCalled();
    });

    it('should return existing onboarding progress if it exists', async () => {
      prismaService.onboardingProgress.findUnique.mockResolvedValue(
        mockOnboardingProgress,
      );

      const result = await service.initializeOnboarding(mockBranchId);

      expect(result).toEqual(mockOnboardingProgress);
      expect(prismaService.onboardingProgress.create).not.toHaveBeenCalled();
    });
  });

  describe('completeOnboardingStep', () => {
    it('should update onboarding progress when completing a step', async () => {
      const input: CompleteOnboardingStepInput = {
        branchId: mockBranchId,
        stepKey: OnboardingStep.ADMIN_SETUP,
      };

      const updatedProgress = {
        ...mockOnboardingProgress,
        completedSteps: [
          ...mockOnboardingProgress.completedSteps,
          OnboardingStep.ADMIN_SETUP,
        ],
        currentStep: OnboardingStep.ORGANIZATION_DETAILS,
      };

      prismaService.onboardingProgress.findUnique.mockResolvedValue(
        mockOnboardingProgress,
      );
      prismaService.onboardingProgress.update.mockResolvedValue(
        updatedProgress,
      );

      const result = await service.completeOnboardingStep(input);

      expect(result).toEqual(updatedProgress);
      expect(prismaService.onboardingProgress.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if onboarding progress does not exist', async () => {
      prismaService.onboardingProgress.findUnique.mockResolvedValue(null);

      await expect(
        service.completeOnboardingStep({
          branchId: mockBranchId,
          stepKey: OnboardingStep.ADMIN_SETUP,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetOnboarding', () => {
    it('should reset onboarding progress', async () => {
      const resetProgress = {
        ...mockOnboardingProgress,
        completedSteps: [],
        currentStep: OnboardingStep.WELCOME,
        isCompleted: false,
      };

      prismaService.onboardingProgress.findUnique.mockResolvedValue(
        mockOnboardingProgress,
      );
      prismaService.onboardingProgress.update.mockResolvedValue(resetProgress);

      const result = await service.resetOnboarding(mockBranchId);

      expect(result).toEqual(resetProgress);
      expect(prismaService.onboardingProgress.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if onboarding progress does not exist', async () => {
      prismaService.onboardingProgress.findUnique.mockResolvedValue(null);

      await expect(service.resetOnboarding(mockBranchId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
