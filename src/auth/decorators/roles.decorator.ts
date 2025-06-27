import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route or handler
 * @param roles - Array of role names required for access
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
