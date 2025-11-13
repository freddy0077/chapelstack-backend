import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PermissionManagementService } from '../services/permission-management.service';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';

@ObjectType()
export class PermissionType {
  @Field()
  id: string;

  @Field()
  action: string;

  @Field()
  subject: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  category: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PermissionWithRolesType {
  @Field()
  id: string;

  @Field()
  action: string;

  @Field()
  subject: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  category: string;

  @Field(() => Int)
  roleCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PermissionMatrixType {
  @Field(() => [String])
  roleIds: string[];

  @Field(() => [String])
  permissionIds: string[];

  @Field(() => String)
  matrix: string; // JSON string of the matrix
}

@ObjectType()
export class PermissionsResponseType {
  @Field(() => [PermissionWithRolesType])
  permissions: PermissionWithRolesType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}

@InputType()
export class CreatePermissionInputType {
  @Field()
  action: string;

  @Field()
  subject: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  category?: string;
}

@InputType()
export class UpdatePermissionInputType {
  @Field({ nullable: true })
  action?: string;

  @Field({ nullable: true })
  subject?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  category?: string;
}

@Resolver(() => PermissionType)
export class PermissionManagementResolver {
  constructor(private permissionService: PermissionManagementService) {}

  /**
   * Get all permissions with optional filtering
   */
  @Query(() => PermissionsResponseType, { name: 'godModePermissions' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getPermissions(
    @Args('search', { nullable: true }) search?: string,
    @Args('category', { nullable: true }) category?: string,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<PermissionsResponseType> {
    const permissions = await this.permissionService.getPermissions({
      search,
      category,
      skip: skip || 0,
      take: take || 100,
    });

    return {
      permissions: permissions.map((perm) => ({
        ...perm,
        description: perm.description ?? undefined,
        roleCount: perm.roles?.length || 0,
      })),
      total: permissions.length,
      skip: skip || 0,
      take: take || 100,
    };
  }

  /**
   * Get single permission by ID
   */
  @Query(() => PermissionWithRolesType, { name: 'godModePermission' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getPermission(@Args('id') id: string): Promise<PermissionWithRolesType> {
    const permission = await this.permissionService.getPermission(id);

    return {
      ...permission,
      description: permission.description ?? undefined,
      roleCount: permission.roles?.length || 0,
    };
  }

  /**
   * Get permission matrix
   */
  @Query(() => PermissionMatrixType, { name: 'godModePermissionMatrix' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getPermissionMatrix(): Promise<PermissionMatrixType> {
    const matrix = await this.permissionService.getPermissionMatrix();

    return {
      roleIds: matrix.roles.map((r) => r.id),
      permissionIds: matrix.permissions.map((p) => p.id),
      matrix: JSON.stringify(matrix.matrix),
    };
  }

  /**
   * Get permissions for a role
   */
  @Query(() => [PermissionWithRolesType], { name: 'godModeRolePermissions' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getRolePermissions(@Args('roleId') roleId: string): Promise<PermissionWithRolesType[]> {
    const permissions = await this.permissionService.getRolePermissions(roleId);

    return permissions.map((perm) => ({
      ...perm,
      description: perm.description ?? undefined,
      roleCount: 0,
    }));
  }

  /**
   * Get roles for a permission
   */
  @Query(() => [String], { name: 'godModePermissionRoles' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getPermissionRoles(@Args('permissionId') permissionId: string): Promise<string[]> {
    const roles = await this.permissionService.getPermissionRoles(permissionId);
    return roles.map((r) => r.id);
  }

  /**
   * Get permission categories
   */
  @Query(() => [String], { name: 'godModePermissionCategories' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getPermissionCategories(): Promise<string[]> {
    return this.permissionService.getPermissionCategories();
  }

  /**
   * Create new permission
   */
  @Mutation(() => PermissionWithRolesType, { name: 'godModeCreatePermission' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE')
  async createPermission(
    @Args('input') input: CreatePermissionInputType,
    @Context('user') user: any,
  ): Promise<PermissionWithRolesType> {
    const permission = await this.permissionService.createPermission(input, user.id);

    return {
      ...permission,
      description: permission.description ?? undefined,
      roleCount: 0,
    };
  }

  /**
   * Update existing permission
   */
  @Mutation(() => PermissionWithRolesType, { name: 'godModeUpdatePermission' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE')
  async updatePermission(
    @Args('id') id: string,
    @Args('input') input: UpdatePermissionInputType,
    @Context('user') user: any,
  ): Promise<PermissionWithRolesType> {
    const permission = await this.permissionService.updatePermission(id, input, user.id);

    return {
      ...permission,
      description: permission.description ?? undefined,
      roleCount: 0,
    };
  }

  /**
   * Delete permission
   */
  @Mutation(() => Boolean, { name: 'godModeDeletePermission' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE')
  async deletePermission(
    @Args('id') id: string,
    @Context('user') user: any,
  ): Promise<boolean> {
    return this.permissionService.deletePermission(id, user.id);
  }

  /**
   * Assign permission to role
   */
  @Mutation(() => Boolean, { name: 'godModeAssignPermissionToRole' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE')
  async assignPermissionToRole(
    @Args('roleId') roleId: string,
    @Args('permissionId') permissionId: string,
    @Context('user') user: any,
  ): Promise<boolean> {
    await this.permissionService.assignPermissionToRole(roleId, permissionId, user.id);
    return true;
  }

  /**
   * Remove permission from role
   */
  @Mutation(() => Boolean, { name: 'godModeRemovePermissionFromRole' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE')
  async removePermissionFromRole(
    @Args('roleId') roleId: string,
    @Args('permissionId') permissionId: string,
    @Context('user') user: any,
  ): Promise<boolean> {
    return this.permissionService.removePermissionFromRole(roleId, permissionId, user.id);
  }

  /**
   * Validate permission hierarchy
   */
  @Query(() => Boolean, { name: 'godModeValidatePermissionHierarchy' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async validatePermissionHierarchy(@Args('roleId') roleId: string): Promise<boolean> {
    return this.permissionService.validatePermissionHierarchy(roleId);
  }
}
