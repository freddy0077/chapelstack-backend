import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OnboardingService } from '../services/onboarding.service';
import { SetupWizardService } from '../services/setup-wizard.service';
import { DataImportService } from '../services/data-import.service';
import { OnboardingProgress } from '../entities/onboarding-progress.entity';
import { InitialBranchSetupInput } from '../dto/initial-branch-setup.input';
import { InitialSettingsInput } from '../dto/initial-settings.input';
import { CompleteOnboardingStepInput } from '../dto/complete-onboarding-step.input';
import { ImportResult } from '../dto/import-result.output';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { BadRequestException } from '@nestjs/common';

@Resolver()
export class OnboardingResolver {
  constructor(
    private onboardingService: OnboardingService,
    private setupWizardService: SetupWizardService,
    private dataImportService: DataImportService,
  ) {}

  @Query(() => OnboardingProgress)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions({ action: 'read', subject: 'onboarding' })
  async onboardingProgress(
    @Args('branchId', { type: () => ID }) branchId: string,
  ): Promise<OnboardingProgress> {
    return this.onboardingService.getOnboardingProgress(branchId);
  }

  @Mutation(() => OnboardingProgress)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions({ action: 'write', subject: 'onboarding' })
  async initializeOnboarding(
    @Args('branchId', { type: () => ID }) branchId: string,
  ): Promise<OnboardingProgress> {
    return this.onboardingService.initializeOnboarding(branchId);
  }

  @Mutation(() => OnboardingProgress)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions({ action: 'write', subject: 'onboarding' })
  async completeOnboardingStep(
    @Args('input') input: CompleteOnboardingStepInput,
  ): Promise<OnboardingProgress> {
    // Pass all fields directly to the service
    return this.onboardingService.completeOnboardingStep(input);
  }

  @Mutation(() => OnboardingProgress)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions({ action: 'write', subject: 'onboarding' })
  async resetOnboarding(
    @Args('branchId', { type: () => ID }) branchId: string,
  ): Promise<OnboardingProgress> {
    return this.onboardingService.resetOnboarding(branchId);
  }

  @Mutation(() => ID)
  async initiateBranchSetup(
    @Args('input') input: InitialBranchSetupInput,
    @CurrentUser() user,
  ): Promise<string> {
    const branch = await this.setupWizardService.initiateBranchSetup(input);
    return branch.id;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions({ action: 'write', subject: 'onboarding' })
  async configureInitialSettings(
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('input') input: InitialSettingsInput,
  ): Promise<boolean> {
    return this.setupWizardService.configureInitialSettings(branchId, input);
  }

  @Mutation(() => ID)
  async createSuperAdminUser(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('firstName') firstName: string,
    @Args('lastName') lastName: string,
    @Args('organisationId', { type: () => ID }) organisationId: string,
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
  ): Promise<string> {
    const user = await this.setupWizardService.createSuperAdminUser(
      email,
      password,
      firstName,
      lastName,
      organisationId,
      branchId ?? undefined,
    );
    return user.id;
  }

  @Mutation(() => ImportResult)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(
    { action: 'write', subject: 'onboarding' },
    { action: 'write', subject: 'members' },
  )
  async importMemberData(
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
    @Args('mapping', { type: () => String }) mappingJson: string,
  ): Promise<ImportResult> {
    // Mapping is not used for member imports in the current implementation
    return this.dataImportService.importMembers(file, branchId);
  }

  @Mutation(() => ImportResult)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(
    { action: 'write', subject: 'onboarding' },
    { action: 'write', subject: 'finances' },
  )
  async importFinancialData(
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
    @Args('mapping', { type: () => String }) mappingJson: string,
    @Args('type') type: 'funds' | 'accounts' | 'contributions',
  ): Promise<ImportResult> {
    const mapping = JSON.parse(mappingJson);
    return this.dataImportService.importFinancialData(
      branchId,
      file,
      mapping,
      type,
    );
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  async generateMemberImportTemplate(): Promise<string> {
    const templatePath =
      await this.dataImportService.generateMemberImportTemplate();
    return templatePath;
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  async generateFundsImportTemplate(): Promise<string> {
    const templatePath =
      await this.dataImportService.generateFundsImportTemplate();
    return templatePath;
  }
}
