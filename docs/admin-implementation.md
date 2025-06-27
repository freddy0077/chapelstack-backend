# Admin Module Implementation

## Overview

The Admin Module provides a comprehensive set of administrative tools for managing the Church Management System. It implements features for user account management, role and permission management, audit logging, system health monitoring, system announcements, data import/export, backup & restore management, and license management. This module is designed to be used by super administrators and authorized branch administrators.

## Core Features Implemented

### 1. Audit Logging

The Audit Log system tracks significant actions performed within the application, providing accountability and traceability.

#### Data Model

The `AuditLog` entity includes:

- `id`: Unique identifier
- `action`: The action performed (e.g., "create", "update", "delete", "login")
- `entityType`: The type of entity acted upon (e.g., "User", "Branch", "Setting")
- `entityId`: Optional ID of the entity being acted upon
- `description`: Human-readable description of the action
- `metadata`: Optional JSON data with additional details about the action
- `ipAddress`: Optional IP address of the user who performed the action
- `userAgent`: Optional user agent information
- `userId`: Optional ID of the user who performed the action
- `branchId`: Optional ID of the branch context

### 2. User Account Management

Administrative user management provides tools for managing user accounts across the system.

#### Features

- Create, update, and delete user accounts
- Assign and revoke roles
- Filter and search users
- Manage user status (active/inactive)
- View user activity and audit logs

### 3. Role & Permission Management

Manages roles and permissions throughout the system, controlling access to various features.

#### Features

- Create and manage roles
- Define and assign permissions to roles
- Manage role-permission relationships
- Assign roles to users

### 4. System Health Monitoring

Provides tools to monitor the health and performance of the system.

#### Features

- System status dashboard
- Performance metrics
- Error monitoring
- Resource usage tracking

### 5. System Announcements

Allows administrators to create and manage system-wide announcements.

#### Features

- Create, update, and delete announcements
- Target announcements to specific user roles or branches
- Schedule announcements with start and end dates

### 6. Data Import/Export

Provides tools for bulk importing and exporting data for system setup or migration.

#### Data Model

The `DataOperation` entity includes:

- `id`: Unique identifier
- `type`: Type of operation (IMPORT or EXPORT)
- `status`: Status of the operation (PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED)
- `entityType`: The type of entity being imported/exported
- `description`: Description of the operation
- `metadata`: Additional details about the operation
- `filePath`: Path to the import/export file
- `fileSize`: Size of the file in bytes
- `recordCount`: Number of records processed
- `errorCount`: Number of errors encountered
- `errors`: Detailed error information
- `userId`: ID of the user who initiated the operation
- `createdAt`: When the operation was created
- `completedAt`: When the operation was completed

#### Features

- Import data from CSV files
- Export data to CSV files
- Track import/export operations
- Handle errors during import/export
- Support for various entity types (members, users, etc.)

### 7. Backup & Restore Management

Provides tools for managing system backups and restores.

#### Data Model

The `Backup` entity includes:

- `id`: Unique identifier
- `type`: Type of backup (FULL, INCREMENTAL, SCHEDULED, MANUAL)
- `status`: Status of the operation (PENDING, IN_PROGRESS, COMPLETED, FAILED)
- `description`: Description of the backup
- `metadata`: Additional details about the backup
- `filePath`: Path to the backup file
- `fileSize`: Size of the backup in bytes
- `duration`: Time taken to complete the backup in milliseconds
- `errorDetails`: Detailed error information if the backup failed
- `userId`: ID of the user who initiated the backup
- `createdAt`: When the backup was created
- `completedAt`: When the backup was completed

#### Features

- Create manual backups
- Restore from existing backups
- Track backup and restore operations
- Manage backup files
- PostgreSQL database backup and restore

### 8. License Management

Provides tools for managing software licenses and subscription details.

#### Data Model

The `License` entity includes:

- `id`: Unique identifier
- `key`: License key
- `type`: Type of license (BASIC, STANDARD, PREMIUM, ENTERPRISE)
- `status`: Status of the license (ACTIVE, EXPIRED, PENDING, CANCELLED)
- `startDate`: When the license becomes active
- `expiryDate`: When the license expires
- `organizationName`: Name of the organization
- `contactEmail`: Contact email for license matters
- `contactPhone`: Contact phone number
- `features`: Features enabled by this license
- `maxUsers`: Maximum number of users allowed
- `maxBranches`: Maximum number of branches allowed
- `notes`: Additional notes about the license
- `createdAt`: When the license was created
- `updatedAt`: When the license was last updated

#### Features

- Create and manage licenses
- Track license status and expiration
- Validate current license
- Generate license keys
- Manage organization license details
- `createdAt`: Timestamp when the log was created

#### Core Functionality

- **Create Audit Logs**: Record actions performed in the system
- **Query Audit Logs**: Retrieve and filter audit logs with pagination
- **View Audit Log Details**: Get detailed information about a specific audit log entry

### 2. User Account Management

Administrative functions for managing user accounts across the system.

#### Core Functionality

- **List Users**: Retrieve users with pagination and filtering options
- **View User Details**: Get detailed information about a specific user
- **Activate/Deactivate Users**: Control user access to the system
- **Assign System Roles**: Grant system-wide roles to users
- **Remove System Roles**: Revoke system-wide roles from users
- **Assign Branch Roles**: Grant branch-specific roles to users
- **Remove Branch Roles**: Revoke branch-specific roles from users

### 3. Role & Permission Management

Comprehensive tools for managing roles and permissions throughout the system.

#### Core Functionality

- **Create Roles**: Define new roles in the system
- **List Roles**: View all available roles
- **Update Roles**: Modify existing role details
- **Delete Roles**: Remove unused roles
- **Create Permissions**: Define new permissions
- **List Permissions**: View all available permissions
- **Update Permissions**: Modify existing permission details
- **Delete Permissions**: Remove unused permissions
- **Assign Permissions to Roles**: Configure which permissions each role has
- **Remove Permissions from Roles**: Revoke permissions from roles

### 4. System Health Monitoring

Tools for monitoring the health and performance of the system.

#### Core Functionality

- **System Health Dashboard**: View real-time information about:
  - Database status and latency
  - Memory usage
  - CPU usage
  - System and process uptime
  - Platform and Node.js version information

### 5. System Announcements

Functionality for creating and managing system-wide announcements.

#### Core Functionality

- **Create Announcements**: Post announcements visible to users
- **Target Announcements**: Specify which roles or branches should see announcements
- **Schedule Announcements**: Set start and end dates for announcements
- **Update Announcements**: Modify existing announcement content or targeting
- **Delete Announcements**: Remove announcements from the system

## GraphQL API

### Audit Log API

```graphql
# Queries
auditLog(id: ID!): AuditLog
auditLogs(pagination: PaginationInput, filter: AuditLogFilterInput): [AuditLog!]

# Mutations
createAuditLog(input: CreateAuditLogInput!): AuditLog
```

### User Admin API

```graphql
# Queries
adminUsers(pagination: PaginationInput, filter: UserFilterInput): PaginatedUsers
adminUser(id: ID!): User

# Mutations
updateUserActiveStatus(id: ID!, isActive: Boolean!): User
assignRoleToUser(userId: ID!, roleId: ID!): User
removeRoleFromUser(userId: ID!, roleId: ID!): User
assignBranchRoleToUser(userId: ID!, branchId: ID!, roleId: ID!, assignedBy: ID): UserBranch
removeBranchRoleFromUser(userId: ID!, branchId: ID!, roleId: ID!): UserBranch
```

### Role & Permission API

```graphql
# Queries
adminRoles: [Role!]
adminRole(id: ID!): Role
adminPermissions: [Permission!]
adminPermission(id: ID!): Permission

# Mutations
createRole(input: CreateRoleInput!): Role
updateRole(id: ID!, input: UpdateRoleInput!): Role
deleteRole(id: ID!): Role
createPermission(input: CreatePermissionInput!): Permission
updatePermission(id: ID!, input: UpdatePermissionInput!): Permission
deletePermission(id: ID!): Permission
assignPermissionToRole(roleId: ID!, permissionId: ID!): Role
removePermissionFromRole(roleId: ID!, permissionId: ID!): Role
```

### System Admin API

```graphql
# Queries
systemHealth: SystemHealth
announcements(branchId: ID): [Announcement!]

# Mutations
createAnnouncement(input: CreateAnnouncementInput!): Announcement
updateAnnouncement(id: ID!, input: UpdateAnnouncementInput!): Announcement
deleteAnnouncement(id: ID!): Announcement
```

## Security & Access Control

The Admin Module implements robust security measures:

- **Role-Based Access Control**: All administrative functions are protected by role-based guards
- **Granular Permissions**: Different administrative functions require different roles
  - `SUPER_ADMIN`: Has access to all administrative functions
  - `SYSTEM_ADMIN`: Has access to most administrative functions except critical role/permission management
  - `BRANCH_ADMIN`: Has limited access to branch-specific administrative functions

## Technical Implementation Details

- **Prisma ORM**: Used for database interactions
- **GraphQL API**: All functionality exposed through GraphQL resolvers
- **Type Safety**: Comprehensive DTOs and input validation
- **Error Handling**: Proper exception handling for not found and conflict scenarios
- **Pagination**: Support for paginated results with filtering

## Integration with Other Modules

The Admin Module integrates with several other modules:

- **Auth Module**: For user authentication and role-based access control
- **Branches Module**: For branch-specific administrative functions
- **Settings Module**: For storing system announcements and configuration

## Usage Examples

### Recording an Audit Log

```typescript
await auditLogService.create({
  action: 'create',
  entityType: 'User',
  entityId: 'user-123',
  description: 'Created new user account',
  userId: 'admin-456',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});
```

### Assigning a Role to a User

```typescript
await userAdminService.assignRoleToUser('user-123', 'role-456');
```

### Creating a System Announcement

```typescript
await systemAdminService.createAnnouncement(
  'System Maintenance',
  'The system will be down for maintenance on Saturday from 2-4 AM.',
  new Date('2025-06-01T00:00:00Z'),
  new Date('2025-06-07T23:59:59Z'),
  ['role-branch-admin'], // Target specific roles
  ['branch-123', 'branch-456'] // Target specific branches
);
```

## Future Enhancements

The current implementation provides a solid foundation for the Admin Module. Future enhancements could include:

1. **Enhanced Dashboard**: More detailed system health metrics and visualizations
2. **Bulk User Management**: Tools for managing multiple users at once
3. **Data Import/Export**: Tools for bulk importing or exporting data
4. **Backup & Restore**: Functionality for managing system backups
5. **Advanced Audit Log Analysis**: Tools for analyzing audit logs for security or usage patterns
6. **Multi-factor Authentication Management**: Administrative tools for managing MFA settings
7. **License Management**: Tools for managing software licenses or subscription details
