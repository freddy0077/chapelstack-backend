# Onboarding & Setup Module (`onboarding.md`)

## 1. Overview

The Onboarding & Setup module is designed to guide new churches or new branches through the initial configuration and data setup process for the Church Management System. It aims to make the initial adoption of the system as smooth and efficient as possible.

This module is typically used once per new church/branch or during major system setups.

## 2. Core Responsibilities

-   **Initial Setup Wizard**: Providing a step-by-step guided process for administrators to configure essential system settings and input initial data.
-   **Branch Creation & Configuration**: Facilitating the setup of the primary church branch (or subsequent branches), including details like name, address, contact information, and default settings.
-   **Core Data Import**: Assisting with the initial import of essential data, such as:
    -   Member lists (from spreadsheets or previous systems).
    -   Existing financial funds.
    -   Chart of accounts (if applicable).
    -   Key staff/user accounts.
-   **Module Configuration**: Guiding administrators through the basic configuration of core modules they plan to use (e.g., setting up default event types, defining initial small groups or ministries, configuring basic financial settings).
-   **User Invitation & Role Assignment**: Helping set up initial administrative users and assign them appropriate roles.
-   **Customization Prompts**: Prompting for key customizations like church logo, branding colors (if applicable to parts of the system), and default communication templates.
-   **Checklists & Progress Tracking**: Providing a checklist or progress indicator for the onboarding process.

## 3. Key Steps in Onboarding Flow (Example)

*(This module is more about a process/workflow than persistent data entities, though it interacts with many entities from other modules during setup.)*

1.  **Welcome & System Overview**: Introduction to the CMS.
2.  **Super Administrator Account Setup**: Creating the first high-level admin account.
3.  **Church/Organization Details**: Inputting name, primary contact, etc.
4.  **First Branch Setup**: Name, address, timezone, currency for the main branch.
5.  **Logo & Basic Branding**: Uploading church logo.
6.  **User Invitations**: Inviting key staff (e.g., pastors, branch administrators, finance officers).
7.  **Role Configuration (Basic)**: Reviewing default roles or making initial assignments.
8.  **Member Data Import (Optional)**: Uploading a CSV of existing members.
9.  **Financial Setup (Basic)**: Defining initial funds, fiscal year start date.
10. **Module Quick Start**: Brief guided setup for 1-2 core modules (e.g., create first event type, define first sermon series).
11. **Review & Completion**: Summary of setup and links to further documentation or support.

## 4. Core Functionalities & Use Cases

-   A new church signs up for the CMS and is guided through a wizard to set up their primary branch, import existing members, and configure basic financial settings.
-   An administrator of an existing multi-site church uses the onboarding flow to add and configure a new campus/branch.
-   During setup, the system prompts the user to upload their church logo, which will be used in communications and reports.
-   The onboarding process provides a template CSV for member data import and validates the uploaded file.

## 5. API Endpoints

### Schemas

#### OnboardingStep Enum
```typescript
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
```

#### OnboardingProgress
```typescript
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
```

#### ImportResult
```typescript
@ObjectType()
export class ImportError {
  @Field()
  row: number;

  @Field()
  column: string;

  @Field()
  message: string;
}

@ObjectType()
export class ImportResult {
  @Field()
  success: boolean;

  @Field()
  totalRecords: number;

  @Field()
  importedRecords: number;

  @Field(() => [ImportError], { nullable: true })
  errors?: ImportError[];

  @Field({ nullable: true })
  message?: string;
}
```

#### Input Types

```typescript
@InputType()
export class InitialBranchSetupInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Branch name is required' })
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  city?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  country?: string;

  @Field({ nullable: true })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  timezone?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  currency?: string;
}

@InputType()
export class InitialSettingsInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Organization name is required' })
  organizationName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  organizationDescription?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @Field({ nullable: true })
  @IsUrl({}, { message: 'Please provide a valid website URL' })
  @IsOptional()
  websiteUrl?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  logo?: Promise<FileUpload>;
}

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
}
```

### GraphQL API

#### Queries

```graphql
# Get the onboarding progress for a specific branch
query OnboardingProgress($branchId: ID!) {
  onboardingProgress(branchId: $branchId) {
    id
    branchId
    completedSteps
    currentStep
    isCompleted
    importedMembers
    importedFinances
    startedAt
    completedAt
    lastUpdatedAt
  }
}

# Get a template for member data imports
query GenerateMemberImportTemplate {
  generateMemberImportTemplate
}

# Get a template for funds data imports
query GenerateFundsImportTemplate {
  generateFundsImportTemplate
}
```

#### Mutations

```graphql
# Initialize the onboarding process for a branch
mutation InitializeOnboarding($branchId: ID!) {
  initializeOnboarding(branchId: $branchId) {
    id
    branchId
    completedSteps
    currentStep
    isCompleted
  }
}

# Mark an onboarding step as completed
mutation CompleteOnboardingStep($input: CompleteOnboardingStepInput!) {
  completeOnboardingStep(input: $input) {
    id
    branchId
    completedSteps
    currentStep
    isCompleted
  }
}

# Reset the onboarding process for a branch
mutation ResetOnboarding($branchId: ID!) {
  resetOnboarding(branchId: $branchId) {
    id
    currentStep
    completedSteps
    isCompleted
  }
}

# Set up a new branch during onboarding
mutation InitiateBranchSetup($input: InitialBranchSetupInput!) {
  initiateBranchSetup(input: $input)
}

# Configure initial settings for a branch
mutation ConfigureInitialSettings($branchId: ID!, $input: InitialSettingsInput!) {
  configureInitialSettings(branchId: $branchId, input: $input)
}

# Create a super admin user during onboarding
mutation CreateSuperAdminUser(
  $email: String!, 
  $password: String!, 
  $firstName: String!, 
  $lastName: String!, 
  $branchId: ID!
) {
  createSuperAdminUser(
    email: $email
    password: $password
    firstName: $firstName
    lastName: $lastName
    branchId: $branchId
  )
}

# Import member data from a CSV file
mutation ImportMemberData(
  $branchId: ID!, 
  $file: Upload!, 
  $mapping: String!
) {
  importMemberData(
    branchId: $branchId
    file: $file
    mapping: $mapping
  ) {
    success
    totalRecords
    importedRecords
    errors {
      row
      column
      message
    }
    message
  }
}

# Import financial data from a CSV file
mutation ImportFinancialData(
  $branchId: ID!, 
  $file: Upload!, 
  $mapping: String!, 
  $type: String!
) {
  importFinancialData(
    branchId: $branchId
    file: $file
    mapping: $mapping
    type: $type
  ) {
    success
    totalRecords
    importedRecords
    errors {
      row
      column
      message
    }
    message
  }
}
```

## 6. Integration with Other Modules

-   **Branch Management**: Core to creating and configuring new branches.
-   **Member Management**: For initial member data import.
-   **Financial Management**: For setting up initial funds and financial configurations.
-   **Authentication & User Management**: For creating initial admin users and assigning roles.
-   **Settings Module**: For applying initial configurations.
-   **All other modules**: Potentially for guiding through basic setup of each selected module.

## 7. Security Considerations

-   Ensuring that the onboarding process itself is secure, especially when handling initial admin account creation and data import.
-   Validating all imported data to prevent corruption or security vulnerabilities.
-   Guiding users to set strong initial passwords and understand security best practices.
-   Restricting access to onboarding functionalities after initial setup is complete for a branch.

## 8. Future Considerations

-   More sophisticated data migration tools from popular existing church management systems.
-   Video tutorials or guided tours embedded within the onboarding flow.
-   AI-powered suggestions for configuration based on church size or denomination (if applicable).
-   Post-onboarding checklists for advanced module configurations.
