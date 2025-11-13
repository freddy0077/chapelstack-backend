/**
 * Centralized Role, Module, and Permission Registry
 * Single source of truth for all role-based configurations
 * 
 * This registry defines:
 * - All system roles with metadata (permissions, dashboards, modules)
 * - All accessible modules with requirements
 * - All permissions with categories
 * 
 * @module auth/config/role-registry
 */

// ============================================
// INTERFACES
// ============================================

export interface PermissionMetadata {
  id: string;
  action: string;
  subject: string;
  description: string;
  category: 'members' | 'finances' | 'attendance' | 'communications' | 'administration' | 'pastoral';
}

export interface ModuleMetadata {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  path: string;
  requiredPermissions: string[];
  requiredRoles: string[];
  category?: string;
}

export interface RoleMetadata {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  level: number; // 1 = highest, 5 = lowest
  parent?: string; // Parent role for inheritance
  permissions: string[]; // Permission IDs
  dashboards: string[]; // Allowed dashboard types
  modules: string[]; // Accessible module IDs
  features: string[]; // Feature flags
  isSystem?: boolean; // Whether this is a system-defined role
}

// ============================================
// PERMISSION REGISTRY
// ============================================

export const PERMISSION_REGISTRY: Record<string, PermissionMetadata> = {
  // Members
  VIEW_MEMBERS: {
    id: 'VIEW_MEMBERS',
    action: 'view',
    subject: 'members',
    description: 'View member list and details',
    category: 'members',
  },
  MANAGE_MEMBERS: {
    id: 'MANAGE_MEMBERS',
    action: 'manage',
    subject: 'members',
    description: 'Create, update, delete members',
    category: 'members',
  },
  MANAGE_MEMBER_GROUPS: {
    id: 'MANAGE_MEMBER_GROUPS',
    action: 'manage',
    subject: 'member_groups',
    description: 'Manage member groups and ministries',
    category: 'members',
  },

  // Finances
  VIEW_FINANCES: {
    id: 'VIEW_FINANCES',
    action: 'view',
    subject: 'finances',
    description: 'View financial reports and data',
    category: 'finances',
  },
  MANAGE_FINANCES: {
    id: 'MANAGE_FINANCES',
    action: 'manage',
    subject: 'finances',
    description: 'Create and manage financial records',
    category: 'finances',
  },
  MANAGE_BUDGETS: {
    id: 'MANAGE_BUDGETS',
    action: 'manage',
    subject: 'budgets',
    description: 'Create and manage budgets',
    category: 'finances',
  },
  MANAGE_DONATIONS: {
    id: 'MANAGE_DONATIONS',
    action: 'manage',
    subject: 'donations',
    description: 'Manage donations and giving',
    category: 'finances',
  },

  // Attendance
  VIEW_ATTENDANCE: {
    id: 'VIEW_ATTENDANCE',
    action: 'view',
    subject: 'attendance',
    description: 'View attendance records',
    category: 'attendance',
  },
  MANAGE_ATTENDANCE: {
    id: 'MANAGE_ATTENDANCE',
    action: 'manage',
    subject: 'attendance',
    description: 'Create and manage attendance records',
    category: 'attendance',
  },

  // Communications
  VIEW_COMMUNICATIONS: {
    id: 'VIEW_COMMUNICATIONS',
    action: 'view',
    subject: 'communications',
    description: 'View communications and messages',
    category: 'communications',
  },
  MANAGE_COMMUNICATIONS: {
    id: 'MANAGE_COMMUNICATIONS',
    action: 'manage',
    subject: 'communications',
    description: 'Create and manage communications',
    category: 'communications',
  },
  MANAGE_AUTOMATIONS: {
    id: 'MANAGE_AUTOMATIONS',
    action: 'manage',
    subject: 'automations',
    description: 'Create and manage automations',
    category: 'communications',
  },
  MANAGE_BROADCASTS: {
    id: 'MANAGE_BROADCASTS',
    action: 'manage',
    subject: 'broadcasts',
    description: 'Create and manage broadcasts',
    category: 'communications',
  },
  MANAGE_ANNOUNCEMENTS: {
    id: 'MANAGE_ANNOUNCEMENTS',
    action: 'manage',
    subject: 'announcements',
    description: 'Create and manage announcements',
    category: 'communications',
  },

  // Administration
  MANAGE_USERS: {
    id: 'MANAGE_USERS',
    action: 'manage',
    subject: 'users',
    description: 'Create and manage users',
    category: 'administration',
  },
  MANAGE_ROLES: {
    id: 'MANAGE_ROLES',
    action: 'manage',
    subject: 'roles',
    description: 'Manage roles and permissions',
    category: 'administration',
  },
  MANAGE_PERMISSIONS: {
    id: 'MANAGE_PERMISSIONS',
    action: 'manage',
    subject: 'permissions',
    description: 'Manage permissions',
    category: 'administration',
  },
  MANAGE_AUDIT_LOGS: {
    id: 'MANAGE_AUDIT_LOGS',
    action: 'manage',
    subject: 'audit_logs',
    description: 'View and manage audit logs',
    category: 'administration',
  },
  MANAGE_SETTINGS: {
    id: 'MANAGE_SETTINGS',
    action: 'manage',
    subject: 'settings',
    description: 'Manage system settings',
    category: 'administration',
  },
  MANAGE_BRANCHES: {
    id: 'MANAGE_BRANCHES',
    action: 'manage',
    subject: 'branches',
    description: 'Manage branches',
    category: 'administration',
  },
  MANAGE_SUBSCRIPTIONS: {
    id: 'MANAGE_SUBSCRIPTIONS',
    action: 'manage',
    subject: 'subscriptions',
    description: 'Manage subscriptions',
    category: 'administration',
  },

  // Pastoral
  MANAGE_PASTORAL_CARE: {
    id: 'MANAGE_PASTORAL_CARE',
    action: 'manage',
    subject: 'pastoral_care',
    description: 'Manage pastoral care records',
    category: 'pastoral',
  },
  MANAGE_SACRAMENTS: {
    id: 'MANAGE_SACRAMENTS',
    action: 'manage',
    subject: 'sacraments',
    description: 'Manage sacraments',
    category: 'pastoral',
  },
  MANAGE_BIRTH_REGISTRY: {
    id: 'MANAGE_BIRTH_REGISTRY',
    action: 'manage',
    subject: 'birth_registry',
    description: 'Manage birth registry',
    category: 'pastoral',
  },
  MANAGE_DEATH_REGISTER: {
    id: 'MANAGE_DEATH_REGISTER',
    action: 'manage',
    subject: 'death_register',
    description: 'Manage death register',
    category: 'pastoral',
  },
};

// ============================================
// MODULE REGISTRY
// ============================================

export const MODULE_REGISTRY: Record<string, ModuleMetadata> = {
  dashboard: {
    id: 'dashboard',
    name: 'dashboard',
    displayName: 'Dashboard',
    description: 'Main dashboard',
    icon: 'HomeIcon',
    path: '/dashboard',
    requiredPermissions: [],
    requiredRoles: ['*'], // All roles
  },
  members: {
    id: 'members',
    name: 'members',
    displayName: 'Members',
    description: 'Member management',
    icon: 'UsersIcon',
    path: '/dashboard/members',
    requiredPermissions: ['VIEW_MEMBERS'],
    requiredRoles: ['ADMIN', 'BRANCH_ADMIN', 'PASTORAL_STAFF'],
  },
  groups: {
    id: 'groups',
    name: 'groups',
    displayName: 'Groups',
    description: 'Group management',
    icon: 'UserGroupIcon',
    path: '/dashboard/groups',
    requiredPermissions: ['MANAGE_MEMBER_GROUPS'],
    requiredRoles: ['ADMIN', 'BRANCH_ADMIN', 'MINISTRY_LEADER'],
  },
  events: {
    id: 'events',
    name: 'events',
    displayName: 'Events',
    description: 'Event management',
    icon: 'CalendarIcon',
    path: '/dashboard/calendar',
    requiredPermissions: [],
    requiredRoles: ['ADMIN', 'BRANCH_ADMIN', 'PASTORAL_STAFF', 'MINISTRY_LEADER'],
  },
  finances: {
    id: 'finances',
    name: 'finances',
    displayName: 'Finances',
    description: 'Financial management',
    icon: 'CurrencyDollarIcon',
    path: '/dashboard/finances',
    requiredPermissions: ['VIEW_FINANCES'],
    requiredRoles: ['ADMIN', 'BRANCH_ADMIN', 'FINANCE_MANAGER'],
  },
  attendance: {
    id: 'attendance',
    name: 'attendance',
    displayName: 'Attendance',
    description: 'Attendance tracking',
    icon: 'DocumentTextIcon',
    path: '/dashboard/attendance',
    requiredPermissions: ['VIEW_ATTENDANCE'],
    requiredRoles: ['ADMIN', 'BRANCH_ADMIN'],
  },
  communication: {
    id: 'communication',
    name: 'communication',
    displayName: 'Communication',
    description: 'Communication management',
    icon: 'ChatBubbleLeftRightIcon',
    path: '/dashboard/communication',
    requiredPermissions: ['VIEW_COMMUNICATIONS'],
    requiredRoles: ['ADMIN', 'BRANCH_ADMIN', 'PASTORAL_STAFF'],
  },
  pastoral_care: {
    id: 'pastoral_care',
    name: 'pastoral_care',
    displayName: 'Pastoral Care',
    description: 'Pastoral care management',
    icon: 'HeartIcon',
    path: '/dashboard/pastoral-care',
    requiredPermissions: ['MANAGE_PASTORAL_CARE'],
    requiredRoles: ['PASTORAL_STAFF', 'BRANCH_ADMIN'],
  },
  user_management: {
    id: 'user_management',
    name: 'user_management',
    displayName: 'User Management',
    description: 'User and role management',
    icon: 'ShieldCheckIcon',
    path: '/dashboard/user-management',
    requiredPermissions: ['MANAGE_USERS', 'MANAGE_ROLES'],
    requiredRoles: ['ADMIN', 'BRANCH_ADMIN'],
  },
  audits: {
    id: 'audits',
    name: 'audits',
    displayName: 'Audits',
    description: 'Audit logs',
    icon: 'ClipboardDocumentListIcon',
    path: '/dashboard/audits',
    requiredPermissions: ['MANAGE_AUDIT_LOGS'],
    requiredRoles: ['ADMIN', 'BRANCH_ADMIN'],
  },
  settings: {
    id: 'settings',
    name: 'settings',
    displayName: 'Settings',
    description: 'System settings',
    icon: 'Cog6ToothIcon',
    path: '/dashboard/settings',
    requiredPermissions: ['MANAGE_SETTINGS'],
    requiredRoles: ['ADMIN', 'BRANCH_ADMIN'],
  },
};

// ============================================
// ROLE REGISTRY
// ============================================

export const ROLE_REGISTRY: Record<string, RoleMetadata> = {
  GOD_MODE: {
    id: 'GOD_MODE',
    name: 'GOD_MODE',
    displayName: 'God Mode',
    description: 'Ultimate system access - full control over all organizations and features',
    icon: 'ShieldCheckIcon',
    color: 'red',
    level: 0, // Highest privilege level
    isSystem: true,
    permissions: Object.keys(PERMISSION_REGISTRY), // All permissions
    dashboards: ['ADMIN', 'ADMIN', 'FINANCE'],
    modules: Object.keys(MODULE_REGISTRY), // All modules
    features: ['*'], // All features
  },

  SYSTEM_ADMIN: {
    id: 'SYSTEM_ADMIN',
    name: 'SYSTEM_ADMIN',
    displayName: 'System Administrator',
    description: 'Full system access across all organizations',
    icon: 'ShieldCheckIcon',
    color: 'red',
    level: 1,
    isSystem: true,
    parent: 'GOD_MODE',
    permissions: Object.keys(PERMISSION_REGISTRY), // All permissions
    dashboards: ['ADMIN', 'ADMIN', 'FINANCE'],
    modules: Object.keys(MODULE_REGISTRY), // All modules
    features: ['*'], // All features
  },

  SUBSCRIPTION_MANAGER: {
    id: 'SUBSCRIPTION_MANAGER',
    name: 'SUBSCRIPTION_MANAGER',
    displayName: 'Subscription Manager',
    description: 'Manage subscriptions and organizations',
    icon: 'BuildingOfficeIcon',
    color: 'purple',
    level: 2,
    isSystem: true,
    parent: 'SYSTEM_ADMIN',
    permissions: [
      'MANAGE_SUBSCRIPTIONS',
      'MANAGE_BRANCHES',
      'VIEW_FINANCES',
    ],
    dashboards: ['ADMIN'],
    modules: ['dashboard'],
    features: ['subscriptions', 'organizations'],
  },

  BRANCH_ADMIN: {
    id: 'BRANCH_ADMIN',
    name: 'BRANCH_ADMIN',
    displayName: 'Branch Administrator',
    description: 'Full branch administration',
    icon: 'BuildingOfficeIcon',
    color: 'blue',
    level: 2,
    isSystem: true,
    parent: 'SYSTEM_ADMIN',
    permissions: [
      'MANAGE_MEMBERS',
      'VIEW_MEMBERS',
      'MANAGE_MEMBER_GROUPS',
      'MANAGE_FINANCES',
      'VIEW_FINANCES',
      'MANAGE_BUDGETS',
      'MANAGE_DONATIONS',
      'MANAGE_ATTENDANCE',
      'VIEW_ATTENDANCE',
      'MANAGE_COMMUNICATIONS',
      'VIEW_COMMUNICATIONS',
      'MANAGE_AUTOMATIONS',
      'MANAGE_BROADCASTS',
      'MANAGE_ANNOUNCEMENTS',
      'MANAGE_USERS',
      'MANAGE_AUDIT_LOGS',
      'MANAGE_SETTINGS',
      'MANAGE_PASTORAL_CARE',
      'MANAGE_SACRAMENTS',
      'MANAGE_BIRTH_REGISTRY',
      'MANAGE_DEATH_REGISTER',
    ],
    dashboards: ['BRANCH_ADMIN', 'ADMIN', 'FINANCE', 'PASTORAL'],
    modules: [
      'dashboard',
      'members',
      'groups',
      'events',
      'finances',
      'attendance',
      'communication',
      'pastoral_care',
      'user_management',
      'audits',
      'settings',
    ],
    features: [
      'announcements',
      'automations',
      'broadcasts',
      'reports',
      'pastoral_care',
    ],
  },

  ADMIN: {
    id: 'ADMIN',
    name: 'ADMIN',
    displayName: 'Administrator',
    description: 'Organization-level administration',
    icon: 'ShieldCheckIcon',
    color: 'blue',
    level: 3,
    isSystem: true,
    parent: 'SYSTEM_ADMIN',
    permissions: [
      'MANAGE_MEMBERS',
      'VIEW_MEMBERS',
      'MANAGE_MEMBER_GROUPS',
      'MANAGE_FINANCES',
      'VIEW_FINANCES',
      'MANAGE_ATTENDANCE',
      'VIEW_ATTENDANCE',
      'MANAGE_COMMUNICATIONS',
      'VIEW_COMMUNICATIONS',
      'MANAGE_AUTOMATIONS',
      'MANAGE_BROADCASTS',
      'MANAGE_ANNOUNCEMENTS',
      'MANAGE_USERS',
      'MANAGE_AUDIT_LOGS',
    ],
    dashboards: ['ADMIN', 'FINANCE'],
    modules: [
      'dashboard',
      'members',
      'groups',
      'events',
      'finances',
      'attendance',
      'communication',
      'user_management',
      'audits',
    ],
    features: ['announcements', 'automations', 'broadcasts', 'reports'],
  },

  FINANCE_MANAGER: {
    id: 'FINANCE_MANAGER',
    name: 'FINANCE_MANAGER',
    displayName: 'Finance Manager',
    description: 'Financial management',
    icon: 'CurrencyDollarIcon',
    color: 'green',
    level: 4,
    isSystem: true,
    parent: 'BRANCH_ADMIN',
    permissions: [
      'VIEW_FINANCES',
      'MANAGE_FINANCES',
      'MANAGE_BUDGETS',
      'MANAGE_DONATIONS',
    ],
    dashboards: ['FINANCE'],
    modules: ['finances', 'dashboard'],
    features: ['reports', 'budgets'],
  },

  PASTORAL_STAFF: {
    id: 'PASTORAL_STAFF',
    name: 'PASTORAL_STAFF',
    displayName: 'Pastoral Staff',
    description: 'Pastoral care and sacraments',
    icon: 'HeartIcon',
    color: 'pink',
    level: 4,
    isSystem: true,
    parent: 'BRANCH_ADMIN',
    permissions: [
      'VIEW_MEMBERS',
      'MANAGE_PASTORAL_CARE',
      'MANAGE_SACRAMENTS',
      'MANAGE_BIRTH_REGISTRY',
      'MANAGE_DEATH_REGISTRY',
      'VIEW_COMMUNICATIONS',
    ],
    dashboards: ['PASTORAL'],
    modules: ['pastoral', 'sacraments', 'dashboard'],
    features: ['pastoral_care', 'sacraments'],
  },

  MINISTRY_LEADER: {
    id: 'MINISTRY_LEADER',
    name: 'MINISTRY_LEADER',
    displayName: 'Ministry Leader',
    description: 'Ministry and group management',
    icon: 'UserGroupIcon',
    color: 'indigo',
    level: 4,
    isSystem: true,
    parent: 'PASTORAL_STAFF',
    permissions: [
      'VIEW_MEMBERS',
      'MANAGE_MEMBER_GROUPS',
      'VIEW_COMMUNICATIONS',
      'MANAGE_COMMUNICATIONS',
    ],
    dashboards: ['MEMBER'],
    modules: ['groups', 'events', 'dashboard'],
    features: ['groups', 'events'],
  },

  MEMBER: {
    id: 'MEMBER',
    name: 'MEMBER',
    displayName: 'Member',
    description: 'Basic member access',
    icon: 'UserIcon',
    color: 'gray',
    level: 5,
    isSystem: true,
    parent: 'MINISTRY_LEADER',
    permissions: [],
    dashboards: ['MEMBER'],
    modules: ['dashboard'],
    features: ['profile', 'events', 'groups'],
  },
};
// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get all permissions for a role, including inherited ones
 */
export function getRolePermissions(roleId: string, visited = new Set<string>()): string[] {
  // Prevent infinite recursion
  if (visited.has(roleId)) {
    return [];
  }

  const role = ROLE_REGISTRY[roleId];
  if (!role) return [];

  visited.add(roleId);
  let permissions = [...role.permissions];

  // Add inherited permissions from parent role
  if (role.parent) {
    const parentPermissions = getRolePermissions(role.parent, visited);
    permissions = [...new Set([...permissions, ...parentPermissions])];
  }

  return permissions;
}

/**
 * Get all modules for a role
 */
export function getRoleModules(roleId: string): string[] {
  const role = ROLE_REGISTRY[roleId];
  if (!role) return [];

  return role.modules;
}

/**
 * Check if role has permission
 */
export function roleHasPermission(roleId: string, permissionId: string): boolean {
  const permissions = getRolePermissions(roleId);
  return permissions.includes(permissionId) || permissions.includes('*');
}

/**
 * Check if role can access module
 */
export function roleCanAccessModule(roleId: string, moduleId: string): boolean {
  const modules = getRoleModules(roleId);
  return modules.includes(moduleId) || modules.includes('*');
}

/**
 * Get all roles at a specific level
 */
export function getRolesByLevel(level: number): RoleMetadata[] {
  return Object.values(ROLE_REGISTRY).filter((role) => role.level === level);
}

/**
 * Get role hierarchy (parent -> children)
 */
export function getRoleHierarchy(roleId: string): RoleMetadata[] {
  const hierarchy: RoleMetadata[] = [];
  let currentRole: RoleMetadata | undefined = ROLE_REGISTRY[roleId];

  while (currentRole) {
    hierarchy.unshift(currentRole);
    currentRole = currentRole.parent
      ? ROLE_REGISTRY[currentRole.parent]
      : undefined;
  }

  return hierarchy;
}

/**
 * Validate role hierarchy (no circular references)
 */
export function validateRoleHierarchy(): boolean {
  const visited = new Set<string>();

  for (const roleId of Object.keys(ROLE_REGISTRY)) {
    visited.clear();
    let currentRole: RoleMetadata | undefined = ROLE_REGISTRY[roleId];

    while (currentRole) {
      if (visited.has(currentRole.id)) {
        console.error(`Circular reference detected in role hierarchy: ${roleId}`);
        return false;
      }

      visited.add(currentRole.id);
      currentRole = currentRole.parent
        ? ROLE_REGISTRY[currentRole.parent]
        : undefined;
    }
  }

  return true;
}
