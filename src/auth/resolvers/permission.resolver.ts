import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { Permission } from '../entities/permission.entity';
import { Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleRegistryService } from '../services/role-registry.service';
import { RequireRoles } from '../decorators/require-access.decorator';

/**
 * Permission GraphQL Resolver
 * Provides queries for accessing permissions
 */
@Resolver(() => Permission)
export class PermissionResolver {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    private roleRegistry: RoleRegistryService,
  ) {}

  /**
   * Get all permissions
   */
  @RequireRoles('GOD_MODE', 'SYSTEM_ADMIN', 'ADMIN', 'SUBSCRIPTION_MANAGER', 'BRANCH_ADMIN')
  @Query(() => [Permission], { description: 'Get all permissions' })
  async getPermissions(): Promise<Permission[]> {
    const permissions = this.roleRegistry.getAllPermissions() as any[];
    // Ensure isSystem has a default value
    return permissions.map(p => ({
      ...p,
      isSystem: p.isSystem ?? true,
    }));
  }

  /**
   * Get a single permission by ID
   */
  @RequireRoles('GOD_MODE', 'SYSTEM_ADMIN', 'ADMIN', 'SUBSCRIPTION_MANAGER', 'BRANCH_ADMIN')
  @Query(() => Permission, { description: 'Get a permission by ID' })
  async getPermission(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Permission> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return {
      ...permission,
      isSystem: permission.isSystem ?? true,
    } as any;
  }

  /**
   * Get permissions by category
   */
  @RequireRoles('GOD_MODE', 'SYSTEM_ADMIN', 'ADMIN', 'SUBSCRIPTION_MANAGER', 'BRANCH_ADMIN')
  @Query(() => [Permission], { description: 'Get permissions by category' })
  async getPermissionsByCategory(
    @Args('category') category: string,
  ): Promise<Permission[]> {
    const permissions = this.roleRegistry.getPermissionsByCategory(category) as any[];
    // Ensure isSystem has a default value
    return permissions.map(p => ({
      ...p,
      isSystem: p.isSystem ?? true,
    }));
  }

  /**
   * Returns permissions grouped by subject (legacy query)
   */
  @Query(() => [[Permission]], { name: 'permissionsGroupedBySubject' })
  async permissionsGroupedBySubject(): Promise<Permission[][]> {
    const permissions = await this.prisma.permission.findMany();
    const grouped: Record<string, Permission[]> = {};
    for (const perm of permissions) {
      // Fix: convert null description to undefined and ensure isSystem has default value
      const safePerm = {
        ...perm,
        description: perm.description ?? undefined,
        isSystem: perm.isSystem ?? true,
      };
      if (!grouped[perm.subject]) grouped[perm.subject] = [];
      grouped[perm.subject].push(safePerm as Permission);
    }
    return Object.values(grouped);
  }
}
