import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { RolePermissionService } from '../services/role-permission.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/entities/role.entity';
import { Permission } from '../../auth/entities/permission.entity';
import {
  CreateRoleInput,
  UpdateRoleInput,
  CreatePermissionInput,
  UpdatePermissionInput,
  CreateRoleWithPermissionsInput,
} from '../dto/role-permission.input';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class RolePermissionResolver {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  // Role Queries
  @Query(() => [Role], { name: 'adminRoles' })
  // @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  async findAllRoles() {
    return this.rolePermissionService.findAllRoles();
  }

  @Query(() => Role, { name: 'adminRole' })
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  async findRoleById(@Args('id', { type: () => ID }) id: string) {
    return this.rolePermissionService.findRoleById(id);
  }

  // Role Mutations
  @Mutation(() => Role)
  @Roles('SUPER_ADMIN')
  async createRole(@Args('input') createRoleInput: CreateRoleInput) {
    return this.rolePermissionService.createRole(
      createRoleInput.name,
      createRoleInput.description,
    );
  }

  @Mutation(() => Role)
  @Roles('SUPER_ADMIN')
  async updateRole(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateRoleInput: UpdateRoleInput,
  ) {
    return this.rolePermissionService.updateRole(
      id,
      updateRoleInput.name,
      updateRoleInput.description,
    );
  }

  @Mutation(() => Role)
  @Roles('SUPER_ADMIN')
  async deleteRole(@Args('id', { type: () => ID }) id: string) {
    return this.rolePermissionService.deleteRole(id);
  }

  @Mutation(() => Role)
  // @Roles('SUPER_ADMIN')
  async createRoleWithPermissions(
    @Args('input') input: CreateRoleWithPermissionsInput,
  ) {
    return this.rolePermissionService.createRoleWithPermissions(
      input.name,
      input.description,
      input.permissionIds,
    );
  }

  // Permission Queries
  @Query(() => [Permission], { name: 'adminPermissions' })
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  async findAllPermissions() {
    return this.rolePermissionService.findAllPermissions();
  }

  @Query(() => Permission, { name: 'adminPermission' })
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  async findPermissionById(@Args('id', { type: () => ID }) id: string) {
    return this.rolePermissionService.findPermissionById(id);
  }

  // Permission Mutations
  @Mutation(() => Permission)
  @Roles('SUPER_ADMIN')
  async createPermission(
    @Args('input') createPermissionInput: CreatePermissionInput,
  ) {
    return this.rolePermissionService.createPermission(
      createPermissionInput.action,
      createPermissionInput.subject,
      createPermissionInput.description,
    );
  }

  @Mutation(() => Permission)
  @Roles('SUPER_ADMIN')
  async updatePermission(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updatePermissionInput: UpdatePermissionInput,
  ) {
    return this.rolePermissionService.updatePermission(
      id,
      updatePermissionInput.action,
      updatePermissionInput.subject,
      updatePermissionInput.description,
    );
  }

  @Mutation(() => Permission)
  @Roles('SUPER_ADMIN')
  async deletePermission(@Args('id', { type: () => ID }) id: string) {
    return this.rolePermissionService.deletePermission(id);
  }

  // Role-Permission Mutations
  @Mutation(() => Role)
  @Roles('SUPER_ADMIN')
  async assignPermissionToRole(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('permissionId', { type: () => ID }) permissionId: string,
  ) {
    return this.rolePermissionService.assignPermissionToRole(
      roleId,
      permissionId,
    );
  }

  @Mutation(() => Role)
  @Roles('SUPER_ADMIN')
  async removePermissionFromRole(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('permissionId', { type: () => ID }) permissionId: string,
  ) {
    return this.rolePermissionService.removePermissionFromRole(
      roleId,
      permissionId,
    );
  }
}
