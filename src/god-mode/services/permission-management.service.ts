import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { Permission, Role } from '@prisma/client';

export interface CreatePermissionInput {
  action: string;
  subject: string;
  description?: string;
  category?: string;
}

export interface UpdatePermissionInput {
  action?: string;
  subject?: string;
  description?: string;
  category?: string;
}

export interface PermissionFilter {
  search?: string;
  category?: string;
  skip?: number;
  take?: number;
}

export interface PermissionMatrix {
  roles: Array<{
    id: string;
    name: string;
    level: number;
  }>;
  permissions: Array<{
    id: string;
    action: string;
    subject: string;
    category: string;
  }>;
  matrix: Record<string, Record<string, boolean>>;
}

@Injectable()
export class PermissionManagementService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  /**
   * Create a new permission
   */
  async createPermission(
    input: CreatePermissionInput,
    userId: string,
  ): Promise<Permission> {
    // Validate input
    if (!input.action || input.action.trim().length === 0) {
      throw new BadRequestException('Permission action is required');
    }

    if (!input.subject || input.subject.trim().length === 0) {
      throw new BadRequestException('Permission subject is required');
    }

    // Check if permission already exists
    const existingPermission = await this.prisma.permission.findUnique({
      where: {
        action_subject: {
          action: input.action,
          subject: input.subject,
        },
      },
    });

    if (existingPermission) {
      throw new BadRequestException(
        `Permission "${input.action}:${input.subject}" already exists`,
      );
    }

    // Create permission
    const permission = await this.prisma.permission.create({
      data: {
        action: input.action,
        subject: input.subject,
        description: input.description || '',
        category: input.category || 'general',
      },
    });

    // Log audit
    await this.auditLog.create({
      action: 'CREATE_PERMISSION',
      entityType: 'Permission',
      entityId: permission.id,
      userId,
      description: `Created permission ${input.action}:${input.subject}`,
      metadata: {
        action: input.action,
        subject: input.subject,
        description: input.description,
        category: input.category,
      },
    });

    return permission;
  }

  /**
   * Update an existing permission
   */
  async updatePermission(
    permissionId: string,
    input: UpdatePermissionInput,
    userId: string,
  ): Promise<Permission> {
    // Verify permission exists
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${permissionId}" not found`);
    }

    // Check if new action/subject combination already exists
    if (input.action || input.subject) {
      const newAction = input.action || permission.action;
      const newSubject = input.subject || permission.subject;

      if (newAction !== permission.action || newSubject !== permission.subject) {
        const existingPermission = await this.prisma.permission.findUnique({
          where: {
            action_subject: {
              action: newAction,
              subject: newSubject,
            },
          },
        });

        if (existingPermission) {
          throw new BadRequestException(
            `Permission "${newAction}:${newSubject}" already exists`,
          );
        }
      }
    }

    // Update permission
    const updatedPermission = await this.prisma.permission.update({
      where: { id: permissionId },
      data: {
        action: input.action || permission.action,
        subject: input.subject || permission.subject,
        description: input.description !== undefined ? input.description : permission.description,
        category: input.category || permission.category,
      },
    });

    // Log audit
    await this.auditLog.create({
      action: 'UPDATE_PERMISSION',
      entityType: 'Permission',
      entityId: permissionId,
      userId,
      description: `Updated permission ${permission.action}:${permission.subject} -> ${updatedPermission.action}:${updatedPermission.subject}`,
      metadata: {
        before: {
          action: permission.action,
          subject: permission.subject,
          description: permission.description,
          category: permission.category,
        },
        after: {
          action: updatedPermission.action,
          subject: updatedPermission.subject,
          description: updatedPermission.description,
          category: updatedPermission.category,
        },
      },
    });

    return updatedPermission;
  }

  /**
   * Delete a permission
   */
  async deletePermission(permissionId: string, userId: string): Promise<boolean> {
    // Verify permission exists
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${permissionId}" not found`);
    }

    // Check if permission is assigned to any roles
    const roleCount = await this.prisma.role.count({
      where: {
        permissions: {
          some: { id: permissionId },
        },
      },
    });

    if (roleCount > 0) {
      throw new BadRequestException(
        `Cannot delete permission - it is assigned to ${roleCount} role(s)`,
      );
    }

    // Delete permission
    await this.prisma.permission.delete({
      where: { id: permissionId },
    });

    // Log audit
    await this.auditLog.create({
      action: 'DELETE_PERMISSION',
      entityType: 'Permission',
      entityId: permissionId,
      userId,
      description: `Deleted permission ${permission.action}:${permission.subject}`,
      metadata: {
        action: permission.action,
        subject: permission.subject,
        description: permission.description,
        category: permission.category,
      },
    });

    return true;
  }

  /**
   * Get all permissions with optional filtering
   */
  async getPermissions(filter?: PermissionFilter) {
    const where: any = {};

    if (filter?.search) {
      where.OR = [
        { action: { contains: filter.search, mode: 'insensitive' } },
        { subject: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter?.category) {
      where.category = filter.category;
    }

    const permissions = await this.prisma.permission.findMany({
      where,
      include: {
        roles: true,
      },
      orderBy: [{ category: 'asc' }, { action: 'asc' }],
      skip: filter?.skip || 0,
      take: filter?.take || 100,
    });

    return permissions;
  }

  /**
   * Get single permission by ID
   */
  async getPermission(permissionId: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
      include: {
        roles: true,
      },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${permissionId}" not found`);
    }

    return permission;
  }

  /**
   * Assign permission to role
   */
  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
    assignedBy: string,
  ): Promise<boolean> {
    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Verify permission exists
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${permissionId}" not found`);
    }

    // Check if permission already assigned
    const existingAssignment = await this.prisma.role.findFirst({
      where: {
        id: roleId,
        permissions: { some: { id: permissionId } },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        `Permission "${permission.action}:${permission.subject}" already assigned to role "${role.name}"`,
      );
    }

    // Assign permission via relation connect
    await this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          connect: { id: permissionId },
        },
      },
    });

    // Log audit
    await this.auditLog.create({
      action: 'ASSIGN_PERMISSION_TO_ROLE',
      entityType: 'RolePermission',
      entityId: `${roleId}_${permissionId}`,
      userId: assignedBy,
      description: `Assigned permission ${permission.action}:${permission.subject} to role ${role.name}`,
      metadata: {
        roleId,
        roleName: role.name,
        permissionId,
        permissionAction: permission.action,
        permissionSubject: permission.subject,
      },
    });

    return true;
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
    removedBy: string,
  ): Promise<boolean> {
    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Verify permission exists
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${permissionId}" not found`);
    }

    // Check if permission is assigned
    const isAssigned = await this.prisma.role.findFirst({
      where: {
        id: roleId,
        permissions: { some: { id: permissionId } },
      },
    });

    if (!isAssigned) {
      throw new BadRequestException(
        `Permission "${permission.action}:${permission.subject}" is not assigned to role "${role.name}"`,
      );
    }

    // Remove permission via relation disconnect
    await this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          disconnect: { id: permissionId },
        },
      },
    });

    // Log audit
    await this.auditLog.create({
      action: 'REMOVE_PERMISSION_FROM_ROLE',
      entityType: 'RolePermission',
      entityId: `${roleId}_${permissionId}`,
      userId: removedBy,
      description: `Removed permission ${permission.action}:${permission.subject} from role ${role.name}`,
      metadata: {
        roleId,
        roleName: role.name,
        permissionId,
        permissionAction: permission.action,
        permissionSubject: permission.subject,
      },
    });

    return true;
  }

  /**
   * Get permission matrix (roles vs permissions)
   */
  async getPermissionMatrix(): Promise<PermissionMatrix> {
    const [roles, permissions] = await Promise.all([
      this.prisma.role.findMany({
        select: {
          id: true,
          name: true,
          level: true,
        },
        orderBy: { level: 'asc' },
      }),
      this.prisma.permission.findMany({
        select: {
          id: true,
          action: true,
          subject: true,
          category: true,
        },
        orderBy: [{ category: 'asc' }, { action: 'asc' }],
      }),
    ]);

    // Build matrix
    const matrix: Record<string, Record<string, boolean>> = {};

    for (const role of roles) {
      matrix[role.id] = {};
      for (const permission of permissions) {
        matrix[role.id][permission.id] = false;
      }
    }

    // Fill in assigned permissions by loading role relations
    const rolesWithPermissions = await this.prisma.role.findMany({
      include: { permissions: true },
    });

    for (const r of rolesWithPermissions) {
      for (const p of r.permissions) {
        if (matrix[r.id]) {
          matrix[r.id][p.id] = true;
        }
      }
    }

    return {
      roles,
      permissions,
      matrix,
    };
  }

  /**
   * Get permissions for a role
   */
  async getRolePermissions(roleId: string) {
    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    const permissions = await this.prisma.permission.findMany({
      where: {
        roles: {
          some: { id: roleId },
        },
      },
      orderBy: [{ category: 'asc' }, { action: 'asc' }],
    });

    return permissions;
  }

  /**
   * Get roles for a permission
   */
  async getPermissionRoles(permissionId: string) {
    // Verify permission exists
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${permissionId}" not found`);
    }

    const roles = await this.prisma.role.findMany({
      where: {
        permissions: {
          some: { id: permissionId },
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
   * Get all permission categories
   */
  async getPermissionCategories(): Promise<string[]> {
    const categories = await this.prisma.permission.findMany({
      distinct: ['category'],
      select: {
        category: true,
      },
      orderBy: { category: 'asc' },
    });

    return categories.map((c) => c.category);
  }

  /**
   * Validate permission hierarchy
   */
  async validatePermissionHierarchy(roleId: string): Promise<boolean> {
    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: true,
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Check if role has any permissions
    return role.permissions.length > 0;
  }
}
