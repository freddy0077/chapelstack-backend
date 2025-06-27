"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OnboardingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const branches_service_1 = require("../../branches/branches.service");
const onboarding_progress_entity_1 = require("../entities/onboarding-progress.entity");
const settings_service_1 = require("../../settings/settings.service");
const library_1 = require("@prisma/client/runtime/library");
let OnboardingService = OnboardingService_1 = class OnboardingService {
    prisma;
    branchesService;
    settingsService;
    async getOverallProgress() {
        return 0;
    }
    async countBranchesCompletedSetup() {
        return 0;
    }
    logger = new common_1.Logger(OnboardingService_1.name);
    constructor(prisma, branchesService, settingsService) {
        this.prisma = prisma;
        this.branchesService = branchesService;
        this.settingsService = settingsService;
    }
    async getOnboardingProgress(branchId) {
        try {
            const progress = await this.prisma.onboardingProgress.findUnique({
                where: { branchId },
            });
            if (!progress) {
                throw new common_1.NotFoundException(`Onboarding progress not found for branch ${branchId}`);
            }
            return {
                ...progress,
                completedSteps: progress.completedSteps,
                currentStep: progress.currentStep,
                completedAt: progress.completedAt || undefined,
            };
        }
        catch (error) {
            this.logger.error(`Error retrieving onboarding progress for branch ${branchId}: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
    async initializeOnboarding(branchId) {
        try {
            const branch = await this.branchesService.findOne(branchId);
            if (!branch) {
                throw new common_1.NotFoundException(`Branch with ID ${branchId} not found`);
            }
            const existingProgress = await this.prisma.onboardingProgress.findUnique({
                where: { branchId },
            });
            if (existingProgress) {
                return {
                    ...existingProgress,
                    completedSteps: existingProgress.completedSteps,
                    currentStep: existingProgress.currentStep,
                    completedAt: existingProgress.completedAt || undefined,
                };
            }
            const progress = await this.prisma.onboardingProgress.create({
                data: {
                    branchId,
                    completedSteps: [],
                    currentStep: onboarding_progress_entity_1.OnboardingStep.WELCOME,
                    isCompleted: false,
                    importedMembers: false,
                    importedFinances: false,
                },
            });
            return {
                ...progress,
                completedSteps: progress.completedSteps,
                currentStep: progress.currentStep,
                completedAt: progress.completedAt || undefined,
            };
        }
        catch (error) {
            this.logger.error(`Error initializing onboarding for branch ${branchId}: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                if ('code' in error && error.code === 'P2002') {
                    throw new common_1.ConflictException(`Onboarding has already been initialized for branch ${branchId}.`);
                }
            }
            throw error;
        }
    }
    async completeOnboardingStep(input) {
        const { branchId, stepKey } = input;
        this.logger.log('completeOnboardingStep called', {
            stepKey,
            branchId,
            input,
        });
        let progress = await this.getOnboardingProgress(branchId);
        if (!progress) {
            throw new common_1.NotFoundException(`No onboarding progress found for branch ${branchId}.`);
        }
        let newBranchId = branchId;
        try {
            switch (`${stepKey}`) {
                case 'ORGANIZATION_DETAILS': {
                    this.logger.log('Processing ORGANIZATION_DETAILS step', input);
                    this.logger.log('Received input for ORGANIZATION_DETAILS:', input);
                    if (!input.name || !input.email) {
                        this.logger.error('Missing or invalid organization details', input);
                        throw new Error('Missing or invalid organization details: required fields (name, email, etc.) are missing.');
                    }
                    const createdBranch = await this.prisma.branch.create({
                        data: {
                            name: input.name,
                            email: input.email,
                            phoneNumber: input.phoneNumber,
                            website: input.website,
                            address: input.address,
                            city: input.city,
                            state: input.state,
                            country: input.country,
                            postalCode: input.postalCode,
                        },
                    });
                    this.logger.log(`Created branch ${createdBranch.id} with organization details.`);
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
            const currentStepIndex = Object.values(onboarding_progress_entity_1.OnboardingStep).indexOf(stepKey);
            if (currentStepIndex === -1) {
                throw new common_1.BadRequestException(`Invalid onboarding step: ${stepKey}`);
            }
            let nextStep;
            if (currentStepIndex === Object.values(onboarding_progress_entity_1.OnboardingStep).length - 1) {
                nextStep = null;
            }
            else {
                nextStep = Object.values(onboarding_progress_entity_1.OnboardingStep)[currentStepIndex + 1];
            }
            const completedSteps = [...progress.completedSteps, stepKey];
            const updateData = {
                completedSteps,
                currentStep: nextStep || onboarding_progress_entity_1.OnboardingStep.COMPLETION,
            };
            if (`${stepKey}` === 'MODULE_QUICK_START' && input.selectedModules) {
                updateData.selectedModules = input.selectedModules;
            }
            const updatedProgress = await this.prisma.onboardingProgress.update({
                where: { branchId: newBranchId },
                data: updateData,
            });
            return {
                ...updatedProgress,
                branchId: newBranchId,
                completedSteps: updatedProgress.completedSteps,
                currentStep: updatedProgress.currentStep,
                completedAt: updatedProgress.completedAt || undefined,
            };
        }
        catch (error) {
            this.logger.error(`Error completing onboarding step ${stepKey} for branch ${branchId}: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
    async resetOnboarding(branchId) {
        try {
            const updatedProgress = await this.prisma.onboardingProgress.update({
                where: { branchId },
                data: {
                    completedSteps: [],
                    currentStep: onboarding_progress_entity_1.OnboardingStep.WELCOME,
                    isCompleted: false,
                    importedMembers: false,
                    importedFinances: false,
                    completedAt: undefined,
                },
            });
            return {
                ...updatedProgress,
                completedSteps: updatedProgress.completedSteps,
                currentStep: updatedProgress.currentStep,
                completedAt: updatedProgress.completedAt || undefined,
            };
        }
        catch (error) {
            this.logger.error(`Error resetting onboarding for branch ${branchId}: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
    async updateImportStatus(branchId, type, status) {
        try {
            const data = type === 'members'
                ? { importedMembers: status }
                : { importedFinances: status };
            const updatedProgress = await this.prisma.onboardingProgress.update({
                where: { branchId },
                data,
            });
            return {
                ...updatedProgress,
                completedSteps: updatedProgress.completedSteps,
                currentStep: updatedProgress.currentStep,
                completedAt: updatedProgress.completedAt || undefined,
            };
        }
        catch (error) {
            this.logger.error(`Error updating import status: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
};
exports.OnboardingService = OnboardingService;
exports.OnboardingService = OnboardingService = OnboardingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        branches_service_1.BranchesService,
        settings_service_1.SettingsService])
], OnboardingService);
//# sourceMappingURL=onboarding.service.js.map