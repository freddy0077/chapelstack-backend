import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';
import 'reflect-metadata';

/**
 * Decorator to specify required roles for ministry operations
 */
export const MinistryRoles = (...roles: string[]) => {
  return (
    target: object,
    key?: string,
    descriptor?: PropertyDescriptor,
  ): PropertyDescriptor => {
    if (descriptor) {
      Reflect.defineMetadata('ministryRoles', roles, descriptor.value);
    }
    return descriptor as PropertyDescriptor;
  };
};

@Injectable()
export class MinistryRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'ministryRoles',
      context.getHandler(),
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the user from the request context
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const user = req.user as { memberId: string } | undefined;

    // If no user is authenticated, deny access
    if (!user) {
      throw new ForbiddenException(
        'You must be logged in to perform this action',
      );
    }

    // Get the ministry or group ID from the request
    const args = ctx.getArgs<{
      input?: { ministryId?: string; smallGroupId?: string };
      ministryId?: string;
      smallGroupId?: string;
    }>();
    const ministryId = args.input?.ministryId || args.ministryId;
    const smallGroupId = args.input?.smallGroupId || args.smallGroupId;

    // If neither ministry nor group ID is provided, deny access
    if (!ministryId && !smallGroupId) {
      return false;
    }

    // Check if the user has the required role in the ministry or group
    if (ministryId) {
      const memberRole = await this.prisma.groupMember.findFirst({
        where: {
          ministryId,
          memberId: user.memberId,
        },
      });

      if (!memberRole || !requiredRoles.includes(memberRole.role)) {
        throw new ForbiddenException(
          'You do not have the required role to perform this action',
        );
      }
    }

    if (smallGroupId) {
      const memberRole = await this.prisma.groupMember.findFirst({
        where: {
          smallGroupId,
          memberId: user.memberId,
        },
      });

      if (!memberRole || !requiredRoles.includes(memberRole.role)) {
        throw new ForbiddenException(
          'You do not have the required role to perform this action',
        );
      }
    }

    return true;
  }
}
