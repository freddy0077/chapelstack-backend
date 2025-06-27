# Member Management Module (`members.md`)

## 1. Overview

The Member Management module is responsible for maintaining comprehensive records of all church members. This includes personal information, family relationships, spiritual milestones, attendance history, and their affiliation with specific church branches.

This module is central to many church operations and provides the foundational data for communication, pastoral care, and community engagement.

## 2. Core Responsibilities

-   **Member Profile Management**: Creating, updating, and archiving member profiles with detailed information (contact, demographics, custom fields).
-   **Family & Household Grouping**: Linking members into family units or households.
-   **Spiritual Milestone Tracking**: Recording significant spiritual events in a member's life (e.g., baptism, first communion, confirmation, marriage, dedications).
-   **Member Status Management**: Tracking member status (e.g., active, inactive, visitor, deceased, transferred).
-   **Branch Affiliation**: Managing which branch(es) a member primarily belongs to or attends. Includes handling transfers between branches.
-   **Custom Fields**: Allowing administrators to define and manage custom data fields relevant to their church's needs.
-   **Privacy and Consent Management**: Handling member data privacy preferences and consent for communication or data usage.
-   **Search and Filtering**: Providing robust search and filtering capabilities for member data.

## 3. Key Entities & Data Models

*(This section should detail the Prisma/TypeORM entities or database schema. Example below)*

### `Member` Entity

```typescript
// Example Prisma Schema
model Member {
  id             String    @id @default(cuid())
  firstName      String
  lastName       String
  middleName     String?
  preferredName  String?
  dateOfBirth    DateTime?
  gender         Gender?   // Enum: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
  email          String?   @unique
  phoneNumber    String?
  address        String?
  city           String?
  state          String?
  postalCode     String?
  country        String?
  profilePictureUrl String?
  memberSince    DateTime?
  status         MemberStatus @default(ACTIVE) // Enum: ACTIVE, INACTIVE, VISITOR, DECEASED, TRANSFERRED
  branchId       String    // Primary branch affiliation
  branch         Branch    @relation(fields: [branchId], references: [id])
  userId         String?   @unique // Link to User account if applicable
  user           User?     @relation(fields: [userId], references: [id])
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Relations
  familyMembers  FamilyMember[] @relation("MemberToFamily")
  families       FamilyMember[] @relation("FamilyToMember")
  spiritualMilestones SpiritualMilestone[]
  attendanceRecords AttendanceRecord[]
  // ... other relations like group memberships, giving records
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

enum MemberStatus {
  ACTIVE
  INACTIVE
  VISITOR
  NEW_CONVERT
  DECEASED
  TRANSFERRED_OUT
  LEFT_CHURCH
}
```

### `Family` Entity

```typescript
// Example Prisma Schema
model Family {
  id        String   @id @default(cuid())
  familyName String  // e.g., "The Smith Family"
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members   FamilyMember[]
}
```

### `FamilyMember` (Junction Table for Member-Family-Role)

```typescript
// Example Prisma Schema
model FamilyMember {
  memberId String
  familyId String
  roleInFamily FamilyRole // Enum: HEAD, SPOUSE, CHILD, OTHER

  member   Member @relation("MemberToFamily", fields: [memberId], references: [id])
  family   Family @relation("FamilyToMember", fields: [familyId], references: [id])

  @@id([memberId, familyId])
}

enum FamilyRole {
  HEAD
  SPOUSE
  CHILD
  PARENT
  GUARDIAN
  OTHER
}
```

### `SpiritualMilestone` Entity

```typescript
// Example Prisma Schema
model SpiritualMilestone {
  id          String             @id @default(cuid())
  memberId    String
  member      Member             @relation(fields: [memberId], references: [id])
  type        MilestoneType      // Enum: BAPTISM, CONFIRMATION, MARRIAGE, ETC.
  date        DateTime
  location    String?
  officiant   String?            // Pastor/Priest who officiated
  notes       String?
  certificateUrl String?         // Link to scanned certificate
  branchId    String
  branch      Branch             @relation(fields: [branchId], references: [id])
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
}

enum MilestoneType {
  SALVATION
  BAPTISM
  FIRST_COMMUNION
  CONFIRMATION
  MARRIAGE
  ORDINATION
  CHILD_DEDICATION
  OTHER
}
```

## 4. Core Functionalities & Use Cases

-   **Church staff adds a new member profile** after they fill out a connection card.
-   **A member updates their contact information** through their profile page (if linked to a User account).
-   **Staff groups individuals into a family unit**.
-   **Pastor records a baptism for a member**, including the date and officiating minister.
-   **Admin generates a report of all active members** in a specific branch.
-   **A member transfers from Branch A to Branch B**, their records are updated to reflect the new primary branch, while maintaining history.
-   **Searching for members** by name, email, phone number, or status.

## 5. API Endpoints

*(Detail the relevant GraphQL mutations/queries or REST API endpoints. Examples below)*

### GraphQL

**Queries:**

```graphql
# Get a specific member by ID
member(id: ID!): Member

# List members (with pagination, filtering by branch, status, etc.)
members(filter: MemberFilterInput, pagination: PaginationInput): PaginatedMembers

# Get family details by ID
family(id: ID!): Family

# List families for a branch
families(branchId: ID!, pagination: PaginationInput): PaginatedFamilies

# Get spiritual milestones for a member
spiritualMilestones(memberId: ID!): [SpiritualMilestone!]
```

**Mutations:**

```graphql
# Create a new member
createMember(input: CreateMemberInput!): Member

# Update an existing member
updateMember(id: ID!, input: UpdateMemberInput!): Member

# Archive or change status of a member
setMemberStatus(id: ID!, status: MemberStatus!): Member

# Create a new family unit
createFamily(input: CreateFamilyInput!): Family

# Add a member to a family
addMemberToFamily(familyId: ID!, memberId: ID!, roleInFamily: FamilyRole!): FamilyMember

# Remove a member from a family
removeMemberFromFamily(familyId: ID!, memberId: ID!): Boolean

# Record a spiritual milestone for a member
recordSpiritualMilestone(input: RecordMilestoneInput!): SpiritualMilestone

# Update a spiritual milestone
updateSpiritualMilestone(id: ID!, input: UpdateMilestoneInput!): SpiritualMilestone

# Transfer a member to another branch
transferMember(memberId: ID!, newBranchId: ID!, transferDate: DateTime!): Member
```

### REST API (if applicable)

-   `POST /branches/{branchId}/members`
-   `GET /branches/{branchId}/members`
-   `GET /members/{id}`
-   `PUT /members/{id}`
-   `POST /branches/{branchId}/families`
-   `POST /families/{familyId}/members`
-   `POST /members/{memberId}/milestones`

## 6. Integration with Other Modules

-   **Branch Management**: All member data is scoped by `branchId`.
-   **Authentication/User Management**: Members can be linked to User accounts for self-service.
-   **Attendance Tracking**: Links attendance records to members.
-   **Financial Management**: Links giving records to members.
-   **Communication Tools**: Uses member contact information for sending communications.
-   **Ministry & Small Group Management**: Tracks member involvement in groups.

## 7. Security and Privacy Considerations

-   **Data Access Control**: Ensure that only authorized personnel (based on roles and branch affiliation) can access or modify member data.
-   **PII Protection**: Personally Identifiable Information (PII) must be handled securely, respecting privacy regulations (e.g., GDPR, CCPA).
-   **Audit Trails**: Log all changes to member records, especially sensitive information.
-   **Consent Management**: If collecting data for specific purposes (e.g., newsletters), manage member consent appropriately.

## 8. Future Considerations

-   Advanced duplicate member detection.
-   Member portal for self-service (updating info, viewing giving history, group involvement).
-   Integration with background check services for volunteers.
-   More sophisticated reporting and analytics on member demographics and engagement.
