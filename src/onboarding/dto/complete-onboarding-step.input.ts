import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { OnboardingStep } from '../entities/onboarding-progress.entity';
import { IsValidEnum } from '../../common/utils/enum-validation.util';

@InputType()
export class CompleteOnboardingStepInput {
  @Field(() => ID)
  @IsUUID('4', { message: 'Invalid branch ID format' })
  @IsNotEmpty({ message: 'Branch ID is required' })
  branchId: string;

  @Field(() => OnboardingStep)
  @IsValidEnum(OnboardingStep, { message: 'Invalid onboarding step' })
  @IsNotEmpty({ message: 'Step key is required' })
  stepKey: OnboardingStep;

  // Church/org details fields
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  email?: string;
  @Field({ nullable: true })
  phoneNumber?: string;
  @Field({ nullable: true })
  website?: string;
  @Field({ nullable: true })
  address?: string;
  @Field({ nullable: true })
  city?: string;
  @Field({ nullable: true })
  state?: string;
  @Field({ nullable: true })
  country?: string;
  @Field({ nullable: true })
  zipCode?: string;
  @Field({ nullable: true })
  description?: string;
  // Module selection
  @Field(() => [String], { nullable: true })
  selectedModules?: string[];
}
