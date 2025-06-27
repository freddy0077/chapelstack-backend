import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, Permission } from '@prisma/client';

@Injectable()
export class RolePermissionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new role
   */
  async createRole(name: string, description?: string): Promise<Role> {
    // Check if role with this name already exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException(`Role with name ${name} already exists`);
    }

    return this.prisma.role.create({
      data: {
        name,
        description,
      },
    });
  }

  /**
   * Find all roles
   */
  async findAllRoles(): Promise<Role[]> {
    return this.prisma.role.findMany({
      include: {
        permissions: true,
        users: true,
        userBranches: true,
      },
    });
  }

  /**
   * Find a role by ID
   */
  async findRoleById(
    id: string,
  ): Promise<Role & { permissions: any[]; users: any[]; userBranches: any[] }> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        users: true,
        userBranches: true,
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  /**
   * Update a role
   */
  async updateRole(
    id: string,
    name?: string,
    description?: string,
  ): Promise<Role> {
    const role = await this.findRoleById(id);

    if (name && name !== role.name) {
      // Check if another role with this name already exists
      const existingRole = await this.prisma.role.findUnique({
        where: { name },
      });

      if (existingRole && existingRole.id !== id) {
        throw new ConflictException(
          `Another role with name ${name} already exists`,
        );
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
      },
      include: {
        permissions: true,
        users: true,
        userBranches: true,
      },
    });
  }

  /**
   * Delete a role
   */
  async deleteRole(id: string): Promise<Role> {
    const role = await this.findRoleById(id);

    // Check if role is in use
    if (role.users.length > 0 || role.userBranches.length > 0) {
      throw new ConflictException(
        `Cannot delete role ${role.name} as it is assigned to users`,
      );
    }

    return this.prisma.role.delete({
      where: { id },
      include: {
        permissions: true,
      },
    });
  }

  /**
   * Create a new permission
   */
  async createPermission(
    action: string,
    subject: string,
    description?: string,
  ): Promise<Permission> {
    try {
      return await this.prisma.permission.create({
        data: {
          action,
          subject,
          description,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Permission with action '${action}' and subject '${subject}' already exists`,
        );
      }
      throw error;
    }
  }

  /**
   * Find all permissions
   */
  async findAllPermissions(): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      include: {
        roles: true,
      },
    });
  }

  /**
   * Find a permission by ID
   */
  async findPermissionById(id: string): Promise<Permission & { roles: any[] }> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  /**
   * Update a permission
   */
  async updatePermission(
    id: string,
    action?: string,
    subject?: string,
    description?: string,
  ): Promise<Permission> {
    const permission = await this.findPermissionById(id);

    if (
      (action && action !== permission.action) ||
      (subject && subject !== permission.subject)
    ) {
      // Check if another permission with this action and subject already exists
      const existingPermission = await this.prisma.permission.findFirst({
        where: {
          action: action || permission.action,
          subject: subject || permission.subject,
          NOT: {
            id,
          },
        },
      });

      if (existingPermission) {
        throw new ConflictException(
          `Another permission with action '${action || permission.action}' and subject '${subject || permission.subject}' already exists`,
        );
      }
    }

    return this.prisma.permission.update({
      where: { id },
      data: {
        action: action || undefined,
        subject: subject || undefined,
        description: description !== undefined ? description : undefined,
      },
      include: {
        roles: true,
      },
    });
  }

  /**
   * Delete a permission
   */
  async deletePermission(id: string): Promise<Permission> {
    const permission = await this.findPermissionById(id);

    // Check if permission is in use
    if (permission.roles.length > 0) {
      throw new ConflictException(
        `Cannot delete permission as it is assigned to roles`,
      );
    }

    return this.prisma.permission.delete({
      where: { id },
    });
  }

  /**
   * Assign a permission to a role
   */
  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<Role> {
    const role = await this.findRoleById(roleId);
    const permission = await this.findPermissionById(permissionId);

    // Check if role already has this permission
    const hasPermission = role.permissions.some((p) => p.id === permissionId);
    if (hasPermission) {
      throw new ConflictException(
        `Role ${role.name} already has permission ${permission.action} ${permission.subject}`,
      );
    }

    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          connect: { id: permissionId },
        },
      },
      include: {
        permissions: true,
        users: true,
        userBranches: true,
      },
    });
  }

  /**
   * Remove a permission from a role
   */
  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<Role> {
    const role = await this.findRoleById(roleId);
    const permission = await this.findPermissionById(permissionId);

    // Check if role has this permission
    const hasPermission = role.permissions.some((p) => p.id === permissionId);
    if (!hasPermission) {
      throw new NotFoundException(
        `Role ${role.name} does not have permission ${permission.action} ${permission.subject}`,
      );
    }

    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          disconnect: { id: permissionId },
        },
      },
      include: {
        permissions: true,
        users: true,
        userBranches: true,
      },
    });
  }

  /**
   * Create a new role with permissions
   */
  async createRoleWithPermissions(
    name: string,
    description: string | undefined,
    permissionIds: string[],
  ): Promise<Role> {
    // Check if role with this name already exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });
    if (existingRole) {
      throw new ConflictException(`Role with name ${name} already exists`);
    }
    // Check all permissions exist
    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });
    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }
    return this.prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          connect: permissionIds.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
        users: true,
        userBranches: true,
      },
    });
  }
}
