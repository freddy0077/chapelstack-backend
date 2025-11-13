import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RoleRegistryService } from '../services/role-registry.service';

/**
 * Metadata keys for centralized auth guard
 */
export const REQUIRED_ROLES_KEY = 'requiredRoles';
export const REQUIRED_PERMISSIONS_KEY = 'requiredPermissions';
export const REQUIRED_MODULES_KEY = 'requiredModules';
export const REQUIRE_ALL_KEY = 'requireAll';

/**
 * Centralized authentication guard
 * Combines role, permission, and module checks
 * Supports flexible AND/OR logic
 * 
 * @class CentralizedAuthGuard
 */
@Injectable()
export class CentralizedAuthGuard implements CanActivate {
  private readonly logger = new Logger(CentralizedAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private roleRegistry: RoleRegistryService,
  ) {}

  /**
   * Determine if request can proceed
   */
  canActivate(context: ExecutionContext): boolean {
    // Get metadata from decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredModules = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_MODULES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requireAll = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_ALL_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? true;

    // If no requirements, allow access
    if (!requiredRoles && !requiredPermissions && !requiredModules) {
      return true;
    }

    // Get user from request
    const user = this.getUser(context);
    if (!user) {
      this.logger.warn('No user found in request context');
      throw new ForbiddenException('User not authenticated');
    }

    // Get user roles
    const userRoles = this.getUserRoles(user);
    if (!userRoles || userRoles.length === 0) {
      this.logger.warn(`User ${user.id} has no roles`);
      throw new ForbiddenException('User has no roles assigned');
    }

    // Validate access
    return this.validateAccess(
      user,
      userRoles,
      requiredRoles,
      requiredPermissions,
      requiredModules,
      requireAll,
    );
  }

  /**
   * Get user from request context
   */
  private getUser(context: ExecutionContext): any {
    const contextType = context.getType() as string;

    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      return gqlContext.getContext().req?.user;
    }

    // HTTP context
    return context.switchToHttp().getRequest().user;
  }

  /**
   * Get user roles
   */
  private getUserRoles(user: any): string[] {
    if (!user) return [];

    // If user has roles array
    if (Array.isArray(user.roles)) {
      return user.roles.map((role: any) =>
        typeof role === 'string' ? role : role.name,
      );
    }

    // If user has single role
    if (user.role) {
      return [user.role];
    }

    return [];
  }

  /**
   * Validate access based on requirements
   */
  private validateAccess(
    user: any,
    userRoles: string[],
    requiredRoles?: string[],
    requiredPermissions?: string[],
    requiredModules?: string[],
    requireAll: boolean = true,
  ): boolean {
    this.logger.debug(
      `Validating access for user ${user.id} with roles: ${userRoles.join(', ')}`,
    );

    // Check roles
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requireAll
        ? requiredRoles.every((role) => userRoles.includes(role))
        : requiredRoles.some((role) => userRoles.includes(role));

      if (!hasRequiredRole) {
        this.logger.warn(
          `User ${user.id} missing required roles: ${requiredRoles.join(', ')}`,
        );
        throw new ForbiddenException(
          `User does not have required roles: ${requiredRoles.join(', ')}`,
        );
      }

      this.logger.debug(`User ${user.id} has required roles`);
    }

    // Check permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasRequiredPermissions = requireAll
        ? requiredPermissions.every((perm) =>
            userRoles.some((role) =>
              this.roleRegistry.hasPermission(role, perm),
            ),
          )
        : requiredPermissions.some((perm) =>
            userRoles.some((role) =>
              this.roleRegistry.hasPermission(role, perm),
            ),
          );

      if (!hasRequiredPermissions) {
        this.logger.warn(
          `User ${user.id} missing required permissions: ${requiredPermissions.join(', ')}`,
        );
        throw new ForbiddenException(
          `User does not have required permissions: ${requiredPermissions.join(', ')}`,
        );
      }

      this.logger.debug(`User ${user.id} has required permissions`);
    }

    // Check modules
    if (requiredModules && requiredModules.length > 0) {
      const hasRequiredModules = requireAll
        ? requiredModules.every((module) =>
            this.roleRegistry.canUserAccessModule(userRoles, module),
          )
        : requiredModules.some((module) =>
            this.roleRegistry.canUserAccessModule(userRoles, module),
          );

      if (!hasRequiredModules) {
        this.logger.warn(
          `User ${user.id} cannot access required modules: ${requiredModules.join(', ')}`,
        );
        throw new ForbiddenException(
          `User cannot access required modules: ${requiredModules.join(', ')}`,
        );
      }

      this.logger.debug(`User ${user.id} can access required modules`);
    }

    this.logger.debug(`Access granted for user ${user.id}`);
    return true;
  }
}
