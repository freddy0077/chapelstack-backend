import { SetMetadata, UseGuards } from '@nestjs/common';
import { CentralizedAuthGuard } from '../guards/centralized-auth.guard';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import {
  REQUIRED_ROLES_KEY,
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_MODULES_KEY,
  REQUIRE_ALL_KEY,
} from '../guards/centralized-auth.guard';

/**
 * Options for @RequireAccess decorator
 */
export interface RequireAccessOptions {
  /**
   * Required roles (user must have one of these)
   */
  roles?: string[];

  /**
   * Required permissions (user must have one of these)
   */
  permissions?: string[];

  /**
   * Required modules (user must have access to one of these)
   */
  modules?: string[];

  /**
   * If true, user must have ALL requirements
   * If false, user must have ANY requirement
   * Default: true
   */
  requireAll?: boolean;
}

/**
 * Decorator for centralized access control
 * Combines role, permission, and module checks
 * 
 * @example
 * ```typescript
 * // Require specific role
 * @RequireAccess({ roles: ['ADMIN'] })
 * 
 * // Require specific permission
 * @RequireAccess({ permissions: ['MANAGE_MEMBERS'] })
 * 
 * // Require module access
 * @RequireAccess({ modules: ['members'] })
 * 
 * // Require multiple (AND logic)
 * @RequireAccess({
 *   roles: ['ADMIN'],
 *   permissions: ['MANAGE_MEMBERS'],
 *   modules: ['members'],
 *   requireAll: true
 * })
 * 
 * // Require any of multiple (OR logic)
 * @RequireAccess({
 *   roles: ['ADMIN', 'BRANCH_ADMIN'],
 *   requireAll: false
 * })
 * ```
 */
export function RequireAccess(options: RequireAccessOptions) {
  return function (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
    // Set metadata for each requirement
    if (options.roles && options.roles.length > 0) {
      SetMetadata(REQUIRED_ROLES_KEY, options.roles)(
        target,
        propertyKey || '',
        descriptor as any,
      );
    }

    if (options.permissions && options.permissions.length > 0) {
      SetMetadata(REQUIRED_PERMISSIONS_KEY, options.permissions)(
        target,
        propertyKey || '',
        descriptor as any,
      );
    }

    if (options.modules && options.modules.length > 0) {
      SetMetadata(REQUIRED_MODULES_KEY, options.modules)(
        target,
        propertyKey || '',
        descriptor as any,
      );
    }

    // Set requireAll flag
    if (options.requireAll !== undefined) {
      SetMetadata(REQUIRE_ALL_KEY, options.requireAll)(
        target,
        propertyKey || '',
        descriptor as any,
      );
    }

    // Apply guards - JWT auth first, then centralized auth
    UseGuards(GqlAuthGuard, CentralizedAuthGuard)(target, propertyKey || '', descriptor as any);
  };
}

/**
 * Decorator for role-based access control only
 * 
 * @example
 * ```typescript
 * @RequireRoles('ADMIN', 'BRANCH_ADMIN')
 * async getMembers() { }
 * ```
 */
export function RequireRoles(...roles: string[]) {
  return RequireAccess({ roles, requireAll: false });
}

/**
 * Decorator for permission-based access control only
 * 
 * @example
 * ```typescript
 * @RequirePermissions('MANAGE_MEMBERS', 'VIEW_MEMBERS')
 * async getMembers() { }
 * ```
 */
export function RequirePermissions(...permissions: string[]) {
  return RequireAccess({ permissions, requireAll: false });
}

/**
 * Decorator for module-based access control only
 * 
 * @example
 * ```typescript
 * @RequireModules('members', 'groups')
 * async getMembers() { }
 * ```
 */
export function RequireModules(...modules: string[]) {
  return RequireAccess({ modules, requireAll: false });
}
