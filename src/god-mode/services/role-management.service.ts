import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { Role, User } from '@prisma/client';

export interface CreateRoleInput {
  name: string;
  description: string;
  level: number;
  permissions?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  level?: number;
  permissions?: string[];
}

export interface RoleFilter {
  search?: string;
  level?: number;
  skip?: number;
  take?: number;
}

export interface RoleHierarchy {
  roles: Array<Role & { permissions: any[]; userCount: number }>;
  levels: Record<number, string[]>;
}

@Injectable()
export class RoleManagementService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  /**
   * Create a new role
   */
  async createRole(
    input: CreateRoleInput,
    userId: string,
  ): Promise<Role> {
    // Validate input
    if (!input.name || input.name.trim().length === 0) {
      throw new BadRequestException('Role name is required');
    }

    if (input.level === undefined || input.level < 0) {
      throw new BadRequestException('Role level must be a non-negative number');
    }

    // Check if role already exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name: input.name },
    });

    if (existingRole) {
      throw new BadRequestException(`Role "${input.name}" already exists`);
    }

    // Create role
    const role = await this.prisma.role.create({
      data: {
        name: input.name,
        description: input.description || '',
        level: input.level,
      },
      include: {
        permissions: true,
      },
    });

    // Assign permissions if provided
    if (input.permissions && input.permissions.length > 0) {
      await this.assignPermissionsToRole(role.id, input.permissions, userId);
    }

    // Log audit
    await this.auditLog.create({
      action: 'CREATE_ROLE',
      entityType: 'Role',
      entityId: role.id,
      userId,
      description: `Created role ${input.name}`,
      metadata: {
        name: input.name,
        description: input.description,
        level: input.level,
      },
    });

    return role;
  }

  /**
   * Update an existing role
   */
  async updateRole(
    roleId: string,
    input: UpdateRoleInput,
    userId: string,
  ): Promise<Role> {
    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Check if new name already exists (if changing name)
    if (input.name && input.name !== role.name) {
      const existingRole = await this.prisma.role.findUnique({
        where: { name: input.name },
      });

      if (existingRole) {
        throw new BadRequestException(`Role "${input.name}" already exists`);
      }
    }

    // Update role
    const updatedRole = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        name: input.name || role.name,
        description: input.description !== undefined ? input.description : role.description,
        level: input.level !== undefined ? input.level : role.level,
      },
      include: {
        permissions: true,
      },
    });

    // Update permissions if provided
    if (input.permissions) {
      // Replace existing permissions with provided set
      await this.prisma.role.update({
        where: { id: roleId },
        data: {
          permissions: {
            set: [],
          },
        },
      });

      if (input.permissions.length > 0) {
        await this.assignPermissionsToRole(roleId, input.permissions, userId);
      }
    }

    // Log audit
    await this.auditLog.create({
      action: 'UPDATE_ROLE',
      entityType: 'Role',
      entityId: roleId,
      userId,
      description: `Updated role ${role.name}`,
      metadata: {
        before: {
          name: role.name,
          description: role.description,
          level: role.level,
        },
        after: {
          name: updatedRole.name,
          description: updatedRole.description,
          level: updatedRole.level,
        },
      },
    });

    return updatedRole;
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: string, userId: string): Promise<boolean> {
    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Check if role is assigned to any users
    const userCount = await this.prisma.user.count({
      where: { roles: { some: { id: roleId } } },
    });

    if (userCount > 0) {
      throw new BadRequestException(
        `Cannot delete role "${role.name}" - it is assigned to ${userCount} user(s)`,
      );
    }

    // Delete role
    await this.prisma.role.delete({
      where: { id: roleId },
    });

    // Log audit
    await this.auditLog.create({
      action: 'DELETE_ROLE',
      entityType: 'Role',
      entityId: roleId,
      userId,
      description: `Deleted role ${role.name}`,
      metadata: {
        name: role.name,
        description: role.description,
        level: role.level,
      },
    });

    return true;
  }

  /**
   * Get all roles with optional filtering
   */
  async getRoles(filter?: RoleFilter) {
    const where: any = {};

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter?.level !== undefined) {
      where.level = filter.level;
    }

    const roles = await this.prisma.role.findMany({
      where,
      include: {
        permissions: true,
        users: true,
      },
      orderBy: { level: 'asc' },
      skip: filter?.skip || 0,
      take: filter?.take || 50,
    });

    return roles;
  }

  /**
   * Get single role by ID
   */
  async getRole(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: true,
        users: true,
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    return role;
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy: string,
  ): Promise<boolean> {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Check if user already has this role
    const hasRole = user.roles.some((r) => r.id === roleId);

    if (hasRole) {
      throw new BadRequestException(
        `User already has role "${role.name}"`,
      );
    }

    // Assign role
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { id: roleId },
        },
      },
    });

    // Log audit
    await this.auditLog.create({
      action: 'ASSIGN_ROLE_TO_USER',
      entityType: 'UserRole',
      entityId: `${userId}_${roleId}`,
      userId: assignedBy,
      description: `Assigned role "${role.name}" to user`,
    });

    return true;
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(
    userId: string,
    roleId: string,
    removedBy: string,
  ): Promise<boolean> {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Check if user has this role
    const hasRole = user.roles.some((r) => r.id === roleId);

    if (!hasRole) {
      throw new BadRequestException(
        `User does not have role "${role.name}"`,
      );
    }

    // Remove role
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          disconnect: { id: roleId },
        },
      },
    });

    // Log audit
    await this.auditLog.create({
      action: 'REMOVE_ROLE_FROM_USER',
      entityType: 'UserRole',
      entityId: `${userId}_${roleId}`,
      userId: removedBy,
      description: `Removed role "${role.name}" from user`,
    });

    return true;
  }

  /**
   * Get role hierarchy
   */
  async getRoleHierarchy(): Promise<RoleHierarchy> {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: true,
        users: true,
      },
      orderBy: { level: 'asc' },
    });

    // Build hierarchy by level
    const levels: Record<number, string[]> = {};
    roles.forEach((role) => {
      if (!levels[role.level]) {
        levels[role.level] = [];
      }
      levels[role.level].push(role.name);
    });

    // Add user count to each role
    const rolesWithCounts = roles.map((role) => ({
      ...role,
      userCount: role.users.length,
    }));

    return {
      roles: rolesWithCounts,
      levels,
    };
  }

  /**
   * Get users with specific role
   */
  async getRoleUsers(roleId: string, skip: number = 0, take: number = 20) {
    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          roles: {
            some: { id: roleId },
          },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: {
          roles: {
            some: { id: roleId },
          },
        },
      }),
    ]);

    return {
      users,
      total,
      skip,
      take,
    };
  }

  /**
   * Get user's roles
   */
  async getUserRoles(userId: string) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    const roles = await this.prisma.role.findMany({
      where: {
        users: {
          some: { id: userId },
        },
      },
      include: {
        permissions: true,
      },
      orderBy: { level: 'asc' },
    });

    return roles;
  }

  /**
   * Validate role permissions (private helper)
   */
  private async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[],
    userId: string,
  ): Promise<void> {
    // Verify all permissions exist
    const permissions = await this.prisma.permission.findMany({
      where: {
        id: { in: permissionIds },
      },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('One or more permissions not found');
    }

    // Connect permissions to role
    await this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          connect: permissionIds.map((id) => ({ id })),
        },
      },
    });

    // Log audit
    await this.auditLog.create({
      action: 'ASSIGN_PERMISSIONS_TO_ROLE',
      entityType: 'Role',
      entityId: roleId,
      userId,
      description: `Assigned ${permissionIds.length} permission(s) to role`,
      metadata: {
        permissionCount: permissionIds.length,
        permissionIds,
      },
    });
  }
}
