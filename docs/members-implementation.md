# Member Management Module

## Overview

The Member Management module provides comprehensive functionality for managing church members, their spiritual milestones, family relationships, and other related data. This module is designed to support the complete lifecycle of member data management within the church management system.

## Key Features

- **Member Management**: Create, update, retrieve, and delete member records
- **Spiritual Milestones**: Track significant spiritual events in a member's journey
- **Family Management**: Organize members into family units and manage relationships
- **Branch Assignment**: Assign members to specific church branches
- **Member Status Tracking**: Track and update member status (active, inactive, etc.)

## Architecture

The Member Management module follows a layered architecture:

1. **GraphQL Resolvers**: Handle incoming GraphQL queries and mutations
2. **Services**: Implement business logic and interact with the database
3. **Entities**: Define the data models and their relationships
4. **DTOs**: Define data transfer objects for input validation and transformation

## Core Components

### Entities

- **Member**: Represents a church member with personal information
- **SpiritualMilestone**: Tracks significant spiritual events in a member's life
- **Family**: Represents a family unit within the church
- **FamilyRelationship**: Defines relationships between members

### Services

- **MembersService**: Handles CRUD operations for members
- **SpiritualMilestonesService**: Manages spiritual milestones
- **FamiliesService**: Manages families and family relationships

### Resolvers

- **MembersResolver**: Exposes member operations via GraphQL
- **SpiritualMilestonesResolver**: Exposes spiritual milestone operations via GraphQL
- **FamiliesResolver**: Exposes family operations via GraphQL

## API Reference

### Member Operations

```graphql
# Queries
members(skip: Int, take: Int): [Member!]!
member(id: ID!): Member
membersCount: Int!

# Mutations
createMember(createMemberInput: CreateMemberInput!): Member!
updateMember(id: ID!, updateMemberInput: UpdateMemberInput!): Member!
removeMember(id: ID!): Boolean!
transferMember(id: ID!, fromBranchId: ID!, toBranchId: ID!, reason: String): Member!
addMemberToBranch(memberId: ID!, branchId: ID!): Member!
removeMemberFromBranch(memberId: ID!, branchId: ID!): Member!
updateMemberStatus(id: ID!, status: MemberStatus!, reason: String): Member!
```

### Spiritual Milestone Operations

```graphql
# Queries
spiritualMilestones(skip: Int, take: Int): [SpiritualMilestone!]!
spiritualMilestone(id: ID!): SpiritualMilestone
spiritualMilestonesByMember(memberId: ID!): [SpiritualMilestone!]!
spiritualMilestonesCount: Int!

# Mutations
createSpiritualMilestone(createSpiritualMilestoneInput: CreateSpiritualMilestoneInput!): SpiritualMilestone!
updateSpiritualMilestone(id: ID!, updateSpiritualMilestoneInput: UpdateSpiritualMilestoneInput!): SpiritualMilestone!
removeSpiritualMilestone(id: ID!): Boolean!
```

### Family Operations

```graphql
# Queries
families(skip: Int, take: Int): [Family!]!
family(id: ID!): Family
familiesCount: Int!
familyRelationships(skip: Int, take: Int): [FamilyRelationship!]!
familyRelationship(id: ID!): FamilyRelationship
familyRelationshipsByMember(memberId: ID!): [FamilyRelationship!]!
familyRelationshipsCount: Int!

# Mutations
createFamily(createFamilyInput: CreateFamilyInput!): Family!
updateFamily(id: ID!, updateFamilyInput: UpdateFamilyInput!): Family!
removeFamily(id: ID!): Boolean!
addMemberToFamily(familyId: ID!, memberId: ID!): Family!
removeMemberFromFamily(familyId: ID!, memberId: ID!): Family!
createFamilyRelationship(createFamilyRelationshipInput: CreateFamilyRelationshipInput!): FamilyRelationship!
updateFamilyRelationship(id: ID!, updateFamilyRelationshipInput: UpdateFamilyRelationshipInput!): FamilyRelationship!
removeFamilyRelationship(id: ID!): Boolean!
```

## Data Models

### Member

```typescript
class Member {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  dateOfBirth?: Date;
  gender?: Gender; // MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
  maritalStatus?: MaritalStatus; // SINGLE, MARRIED, DIVORCED, WIDOWED, SEPARATED, OTHER
  occupation?: string;
  employerName?: string;
  status: MemberStatus; // ACTIVE, INACTIVE, VISITOR, DECEASED, TRANSFERRED
  membershipDate?: Date;
  baptismDate?: Date;
  confirmationDate?: Date;
  statusChangeDate?: Date;
  statusChangeReason?: string;
  profileImageUrl?: string;
  customFields?: any;
  privacySettings?: any;
  notes?: string;
  branch?: Branch;
  branchId?: string;
  spouse?: Member;
  spouseId?: string;
  children?: Member[];
  parent?: Member;
  parentId?: string;
  spiritualMilestones?: SpiritualMilestone[];
  families?: Family[];
  createdAt: Date;
  updatedAt: Date;
}
```

### SpiritualMilestone

```typescript
class SpiritualMilestone {
  id: string;
  type: string; // BAPTISM, CONFIRMATION, SALVATION, HOLY_SPIRIT_BAPTISM, etc.
  date: Date;
  location?: string;
  description?: string;
  performedBy?: string;
  witnesses?: string[];
  attachments?: string[];
  notes?: string;
  member: Member;
  memberId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Family

```typescript
class Family {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  customFields?: any;
  members?: Member[];
  relationships?: FamilyRelationship[];
  createdAt: Date;
  updatedAt: Date;
}
```

### FamilyRelationship

```typescript
class FamilyRelationship {
  id: string;
  type: RelationshipType; // SPOUSE, PARENT, CHILD, SIBLING, etc.
  description?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  notes?: string;
  member: Member;
  memberId: string;
  relatedMember: Member;
  relatedMemberId: string;
  family?: Family;
  familyId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Audit Logging

All significant actions in the Member Management module are logged using the AuditLogService. This ensures accountability and provides a history of changes to member data.

## Security

The Member Management module integrates with the authentication and authorization system to ensure that only authorized users can access and modify member data.

## Integration Points

- **Branch Module**: Members can be assigned to branches
- **Audit Module**: Member actions are logged for accountability
- **Auth Module**: User authentication and authorization

## Future Enhancements

- **Advanced Search**: Implement advanced search capabilities for members
- **Bulk Operations**: Support for bulk import/export of member data
- **Custom Fields**: Enhanced support for custom fields
- **Member Portal**: Self-service portal for members to update their information

## Technical Notes

- The module uses Prisma ORM for database interactions
- GraphQL is used for the API layer
- NestJS provides the framework for the module
- TypeScript ensures type safety throughout the codebase
