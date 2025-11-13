import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleRegistryService } from '../services/role-registry.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * JWT Strategy with Role Registry Integration
 * Validates JWT tokens and enriches user object with role metadata
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly roleRegistry: RoleRegistryService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'fallback-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    const { sub: id } = payload;

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organisationId: true,
        passwordHash: false,
        roles: {
          select: {
            id: true,
            name: true,
            permissions: {
              select: {
                id: true,
                action: true,
                subject: true,
              },
            },
          },
        },
        userBranches: {
          include: {
            branch: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Extract branchId from userBranches (primary branch)
    const branchId = user.userBranches?.[0]?.branch?.id || null;

    // Extract role IDs from user roles (role.id is the enum value like 'SYSTEM_ADMIN')
    const roleIds = user.roles?.map((r) => r.id) || [];
    // Extract role names for display
    const roleNames = user.roles?.map((r) => r.name) || [];

    // Get role metadata from registry for each role
    const roleMetadata = roleIds
      .map((roleId) => this.roleRegistry.getRoleMetadata(roleId))
      .filter((role) => role !== null);

    // Get all permissions for user (from all roles)
    const allPermissions = new Set<string>();
    for (const roleId of roleIds) {
      const permissions = this.roleRegistry.getRolePermissions(roleId);
      permissions.forEach((perm) => allPermissions.add(perm.id));
    }

    // Get all modules accessible to user
    const accessibleModules = new Set<string>();
    for (const roleId of roleIds) {
      const modules = this.roleRegistry.getRoleModules(roleId);
      modules.forEach((mod) => accessibleModules.add(mod.id));
    }

    return {
      ...user,
      branchId,
      roleIds,
      roleNames,
      roles: roleIds, // Include roles array (IDs) for guard compatibility
      roleMetadata,
      permissions: Array.from(allPermissions),
      modules: Array.from(accessibleModules),
    };
  }
}
