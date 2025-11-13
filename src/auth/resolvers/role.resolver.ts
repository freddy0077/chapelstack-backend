import { Resolver, Query, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Module } from '../entities/module.entity';
import { RoleRegistryService } from '../services/role-registry.service';
import { RequireRoles } from '../decorators/require-access.decorator';
import type { RoleMetadata } from '../config/role-registry';

/**
 * Role GraphQL Resolver
 * Provides queries for accessing roles, permissions, and modules
 */
@Resolver(() => Role)
@Injectable()
export class RoleResolver {
  constructor(private roleRegistry: RoleRegistryService) {}

  /**
   * Get all roles
   */
  @RequireRoles('GOD_MODE', 'SYSTEM_ADMIN')
  @Query(() => [Role], { description: 'Get all roles' })
  async getRoles(): Promise<Role[]> {
    return this.roleRegistry.getAllRoles() as any;
  }

  /**
   * Get a single role by ID
   */
  @RequireRoles('GOD_MODE', 'SYSTEM_ADMIN')
  @Query(() => Role, { description: 'Get a role by ID' })
  async getRole(@Args('id', { type: () => ID }) id: string): Promise<Role> {
    const role = this.roleRegistry.getRoleMetadata(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role as any;
  }

  /**
   * Get all permissions for a role
   */
  @RequireRoles('GOD_MODE', 'SYSTEM_ADMIN')
  @Query(() => [Permission], { description: 'Get all permissions for a role' })
  async getRolePermissions(
    @Args('roleId', { type: () => ID }) roleId: string,
  ): Promise<Permission[]> {
    const role = this.roleRegistry.getRoleMetadata(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    return this.roleRegistry.getRolePermissions(roleId) as any;
  }

  /**
   * Get all modules for a role
   */
  @RequireRoles('GOD_MODE', 'SYSTEM_ADMIN')
  @Query(() => [Module], { description: 'Get all modules for a role' })
  async getRoleModules(
    @Args('roleId', { type: () => ID }) roleId: string,
  ): Promise<Module[]> {
    const role = this.roleRegistry.getRoleMetadata(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    return this.roleRegistry.getRoleModules(roleId) as any;
  }

  /**
   * Get role hierarchy (parent and children)
   */
  @RequireRoles('GOD_MODE', 'SYSTEM_ADMIN')
  @Query(() => [Role], { description: 'Get role hierarchy' })
  async getRoleHierarchy(
    @Args('roleId', { type: () => ID }) roleId: string,
  ): Promise<Role[]> {
    const role = this.roleRegistry.getRoleMetadata(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    return this.roleRegistry.getRoleHierarchy(roleId) as any;
  }

  /**
   * Check if a role has a specific permission
   */
  @RequireRoles('GOD_MODE', 'SYSTEM_ADMIN')
  @Query(() => Boolean, { description: 'Check if role has permission' })
  async roleHasPermission(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('permissionId', { type: () => ID }) permissionId: string,
  ): Promise<boolean> {
    return this.roleRegistry.hasPermission(roleId, permissionId);
  }

  /**
   * Check if a role can access a module
   */
  @RequireRoles('GOD_MODE', 'SYSTEM_ADMIN')
  @Query(() => Boolean, { description: 'Check if role can access module' })
  async roleCanAccessModule(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('moduleId', { type: () => ID }) moduleId: string,
  ): Promise<boolean> {
    return this.roleRegistry.canAccessModule(roleId, moduleId);
  }

  /**
   * Field resolver for permissions
   */
  @ResolveField(() => [Permission], { nullable: 'itemsAndList' })
  async permissions(@Parent() role: RoleMetadata): Promise<Permission[]> {
    const permissionMetadata = this.roleRegistry.getRolePermissions(role.id);
    return permissionMetadata.map((p) => ({
      id: p.id,
      action: p.action,
      subject: p.subject,
      description: p.description,
      category: p.category,
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  /**
   * Field resolver for modules
   */
  @ResolveField(() => [Module], { nullable: 'itemsAndList' })
  async modules(@Parent() role: RoleMetadata): Promise<Module[]> {
    const moduleMetadata = this.roleRegistry.getRoleModules(role.id);
    return moduleMetadata.map((m) => ({
      id: m.id,
      name: m.name,
      displayName: m.displayName,
      description: m.description,
      icon: m.icon,
      path: m.path,
      category: m.category,
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }
}
