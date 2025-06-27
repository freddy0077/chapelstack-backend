# Onboarding & Setup Module Implementation

## Overview

The Onboarding & Setup module provides a structured process for new churches or branches to configure the Church Management System. It guides users through initial setup steps, data import, and system configuration to ensure a smooth onboarding experience.

## Schema Design

The module introduces the following database models:

### OnboardingProgress

Tracks the progress of a branch through the onboarding process:

```prisma
model OnboardingProgress {
  id                String          @id @default(uuid())
  branchId          String          @unique
  completedSteps    OnboardingStep[]
  currentStep       OnboardingStep
  isCompleted       Boolean         @default(false)
  importedMembers   Boolean         @default(false)
  importedFinances  Boolean         @default(false)
  startedAt         DateTime        @default(now())
  completedAt       DateTime?
  lastUpdatedAt     DateTime        @updatedAt
  
  // Relations
  branch            Branch          @relation(fields: [branchId], references: [id], onDelete: Cascade)
}
```

### OnboardingStep Enum

Defines the sequential steps in the onboarding process:

```prisma
enum OnboardingStep {
  WELCOME
  ADMIN_SETUP
  ORGANIZATION_DETAILS
  BRANCH_SETUP
  BRANDING
  USER_INVITATIONS
  ROLE_CONFIGURATION
  MEMBER_IMPORT
  FINANCIAL_SETUP
  MODULE_QUICK_START
  COMPLETION
}
```

## Module Structure

The Onboarding module is organized into the following components:

### Services

1. **OnboardingService**: Core service that manages onboarding progress tracking, step completion, and status updates.
2. **SetupWizardService**: Handles initial setup tasks like branch creation, organization settings, and admin user creation.
3. **DataImportService**: Manages the import of member and financial data from CSV files.

### Resolvers

The `OnboardingResolver` exposes GraphQL queries and mutations for:
- Tracking onboarding progress
- Initializing the onboarding process
- Completing onboarding steps
- Setting up branches and initial configurations
- Importing data
- Creating admin users

### DTOs and Entities

- **OnboardingProgress**: GraphQL entity representing onboarding status
- **InitialBranchSetupInput**: DTO for branch creation
- **InitialSettingsInput**: DTO for organization settings
- **CompleteOnboardingStepInput**: DTO for marking steps as complete
- **ImportResult**: DTO for data import results

## Onboarding Flow

The onboarding process follows these steps:

1. **Welcome**: Introduction to the system
2. **Admin Setup**: Creation of the first admin user
3. **Organization Details**: Basic information about the church organization
4. **Branch Setup**: Configuration of the first branch
5. **Branding**: Upload of logo and setting of brand colors
6. **User Invitations**: Invitation of additional users
7. **Role Configuration**: Assignment of roles to users
8. **Member Import**: Import of member data from CSV
9. **Financial Setup**: Configuration of funds, accounts, and import of financial data
10. **Module Quick Start**: Brief introduction to key modules
11. **Completion**: Finalization of the onboarding process

## API Endpoints

### Queries

- `onboardingProgress(branchId: ID!)`: Get the current onboarding status for a branch
- `generateMemberImportTemplate()`: Generate a CSV template for member imports
- `generateFundsImportTemplate()`: Generate a CSV template for funds imports

### Mutations

- `initializeOnboarding(branchId: ID!)`: Start the onboarding process for a branch
- `completeOnboardingStep(input: CompleteOnboardingStepInput!)`: Mark a step as complete
- `resetOnboarding(branchId: ID!)`: Reset the onboarding process
- `initiateBranchSetup(input: InitialBranchSetupInput!)`: Create a new branch
- `configureInitialSettings(branchId: ID!, input: InitialSettingsInput!)`: Configure organization settings
- `createSuperAdminUser(email: String!, password: String!, firstName: String!, lastName: String!, branchId: ID!)`: Create the first admin user
- `importMemberData(branchId: ID!, file: Upload!, mapping: String!)`: Import members from CSV
- `importFinancialData(branchId: ID!, file: Upload!, mapping: String!, type: String!)`: Import financial data from CSV

## Integration Points

The Onboarding module integrates with several other modules:

- **Branches**: For branch creation and management
- **Users**: For user creation and role assignment
- **Settings**: For storing organization and branch settings
- **Members**: For importing and creating member records
- **Finances**: For setting up financial accounts and importing financial data

## Security Considerations

- Admin user creation is protected with strong password requirements
- Data import validation ensures data integrity
- Role-based permissions control access to onboarding functions
- Onboarding progress is branch-specific for multi-branch organizations

## Usage Examples

### Starting the Onboarding Process

```graphql
mutation {
  initializeOnboarding(branchId: "branch-id-here") {
    id
    currentStep
    completedSteps
  }
}
```

### Creating a New Branch

```graphql
mutation {
  initiateBranchSetup(input: {
    name: "Main Campus",
    address: "123 Church Street",
    email: "info@example.org",
    phoneNumber: "+1234567890",
    timezone: "America/New_York",
    currency: "USD"
  }) {
    id
    name
  }
}
```

### Importing Members

```graphql
mutation {
  importMemberData(
    branchId: "branch-id-here",
    file: "uploaded-file",
    mapping: "{\"firstName\":\"First Name\",\"lastName\":\"Last Name\",\"email\":\"Email\"}"
  ) {
    success
    totalRecords
    importedRecords
    errors {
      row
      column
      message
    }
  }
}
```

## Future Enhancements

1. **Interactive Tutorials**: Add guided tutorials for each module
2. **Progress Dashboard**: Visual representation of onboarding progress
3. **Data Validation Rules**: Customizable validation rules for data imports
4. **Template Library**: Predefined templates for common church configurations
5. **Migration Tools**: Tools for migrating from other church management systems
