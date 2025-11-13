import { Injectable, Logger } from '@nestjs/common';
import {
  ROLE_REGISTRY,
  MODULE_REGISTRY,
  PERMISSION_REGISTRY,
  getRolePermissions,
  getRoleModules,
  roleHasPermission,
  roleCanAccessModule,
  RoleMetadata,
  ModuleMetadata,
  PermissionMetadata,
} from '../config/role-registry';

/**
 * Service for managing roles, permissions, and modules
 * Provides caching and utility methods for role-based access control
 * 
 * @class RoleRegistryService
 */
@Injectable()
export class RoleRegistryService {
  private readonly logger = new Logger(RoleRegistryService.name);
  private roleCache = new Map<string, RoleMetadata>();
  private permissionCache = new Map<string, string[]>();

  constructor() {
    this.initializeCache();
  }

  /**
   * Initialize caches on service startup
   */
  private initializeCache(): void {
    // Cache all roles
    Object.entries(ROLE_REGISTRY).forEach(([roleId, role]) => {
      this.roleCache.set(roleId, role);
      this.permissionCache.set(roleId, getRolePermissions(roleId));
    });

    this.logger.log(`Initialized role registry with ${this.roleCache.size} roles`);
  }

  /**
   * Get role metadata
   * @param roleId - Role identifier
   * @returns Role metadata or null if not found
   */
  getRoleMetadata(roleId: string): RoleMetadata | null {
    return this.roleCache.get(roleId) || null;
  }

  /**
   * Get all roles
   * @returns Array of all role metadata
   */
  getAllRoles(): RoleMetadata[] {
    return Array.from(this.roleCache.values());
  }

  /**
   * Get role permissions (including inherited)
   * @param roleId - Role identifier
   * @returns Array of permission metadata
   */
  getRolePermissions(roleId: string): PermissionMetadata[] {
    const permissionIds = this.permissionCache.get(roleId) || [];
    return permissionIds
      .map((id) => PERMISSION_REGISTRY[id])
      .filter((p) => p !== undefined);
  }

  /**
   * Get role modules
   * @param roleId - Role identifier
   * @returns Array of module metadata
   */
  getRoleModules(roleId: string): ModuleMetadata[] {
    const role = this.getRoleMetadata(roleId);
    if (!role) return [];

    return role.modules
      .map((id) => MODULE_REGISTRY[id])
      .filter((m) => m !== undefined);
  }

  /**
   * Check if role has permission
   * @param roleId - Role identifier
   * @param permissionId - Permission identifier
   * @returns True if role has permission
   */
  hasPermission(roleId: string, permissionId: string): boolean {
    const permissions = this.permissionCache.get(roleId) || [];
    return permissions.includes(permissionId) || permissions.includes('*');
  }

  /**
   * Check if role can access module
   * @param roleId - Role identifier
   * @param moduleId - Module identifier
   * @returns True if role can access module
   */
  canAccessModule(roleId: string, moduleId: string): boolean {
    return roleCanAccessModule(roleId, moduleId);
  }

  /**
   * Get accessible modules for role
   * @param roleId - Role identifier
   * @returns Array of accessible module metadata
   */
  getAccessibleModules(roleId: string): ModuleMetadata[] {
    const role = this.getRoleMetadata(roleId);
    if (!role) return [];

    return role.modules
      .map((id) => MODULE_REGISTRY[id])
      .filter((m) => m !== undefined);
  }

  /**
   * Get module by path
   * @param path - Module path
   * @returns Module metadata or null if not found
   */
  getModuleByPath(path: string): ModuleMetadata | null {
    for (const module of Object.values(MODULE_REGISTRY)) {
      if (module.path === path) {
        return module;
      }
    }
    return null;
  }

  /**
   * Check if user can access module based on roles
   * @param userRoles - Array of user role identifiers
   * @param moduleId - Module identifier
   * @returns True if user can access module
   */
  canUserAccessModule(
    userRoles: string[],
    moduleId: string,
  ): boolean {
    const module = MODULE_REGISTRY[moduleId];
    if (!module) return false;

    // Check role requirements
    if (module.requiredRoles.length > 0 && module.requiredRoles[0] !== '*') {
      const hasRequiredRole = userRoles.some((role) =>
        module.requiredRoles.includes(role),
      );
      if (!hasRequiredRole) return false;
    }

    // Check permission requirements
    if (module.requiredPermissions.length > 0) {
      const hasAllPermissions = userRoles.some((role) =>
        module.requiredPermissions.every((perm) =>
          this.hasPermission(role, perm),
        ),
      );
      if (!hasAllPermissions) return false;
    }

    return true;
  }

  /**
   * Get all permissions for a role
   * @param roleId - Role identifier
   * @returns Array of permission metadata
   */
  getAllPermissionsForRole(roleId: string): PermissionMetadata[] {
    const permissionIds = this.permissionCache.get(roleId) || [];
    return permissionIds
      .map((id) => PERMISSION_REGISTRY[id])
      .filter((p) => p !== undefined);
  }

  /**
   * Get role hierarchy
   * @param roleId - Role identifier
   * @returns Array of role metadata from root to specified role
   */
  getRoleHierarchy(roleId: string): RoleMetadata[] {
    const hierarchy: RoleMetadata[] = [];
    let currentRole = this.getRoleMetadata(roleId);

    while (currentRole) {
      hierarchy.unshift(currentRole);
      currentRole = currentRole.parent
        ? this.getRoleMetadata(currentRole.parent)
        : null;
    }

    return hierarchy;
  }

  /**
   * Validate role hierarchy
   * @returns True if hierarchy is valid (no circular references)
   */
  validateRoleHierarchy(): boolean {
    const visited = new Set<string>();

    for (const roleId of Object.keys(ROLE_REGISTRY)) {
      visited.clear();
      let currentRole = this.getRoleMetadata(roleId);

      while (currentRole) {
        if (visited.has(currentRole.id)) {
          this.logger.error(
            `Circular reference detected in role hierarchy: ${roleId}`,
          );
          return false;
        }

        visited.add(currentRole.id);
        currentRole = currentRole.parent
          ? this.getRoleMetadata(currentRole.parent)
          : null;
      }
    }

    return true;
  }

  /**
   * Get system configuration for frontend
   * @returns Object containing roles, modules, and permissions
   */
  getSystemConfig() {
    return {
      roles: ROLE_REGISTRY,
      modules: MODULE_REGISTRY,
      permissions: PERMISSION_REGISTRY,
    };
  }

  /**
   * Get all permissions
   * @returns Array of all permission metadata
   */
  getAllPermissions(): PermissionMetadata[] {
    return Object.values(PERMISSION_REGISTRY);
  }

  /**
   * Get all modules
   * @returns Array of all module metadata
   */
  getAllModules(): ModuleMetadata[] {
    return Object.values(MODULE_REGISTRY);
  }

  /**
   * Get permissions by category for all roles
   * @param category - Permission category
   * @returns Array of permission metadata for category
   */
  getPermissionsByCategory(category: string): PermissionMetadata[] {
    return Object.values(PERMISSION_REGISTRY).filter(
      (p) => p.category === category,
    );
  }

  /**
   * Get roles by level
   * @param level - Role level (1 = highest, 5 = lowest)
   * @returns Array of role metadata at specified level
   */
  getRolesByLevel(level: number): RoleMetadata[] {
    return this.getAllRoles().filter((role) => role.level === level);
  }

  /**
   * Check if role A has higher privilege than role B
   * @param roleAId - First role identifier
   * @param roleBId - Second role identifier
   * @returns True if role A has higher privilege
   */
  hasHigherPrivilege(roleAId: string, roleBId: string): boolean {
    const roleA = this.getRoleMetadata(roleAId);
    const roleB = this.getRoleMetadata(roleBId);

    if (!roleA || !roleB) return false;

    return roleA.level < roleB.level;
  }
}
