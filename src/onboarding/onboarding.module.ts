import { Module } from '@nestjs/common';
import { OnboardingService } from './services/onboarding.service';
import { OnboardingResolver } from './resolvers/onboarding.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { BranchesModule } from '../branches/branches.module';
import { UsersModule } from '../users/users.module';
import { SettingsModule } from '../settings/settings.module';
import { MembersModule } from '../members/members.module';
import { SetupWizardService } from './services/setup-wizard.service';
import { DataImportService } from './services/data-import.service';

@Module({
  imports: [
    PrismaModule,
    BranchesModule,
    UsersModule,
    SettingsModule,
    MembersModule,
  ],
  providers: [
    OnboardingResolver,
    OnboardingService,
    SetupWizardService,
    DataImportService,
  ],
  exports: [OnboardingService],
})
export class OnboardingModule {}
