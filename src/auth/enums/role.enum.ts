/**
 * Updated Role Enum - Aligned with Role Registry
 * Removed: MODERATOR, USER (unused)
 * Added: BRANCH_ADMIN, FINANCE_MANAGER, PASTORAL_STAFF, MINISTRY_LEADER
 */
export enum Role {
  // System Roles
  GOD_MODE = 'GOD_MODE',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  ADMIN = 'ADMIN',
  SUBSCRIPTION_MANAGER = 'SUBSCRIPTION_MANAGER',

  // Branch Roles
  BRANCH_ADMIN = 'BRANCH_ADMIN',

  // Functional Roles
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  PASTORAL_STAFF = 'PASTORAL_STAFF',
  MINISTRY_LEADER = 'MINISTRY_LEADER',

  // Member Role
  MEMBER = 'MEMBER',
}

/**
 * Role levels for hierarchy
 * Lower number = higher privilege
 */
export const ROLE_LEVELS: Record<Role, number> = {
  [Role.GOD_MODE]: 0,
  [Role.SYSTEM_ADMIN]: 1,
  [Role.ADMIN]: 2,
  [Role.SUBSCRIPTION_MANAGER]: 2,
  [Role.BRANCH_ADMIN]: 3,
  [Role.FINANCE_MANAGER]: 4,
  [Role.PASTORAL_STAFF]: 4,
  [Role.MINISTRY_LEADER]: 5,
  [Role.MEMBER]: 6,
};

/**
 * Check if role A has higher privilege than role B
 */
export function hasHigherPrivilege(roleA: Role, roleB: Role): boolean {
  return ROLE_LEVELS[roleA] < ROLE_LEVELS[roleB];
}

/**
 * Get all roles
 */
export function getAllRoles(): Role[] {
  return Object.values(Role);
}
