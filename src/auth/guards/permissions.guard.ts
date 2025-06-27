import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import {
  PERMISSIONS_KEY,
  PermissionDef,
} from '../decorators/permissions.decorator';

// Define interfaces for better type safety
export interface RoleWithPermissions {
  name: string;
  permissions?: PermissionDef[]; // Permissions might be missing until JWT strategy is fixed
}

export interface UserFromRequest {
  id?: string;
  email?: string;
  roles?: RoleWithPermissions[];
}

// Define an interface for the GraphQL context that includes the request object with a user
interface GqlContextWithUser {
  req: {
    user?: UserFromRequest;
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    let requiredPermissionsSet: PermissionDef[]; // Will hold the processed array of permissions

    const rawPermissionsFromReflector = this.reflector.getAllAndOverride<
      PermissionDef[] | PermissionDef // Expect array or single object
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // If no permissions are defined by the decorator (e.g. key not found or value is undefined), grant access.
    if (!rawPermissionsFromReflector) {
      this.logger.debug(
        'No permissions metadata found (PERMISSIONS_KEY not set or undefined). Access granted.',
      );
      return true;
    }

    if (Array.isArray(rawPermissionsFromReflector)) {
      requiredPermissionsSet = rawPermissionsFromReflector;
    } else {
      // If reflector returned a single PermissionDef object, wrap it in an array.
      this.logger.verbose(
        `Reflector returned a single permission object: ${JSON.stringify(
          rawPermissionsFromReflector,
        )}. Wrapping in array.`,
      );
      // Validate that the single object is indeed a PermissionDef-like structure
      if (
        typeof rawPermissionsFromReflector === 'object' &&
        rawPermissionsFromReflector !== null &&
        'action' in rawPermissionsFromReflector &&
        'subject' in rawPermissionsFromReflector
      ) {
        requiredPermissionsSet = [rawPermissionsFromReflector];
      } else {
        this.logger.error(
          `Unexpected permission metadata format from reflector (expected PermissionDef object, got ${typeof rawPermissionsFromReflector}): ${JSON.stringify(
            rawPermissionsFromReflector,
          )}. Access denied.`,
        );
        return false;
      }
    }

    // If, after processing, the set of permissions is empty, grant access.
    // This covers cases like @Permissions() or if filtering/processing somehow resulted in an empty set.
    if (requiredPermissionsSet.length === 0) {
      this.logger.debug(
        'Permissions decorator found, but no permissions specified or processed set is empty. Access granted.',
      );
      return true;
    }

    this.logger.debug(
      `Effective permissions to check: ${JSON.stringify(requiredPermissionsSet)}`,
    );

    let user: UserFromRequest | undefined;
    const contextType = context.getType().toString();

    if (contextType === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      const gqlCtx = ctx.getContext<GqlContextWithUser>();
      user = gqlCtx.req?.user; // Safely access user from the typed context
    } else if (contextType === 'http') {
      // For REST context
      const request = context
        .switchToHttp()
        .getRequest<{ user?: UserFromRequest }>();
      user = request.user;
    } else {
      this.logger.warn(
        `Unknown execution context type: ${contextType}. Access denied.`,
      );
      return false;
    }

    if (!user) {
      this.logger.warn(
        `No user found on request (context: ${contextType}). Access denied.`,
      );
      return false;
    }

    this.logger.verbose(
      `User object for permission check (context: ${contextType}): ${JSON.stringify(
        user,
        null,
        2,
      )}`,
    );

    return this.hasRequiredPermissions(user, requiredPermissionsSet);
  }

  private hasRequiredPermissions(
    user: UserFromRequest,
    requiredPermissionsSet: PermissionDef[],
  ): boolean {
    this.logger.debug(
      `Checking permissions for user: ${user.email || user.id}. Required: ${JSON.stringify(
        requiredPermissionsSet,
      )}`,
    );

    if (user.roles && Array.isArray(user.roles)) {
      const isSuperAdmin = user.roles.some((role: RoleWithPermissions) => {
        if (!role || typeof role.name !== 'string') {
          this.logger.warn(
            `Malformed role object in user.roles: ${JSON.stringify(role)}`,
          );
          return false;
        }
        const roleNameLower = role.name.toLowerCase();
        this.logger.debug(
          `Checking role: ${role.name} (lower: ${roleNameLower}) against 'super_admin'`,
        );
        return roleNameLower === 'super_admin';
      });

      if (isSuperAdmin) {
        this.logger.log(
          `User ${user.email || user.id} is SUPER_ADMIN. Access granted.`,
        );
        return true;
      }
    } else {
      this.logger.warn(
        `User ${user.email || user.id} has no 'roles' property or it's not an array.`,
      );
    }

    const userPermissions: PermissionDef[] = [];
    if (user.roles && Array.isArray(user.roles)) {
      user.roles.forEach((role: RoleWithPermissions) => {
        if (role.permissions && Array.isArray(role.permissions)) {
          // Ensure permissions are valid PermissionDef objects
          const validPermissions = role.permissions
            .filter(
              (p): p is PermissionDef =>
                p &&
                typeof p.action === 'string' &&
                typeof p.subject === 'string',
            )
            .map((p) => ({ action: p.action, subject: p.subject }));
          userPermissions.push(...validPermissions);
        } else {
          this.logger.debug(
            `Role '${role.name || 'Unnamed Role'}' has no 'permissions' array or it's malformed/missing. Role object details: ${JSON.stringify(
              role,
            )}`,
          );
        }
      });
    }
    this.logger.debug(
      `User ${user.email || user.id} has collected effective permissions: ${JSON.stringify(
        userPermissions,
      )}`,
    );

    if (userPermissions.length === 0 && requiredPermissionsSet.length > 0) {
      this.logger.warn(
        `User ${user.email || user.id} has no permissions, but some are required (${JSON.stringify(
          requiredPermissionsSet,
        )}). Access denied.`,
      );
      return false;
    }

    const hasAllRequired = requiredPermissionsSet.every((requiredPerm) => {
      const found = userPermissions.some(
        (userPerm) =>
          userPerm.action.toLowerCase() === requiredPerm.action.toLowerCase() &&
          userPerm.subject.toLowerCase() === requiredPerm.subject.toLowerCase(),
      );
      if (!found) {
        this.logger.warn(
          `User ${user.email || user.id} MISSING required permission: ${JSON.stringify(
            requiredPerm,
          )}`,
        );
      } else {
        this.logger.debug(
          `User ${user.email || user.id} HAS required permission: ${JSON.stringify(
            requiredPerm,
          )}`,
        );
      }
      return found;
    });

    if (hasAllRequired) {
      this.logger.log(
        `User ${user.email || user.id} has all required permissions. Access granted.`,
      );
    } else {
      this.logger.warn(
        `User ${user.email || user.id} does NOT have all required permissions. Access denied.`,
      );
    }
    return hasAllRequired;
  }
}
