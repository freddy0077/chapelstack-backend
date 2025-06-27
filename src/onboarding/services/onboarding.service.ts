import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BranchesService } from 'src/branches/branches.service';
import {
  OnboardingProgress,
  OnboardingStep,
} from '../entities/onboarding-progress.entity';
import { SettingsService } from 'src/settings/settings.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

@Injectable()
export class OnboardingService {
  /**
   * Returns the overall onboarding progress (percentage).
   * TODO: Implement actual logic.
   */
  async getOverallProgress(): Promise<number> {
    // TODO: Implement actual logic
    return 0;
  }

  /**
   * Returns the number of branches that have completed setup.
   * TODO: Implement actual logic.
   */
  async countBranchesCompletedSetup(): Promise<number> {
    // TODO: Implement actual logic
    return 0;
  }

  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private prisma: PrismaService,
    private branchesService: BranchesService,
    private settingsService: SettingsService,
  ) {}

  async getOnboardingProgress(branchId: string): Promise<OnboardingProgress> {
    try {
      const progress = await this.prisma.onboardingProgress.findUnique({
        where: { branchId },
      });
      if (!progress) {
        throw new NotFoundException(
          `Onboarding progress not found for branch ${branchId}`,
        );
      }
      return {
        ...progress,
        completedSteps: progress.completedSteps as OnboardingStep[],
        currentStep: progress.currentStep as OnboardingStep,
        completedAt: progress.completedAt || undefined,
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving onboarding progress for branch ${branchId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async initializeOnboarding(branchId: string): Promise<OnboardingProgress> {
    try {
      // Check if branch exists
      const branch = await this.branchesService.findOne(branchId);
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${branchId} not found`);
      }

      // Check if onboarding progress already exists
      const existingProgress = await this.prisma.onboardingProgress.findUnique({
        where: { branchId },
      });
      if (existingProgress) {
        return {
          ...existingProgress,
          completedSteps: existingProgress.completedSteps as OnboardingStep[],
          currentStep: existingProgress.currentStep as OnboardingStep,
          completedAt: existingProgress.completedAt || undefined,
        };
      }

      // Create new onboarding progress
      const progress = await this.prisma.onboardingProgress.create({
        data: {
          branchId,
          completedSteps: [],
          currentStep: OnboardingStep.WELCOME,
          isCompleted: false,
          importedMembers: false,
          importedFinances: false,
        },
      });
      return {
        ...progress,
        completedSteps: progress.completedSteps as OnboardingStep[],
        currentStep: progress.currentStep as OnboardingStep,
        completedAt: progress.completedAt || undefined,
      };
    } catch (error) {
      this.logger.error(
        `Error initializing onboarding for branch ${branchId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof PrismaClientKnownRequestError) {
        // P2002 is the error code for unique constraint violation
        if ('code' in error && error.code === 'P2002') {
          throw new ConflictException(
            `Onboarding has already been initialized for branch ${branchId}.`,
          );
        }
      }
      throw error;
    }
  }

  async completeOnboardingStep(
    input: any, // Should match CompleteOnboardingStepInput
  ): Promise<OnboardingProgress> {
    const { branchId, stepKey } = input;
    this.logger.log('completeOnboardingStep called', {
      stepKey,
      branchId,
      input,
    });

    let progress = await this.getOnboardingProgress(branchId);
    if (!progress) {
      throw new NotFoundException(
        `No onboarding progress found for branch ${branchId}.`,
      );
    }

    let newBranchId = branchId;

    try {
      switch (`${stepKey}`) {
        case 'ORGANIZATION_DETAILS': {
          this.logger.log('Processing ORGANIZATION_DETAILS step', input);
          // Log all input fields for debugging
          this.logger.log('Received input for ORGANIZATION_DETAILS:', input);
          if (!input.name || !input.email) {
            this.logger.error('Missing or invalid organization details', input);
            throw new Error(
              'Missing or invalid organization details: required fields (name, email, etc.) are missing.',
            );
          }
          // Always create a new branch for onboarding
          const createdBranch = await this.prisma.branch.create({
            data: {
              name: input.name, // required
              email: input.email, // required
              phoneNumber: input.phoneNumber,
              website: input.website,
              address: input.address,
              city: input.city,
              state: input.state,
              country: input.country,
              postalCode: input.postalCode,
            },
          });
          this.logger.log(
            `Created branch ${createdBranch.id} with organization details.`,
          );
          newBranchId = createdBranch.id;
          progress = await this.getOnboardingProgress(newBranchId);
          break;
        }
        case 'MODULE_QUICK_START': {
          this.logger.log('Processing MODULE_QUICK_START step', input);
          break;
        }
        default: {
          this.logger.log(`Processing step ${stepKey}`, input);
        }
      }

      // Update onboarding progress
      const currentStepIndex = Object.values(OnboardingStep).indexOf(stepKey);
      if (currentStepIndex === -1) {
        throw new BadRequestException(`Invalid onboarding step: ${stepKey}`);
      }
      let nextStep: OnboardingStep | null;
      if (currentStepIndex === Object.values(OnboardingStep).length - 1) {
        nextStep = null;
      } else {
        nextStep = Object.values(OnboardingStep)[currentStepIndex + 1];
      }
      const completedSteps = [...progress.completedSteps, stepKey];
      const updateData: Prisma.OnboardingProgressUpdateInput = {
        completedSteps,
        currentStep: nextStep || OnboardingStep.COMPLETION,
      };
      if (`${stepKey}` === 'MODULE_QUICK_START' && input.selectedModules) {
        updateData.selectedModules = input.selectedModules as string[];
      }
      const updatedProgress = await this.prisma.onboardingProgress.update({
        where: { branchId: newBranchId },
        data: updateData,
      });
      return {
        ...updatedProgress,
        branchId: newBranchId,
        completedSteps: updatedProgress.completedSteps as OnboardingStep[],
        currentStep: updatedProgress.currentStep as OnboardingStep,
        completedAt: updatedProgress.completedAt || undefined,
      };
    } catch (error) {
      this.logger.error(
        `Error completing onboarding step ${stepKey} for branch ${branchId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async resetOnboarding(branchId: string): Promise<OnboardingProgress> {
    try {
      const updatedProgress = await this.prisma.onboardingProgress.update({
        where: { branchId },
        data: {
          completedSteps: [],
          currentStep: OnboardingStep.WELCOME,
          isCompleted: false,
          importedMembers: false,
          importedFinances: false,
          completedAt: undefined,
        },
      });
      return {
        ...updatedProgress,
        completedSteps: updatedProgress.completedSteps as OnboardingStep[],
        currentStep: updatedProgress.currentStep as OnboardingStep,
        completedAt: updatedProgress.completedAt || undefined,
      };
    } catch (error) {
      this.logger.error(
        `Error resetting onboarding for branch ${branchId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async updateImportStatus(
    branchId: string,
    type: 'members' | 'finances',
    status: boolean,
  ): Promise<OnboardingProgress> {
    try {
      const data =
        type === 'members'
          ? { importedMembers: status }
          : { importedFinances: status };

      const updatedProgress = await this.prisma.onboardingProgress.update({
        where: { branchId },
        data,
      });

      return {
        ...updatedProgress,
        completedSteps: updatedProgress.completedSteps as OnboardingStep[],
        currentStep: updatedProgress.currentStep as OnboardingStep,
        completedAt: updatedProgress.completedAt || undefined,
      };
    } catch (error) {
      this.logger.error(
        `Error updating import status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
