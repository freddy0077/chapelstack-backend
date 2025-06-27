# Branch Management Module (`branches.md`)

## 1. Overview

The Branch Management module is the cornerstone of the multi-tenant architecture in the Church Management System. Each "Branch" represents an individual church, parish, or location that uses the system. This module is responsible for creating, configuring, and managing these distinct entities, ensuring data isolation and tailored experiences where necessary.

All other modules in the system are designed to be branch-aware, meaning their data and operations are typically scoped to a specific branch.

## 2. Core Responsibilities

-   **Branch Creation and Lifecycle**: Managing the addition of new branches, their activation, deactivation, or archival.
-   **Branch Profile Management**: Storing and updating essential information about each branch, such as:
    -   Name, address, contact details.
    -   Leadership information (e.g., head pastor/priest).
    -   Geographical location, service times.
    -   Custom branding elements (logo, color scheme if applicable at this level).
-   **Branch-Specific Settings**: Allowing configuration of settings that may vary per branch (e.g., default currency, timezone, specific feature flags if granular control is needed).
-   **Hierarchical Relationships (Optional)**: If applicable, managing relationships between branches (e.g., regions, dioceses overseeing multiple branches).
-   **Providing Branch Context**: Making branch information readily available to other modules and services to ensure data is correctly scoped.

## 3. Key Entities & Data Models

*(This section should detail the Prisma/TypeORM entities or database schema for branches. Example below)*

### `Branch` Entity

```typescript
// Example Prisma Schema
model Branch {
  id          String    @id @default(cuid())
  name        String
  address     String?
  city        String?
  state       String?
  postalCode  String?
  country     String?
  phoneNumber String?
  email       String?    @unique
  website     String?
  establishedAt DateTime?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  users       UserBranch[] // Users associated with this branch
  members     Member[]     // Members belonging to this branch
  events      Event[]      // Events organized by this branch
  // ... other relations to branch-specific data
}
```

### `BranchSettings` Entity (Example)

```typescript
// Example Prisma Schema
model BranchSetting {
  id          String @id @default(cuid())
  branchId    String
  branch      Branch @relation(fields: [branchId], references: [id])
  key         String // e.g., "defaultCurrency", "timezone"
  value       String // Value of the setting
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([branchId, key])
}
```

## 4. Core Functionalities & Use Cases

-   **Super Admin/Diocesan Admin creates a new Branch**.
-   **Branch Admin updates their Branch's profile information**.
-   **System retrieves a list of all active Branches** (for selection by users with multi-branch access).
-   **A service in another module (e.g., Members service) fetches the current Branch's details** to apply specific configurations or display branch information.
-   **Ensuring data queries are filtered by `branchId`**: This is a critical cross-cutting concern. Services should typically receive `branchId` as a parameter or derive it from the authenticated user's context.

## 5. API Endpoints

*(Detail the relevant GraphQL mutations/queries or REST API endpoints for managing branches. Examples below)*

### GraphQL

**Queries:**

```graphql
# Get a specific branch by ID
getBranch(id: ID!): Branch

# Get a list of all branches (with pagination and filtering)
listBranches(filter: BranchFilterInput, pagination: PaginationInput): PaginatedBranches

# Get settings for a specific branch
getBranchSettings(branchId: ID!): [BranchSetting!]
```

**Mutations:**

```graphql
# Create a new branch (typically restricted to Super Admins)
createBranch(input: CreateBranchInput!): Branch

# Update an existing branch
updateBranch(id: ID!, input: UpdateBranchInput!): Branch

# Update a specific setting for a branch
updateBranchSetting(branchId: ID!, key: String!, value: String!): BranchSetting
```

### REST API (if applicable)

-   `POST /branches` - Create a new branch
-   `GET /branches` - List branches
-   `GET /branches/{id}` - Get a specific branch
-   `PUT /branches/{id}` - Update a branch
-   `GET /branches/{id}/settings` - Get settings for a branch
-   `PUT /branches/{id}/settings/{key}` - Update a specific setting

## 6. Integration with Other Modules

-   **Authentication/User Management**: Users are typically associated with one or more branches, defining their access scope.
-   **All other modules**: Nearly every other module will have a direct or indirect dependency on the Branch module to scope data and functionality. For example, when creating a new Member, Event, or FinancialTransaction, it must be associated with a specific Branch.

## 7. Security Considerations

-   Access to create or modify branches should be strictly limited (e.g., Super Admins, Diocesan Admins).
-   Branch administrators should only be able to manage their own branch's profile and settings.
-   Sensitive branch configuration data should be protected.

## 8. Future Considerations

-   Support for branch hierarchies (regions, dioceses).
-   Automated branch provisioning workflows.
-   Inter-branch data sharing policies (e.g., for shared events or resources, if applicable).
