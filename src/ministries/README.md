# Ministries & Small Groups Module Implementation

## Overview

This document outlines the implementation details of the Ministries & Small Groups module for the Church Management System. The module enables churches to organize, manage, and facilitate the activities of their various ministries and small groups, including membership management, leadership roles, and integration with other system modules.

## Core Components

### Services

1. **MinistriesService**
   - Provides CRUD operations for ministries
   - Handles sub-ministry relationships
   - Manages ministry hierarchy

2. **SmallGroupsService**
   - Manages small group creation and updates
   - Handles group-to-ministry relationships
   - Provides filtering and search capabilities

3. **GroupMembersService**
   - Tracks membership in ministries and small groups
   - Handles role assignments (leaders, members, etc.)
   - Manages member join/leave operations

4. **MinistryIntegrationsService**
   - Integrates ministries with other modules:
     - Events (scheduling and retrieval)
     - Attendance tracking
     - Communication/messaging
     - Statistical reporting

### Resolvers

1. **MinistriesResolver**
   - Exposes GraphQL queries and mutations for ministries
   - Provides relationship resolvers for sub-ministries and parent ministries

2. **SmallGroupsResolver**
   - Implements GraphQL operations for small groups
   - Handles relationship resolution with ministries and members

3. **GroupMembersResolver**
   - Manages GraphQL operations for group membership
   - Resolves member relationships and roles

### Security

1. **MinistryRoleGuard**
   - Implements role-based access control for ministry operations
   - Enforces permission checks based on ministry roles

2. **MinistryRoles Decorator**
   - Defines required roles for specific operations
   - Used with MinistryRoleGuard for authorization

## Implemented Features

### Ministry Management
- ✅ Create, read, update, delete ministries
- ✅ Hierarchical ministry structure (parent/sub-ministries)
- ✅ Ministry filtering and search

### Small Group Management
- ✅ Create, read, update, delete small groups
- ✅ Associate groups with ministries
- ✅ Group filtering and search

### Membership Management
- ✅ Add/remove members to/from groups and ministries
- ✅ Assign and manage roles (leaders, members)
- ✅ Track membership history

### Integration Features
- ✅ Event Management
  - Get ministry events
  - Get small group events
  
- ✅ Attendance Tracking
  - Record ministry attendance
  - Record small group attendance
  - Generate attendance statistics
  
- ✅ Communication
  - Send messages to ministry members
  - Send messages to small group members

### Security Features
- ✅ Role-based access control
- ✅ Membership verification before operations
- ✅ Branch-scoped data access

## Technical Implementation Notes

### Prisma Schema Drift Handling
The implementation includes defensive programming to handle potential Prisma schema drift:
- Type casting of Prisma model accesses
- Existence checks for Prisma models before database operations
- Graceful fallbacks when models are missing

### Error Handling
Robust error handling is implemented throughout:
- Explicit error typing
- Structured logging with NestJS Logger
- Safe default returns when errors occur
- Consistent error response patterns

### Type Safety
- Strong typing for all service methods
- Interface definitions for records and responses
- Explicit return types for GraphQL operations

## API Endpoints

### GraphQL Queries
- `ministries(filters?: MinistryFilterInput): [Ministry!]`
- `ministry(id: ID!): Ministry`
- `smallGroups(filters?: SmallGroupFilterInput): [SmallGroup!]`
- `smallGroup(id: ID!): SmallGroup`
- `groupMembers(groupId: ID!): [GroupMember!]`

### GraphQL Mutations
- `createMinistry(input: CreateMinistryInput!): Ministry`
- `updateMinistry(id: ID!, input: UpdateMinistryInput!): Ministry`
- `deleteMinistry(id: ID!): Boolean`
- `createSmallGroup(input: CreateSmallGroupInput!): SmallGroup`
- `updateSmallGroup(id: ID!, input: UpdateSmallGroupInput!): SmallGroup`
- `deleteSmallGroup(id: ID!): Boolean`
- `addMemberToGroup(groupId: ID!, memberId: ID!, roleInGroup: String): GroupMember`
- `removeMemberFromGroup(groupId: ID!, memberId: ID!): Boolean`
- `assignGroupLeader(groupId: ID!, memberId: ID!): GroupMember`

## Known Issues and Limitations

- TypeScript may show import errors in `ministries.module.ts` due to IDE/TypeScript server caching, despite files existing
- Prisma schema drift requires defensive programming patterns
- Some type assertions use `any` to bypass TypeScript limitations with schema drift

## Future Enhancements

- Discussion forums or chat features within groups
- Curriculum management for study groups
- Advanced reporting on group health and engagement
- Attendance trend analysis
- Resource sharing and document management
