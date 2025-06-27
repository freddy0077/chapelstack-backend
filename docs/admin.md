# System Administration Module (`admin.md`)

## 1. Overview

The System Administration module provides super administrators and authorized branch administrators with tools to manage overarching system configurations, user roles and permissions, audit logs, and other high-level administrative functions necessary for the smooth operation and security of the entire Church Management System.

## 2. Core Responsibilities

-   **User Account Management (Administrative)**: Broader user management beyond basic authentication, including inviting administrators, managing system-level user accounts (not necessarily members).
-   **Role & Permission Management**: Defining roles (e.g., SuperAdmin, BranchAdmin, FinanceManager, GroupLeader) and assigning specific permissions to these roles across different modules.
-   **Branch Management (Administrative)**: Creating new branches, configuring top-level branch settings, and managing branch administrators.
-   **Audit Logging**: Providing a comprehensive log of significant actions performed within the system (e.g., data modifications, security events, administrative changes) for accountability and troubleshooting.
-   **System Health Monitoring**: Dashboards or tools to monitor system performance, errors, and resource usage.
-   **Data Import/Export (Administrative)**: Tools for bulk importing or exporting data for system setup or migration (e.g., initial member import).
-   **Backup & Restore Management**: Interfacing with or managing system backup and restore procedures (may be handled at infrastructure level but configured/monitored here).
-   **License Management**: If applicable, managing software licenses or subscription details.
-   **System Announcements**: Posting global announcements visible to all users or specific roles.

## 3. Key Entities & Data Models

*(This module interacts heavily with User, Role, Permission entities from Authentication, and Branch entities. It might introduce `AuditLog`, `SystemNotification`.)*

```typescript
// Example Placeholder Schema (extending Auth module concepts)
// Roles and Permissions are central, likely defined in the Authentication module
// but managed extensively here.

model AuditLog {
  id          String    @id @default(cuid())
  timestamp   DateTime  @default(now())
  userId      String?   // User who performed the action
  // user     User?     @relation(fields: [userId], references: [id])
  action      String    // e.g., "USER_LOGIN_FAILED", "MEMBER_PROFILE_UPDATED", "BRANCH_CREATED"
  entityType  String?   // e.g., "Member", "Branch", "Payment"
  entityId    String?   // ID of the affected entity
  details     Json?     // Additional details, like old/new values
  ipAddress   String?
  branchId    String?   // Contextual branch if action is branch-specific
  // branch   Branch?   @relation(fields: [branchId], references: [id])
}

// Roles and Permissions would be similar to what's in authentication.md
// model Role { ... }
// model Permission { ... }
// model RolePermission { ... }
// model UserRole { ... }
```

## 4. Core Functionalities & Use Cases

-   SuperAdmin creates a new role "BranchFinanceManager" and assigns permissions to access financial reports and manage contributions for their assigned branch.
-   SuperAdmin invites a new user to be an administrator for a newly created branch.
-   Admin reviews the audit log to investigate an unauthorized data change.
-   Admin configures system-wide password complexity rules.
-   Admin initiates a bulk import of member data from a previous system.
-   BranchAdmin views a list of all users within their branch and their assigned roles.

## 5. API Endpoints

*(Detail the relevant GraphQL mutations/queries or REST API endpoints here. These are highly privileged.)*

### GraphQL (Example)

**Queries:**
-   `listUsers(filter: UserFilterInput): [User!]` (Admin version with more filters/data)
-   `userRoles(userId: ID!): [Role!]`
-   `listRoles: [Role!]`
-   `rolePermissions(roleId: ID!): [Permission!]`
-   `listPermissions: [Permission!]`
-   `auditLogs(filter: AuditLogFilterInput, pagination: PaginationInput): [AuditLog!]`
-   `systemHealthStatus: SystemHealth`

**Mutations:**
-   `createUser(input: CreateUserInput!): User` (Admin creating other users)
-   `assignRoleToUser(userId: ID!, roleId: ID!): User`
-   `revokeRoleFromUser(userId: ID!, roleId: ID!): User`
-   `createRole(input: CreateRoleInput!): Role`
-   `updateRole(id: ID!, input: UpdateRoleInput!): Role`
-   `addPermissionToRole(roleId: ID!, permissionId: ID!): Role`
-   `removePermissionFromRole(roleId: ID!, permissionId: ID!): Role`
-   `createBranchAdmin(branchId: ID!, userId: ID!): User` // Specific utility
-   `triggerDataBackup: Boolean`

## 6. Integration with Other Modules

-   **Authentication & User Management**: Deeply integrated for managing users, roles, and permissions.
-   **Branch Management**: For creating and managing branches at an administrative level.
-   **All Modules**: Audit logging captures actions from all modules. Permissions defined here control access to functionalities across all modules.
-   **Settings Module**: Some system-wide settings might be managed here if they are highly administrative (e.g., security configurations).

## 7. Security Considerations

-   **Highest Level of Privilege**: Access to this module must be extremely restricted to trusted super administrators.
-   **Principle of Least Privilege**: Even administrators should only have the permissions necessary for their tasks.
-   **Strong Authentication**: MFA should be mandatory for all administrative accounts.
-   **Secure Audit Logging**: Audit logs must be tamper-proof and comprehensive.
-   Regular review of administrative roles and permissions.

## 8. Future Considerations

-   More sophisticated alerting for critical system events or security breaches.
-   Delegated administration (e.g., allowing branch admins to manage certain roles within their branch only).
-   Integration with external identity providers (IdP) for administrative access.
-   Automated security scanning and reporting.
