import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleManagementService } from '../services/role-management.service';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';

@ObjectType()
export class RoleType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  level: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class RoleWithDetailsType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  level: number;

  @Field(() => Int)
  userCount: number;

  @Field(() => [String])
  permissionIds: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class RoleHierarchyType {
  @Field(() => [RoleWithDetailsType])
  roles: RoleWithDetailsType[];

  @Field(() => [String])
  levels: string[];
}

@ObjectType()
export class RolesResponseType {
  @Field(() => [RoleWithDetailsType])
  roles: RoleWithDetailsType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}

@InputType()
export class CreateRoleInputType {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Int)
  level: number;

  @Field(() => [String], { nullable: true })
  permissions?: string[];
}

@InputType()
export class UpdateRoleInputType {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  level?: number;

  @Field(() => [String], { nullable: true })
  permissions?: string[];
}

@Resolver(() => RoleType)
export class RoleManagementResolver {
  constructor(private roleService: RoleManagementService) {}

  /**
   * Get all roles with optional filtering
   */
  @Query(() => RolesResponseType, { name: 'godModeRoles' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getRoles(
    @Args('search', { nullable: true }) search?: string,
    @Args('level', { type: () => Int, nullable: true }) level?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<RolesResponseType> {
    const roles = await this.roleService.getRoles({
      search,
      level,
      skip: skip || 0,
      take: take || 50,
    });

    return {
      roles: roles.map((role) => ({
        ...role,
        description: role.description ?? undefined,
        userCount: role.users?.length || 0,
        permissionIds: role.permissions?.map((p) => p.id) || [],
      })),
      total: roles.length,
      skip: skip || 0,
      take: take || 50,
    };
  }

  /**
   * Get single role by ID
   */
  @Query(() => RoleWithDetailsType, { name: 'godModeRole' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getRole(@Args('id') id: string): Promise<RoleWithDetailsType> {
    const role = await this.roleService.getRole(id);

    return {
      ...role,
      description: role.description ?? undefined,
      userCount: role.users?.length || 0,
      permissionIds: role.permissions?.map((p) => p.id) || [],
    };
  }

  /**
   * Get role hierarchy
   */
  @Query(() => RoleHierarchyType, { name: 'godModeRoleHierarchy' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getRoleHierarchy(): Promise<RoleHierarchyType> {
    const hierarchy = await this.roleService.getRoleHierarchy();

    return {
      roles: hierarchy.roles.map((role) => ({
        ...role,
        description: role.description ?? undefined,
        permissionIds: role.permissions?.map((p) => p.id) || [],
      })),
      levels: Object.keys(hierarchy.levels),
    };
  }

  /**
   * Get users with specific role
   */
  @Query(() => RolesResponseType, { name: 'godModeRoleUsers' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getRoleUsers(
    @Args('roleId') roleId: string,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<RolesResponseType> {
    const result = await this.roleService.getRoleUsers(roleId, skip || 0, take || 20);

    return {
      roles: [],
      total: result.total,
      skip: result.skip,
      take: result.take,
    };
  }

  /**
   * Get user's roles
   */
  @Query(() => [RoleWithDetailsType], { name: 'godModeUserRoles' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getUserRoles(@Args('userId') userId: string): Promise<RoleWithDetailsType[]> {
    const roles = await this.roleService.getUserRoles(userId);

    return roles.map((role) => ({
      ...role,
      description: role.description ?? undefined,
      // users relation is not included here; do not access role.users
      userCount: 0,
      permissionIds: role.permissions?.map((p) => p.id) || [],
    }));
  }

  /**
   * Create new role
   */
  @Mutation(() => RoleWithDetailsType, { name: 'godModeCreateRole' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE')
  async createRole(
    @Args('input') input: CreateRoleInputType,
    @Context('user') user: any,
  ): Promise<RoleWithDetailsType> {
    const role = await this.roleService.createRole(input, user.id);

    return {
      ...role,
      description: role.description ?? undefined,
      userCount: 0,
      permissionIds: [],
    };
  }

  /**
   * Update existing role
   */
  @Mutation(() => RoleWithDetailsType, { name: 'godModeUpdateRole' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE')
  async updateRole(
    @Args('id') id: string,
    @Args('input') input: UpdateRoleInputType,
    @Context('user') user: any,
  ): Promise<RoleWithDetailsType> {
    const role = await this.roleService.updateRole(id, input, user.id);

    return {
      ...role,
      description: role.description ?? undefined,
      // users are not included here; avoid referencing role.users
      userCount: 0,
      permissionIds: (role as any).permissions?.map((p: any) => p.id) || [],
    };
  }

  /**
   * Delete role
   */
  @Mutation(() => Boolean, { name: 'godModeDeleteRole' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE')
  async deleteRole(
    @Args('id') id: string,
    @Context('user') user: any,
  ): Promise<boolean> {
    return this.roleService.deleteRole(id, user.id);
  }

  /**
   * Assign role to user
   */
  @Mutation(() => Boolean, { name: 'godModeAssignRoleToUser' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE')
  async assignRoleToUser(
    @Args('userId') userId: string,
    @Args('roleId') roleId: string,
    @Context('user') user: any,
  ): Promise<boolean> {
    await this.roleService.assignRoleToUser(userId, roleId, user.id);
    return true;
  }

  /**
   * Remove role from user
   */
  @Mutation(() => Boolean, { name: 'godModeRemoveRoleFromUser' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE')
  async removeRoleFromUser(
    @Args('userId') userId: string,
    @Args('roleId') roleId: string,
    @Context('user') user: any,
  ): Promise<boolean> {
    return this.roleService.removeRoleFromUser(userId, roleId, user.id);
  }
}
