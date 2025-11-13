import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No specific roles required
    }

    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const user = req.user;

    if (!user || !user.roles) {
      return false;
    }

    // Extract role names from role objects (roles can be objects with 'name' property or strings)
    const userRoleNames = user.roles.map((role: any) => 
      typeof role === 'string' ? role : role.name
    );

    return requiredRoles.some((role) => userRoleNames.includes(role));
  }
}
