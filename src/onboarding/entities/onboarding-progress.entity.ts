import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum OnboardingStep {
  WELCOME = 'WELCOME',
  ADMIN_SETUP = 'ADMIN_SETUP',
  ORGANIZATION_DETAILS = 'ORGANIZATION_DETAILS',
  BRANCH_SETUP = 'BRANCH_SETUP',
  BRANDING = 'BRANDING',
  USER_INVITATIONS = 'USER_INVITATIONS',
  ROLE_CONFIGURATION = 'ROLE_CONFIGURATION',
  MEMBER_IMPORT = 'MEMBER_IMPORT',
  FINANCIAL_SETUP = 'FINANCIAL_SETUP',
  MODULE_QUICK_START = 'MODULE_QUICK_START',
  COMPLETION = 'COMPLETION',
}

registerEnumType(OnboardingStep, {
  name: 'OnboardingStep',
  description: 'Steps in the onboarding process',
});

@ObjectType()
export class OnboardingProgress {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => [OnboardingStep])
  completedSteps: OnboardingStep[];

  @Field(() => OnboardingStep)
  currentStep: OnboardingStep;

  @Field(() => Boolean)
  isCompleted: boolean;

  @Field(() => Boolean)
  importedMembers: boolean;

  @Field(() => Boolean)
  importedFinances: boolean;

  @Field(() => Date)
  startedAt: Date;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;

  @Field(() => Date)
  lastUpdatedAt: Date;
}
