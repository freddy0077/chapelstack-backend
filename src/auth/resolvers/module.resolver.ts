import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Module } from '../entities/module.entity';
import { RoleRegistryService } from '../services/role-registry.service';
import { RequireRoles } from '../decorators/require-access.decorator';

/**
 * Module GraphQL Resolver
 * Provides queries for accessing modules
 */
@Resolver(() => Module)
@Injectable()
export class ModuleResolver {
  constructor(private roleRegistry: RoleRegistryService) {}

  /**
   * Get all modules
   */
  @RequireRoles('ADMIN', 'SUBSCRIPTION_MANAGER', 'BRANCH_ADMIN', 'ADMIN')
  @Query(() => [Module], { description: 'Get all modules' })
  async getModules(): Promise<Module[]> {
    return this.roleRegistry.getAllModules() as any;
  }

  /**
   * Get a single module by ID
   */
  @RequireRoles('ADMIN', 'SUBSCRIPTION_MANAGER', 'BRANCH_ADMIN', 'ADMIN')
  @Query(() => Module, { description: 'Get a module by ID' })
  async getModule(@Args('id', { type: () => ID }) id: string): Promise<Module> {
    const module = this.roleRegistry.getAllModules().find((m) => m.id === id);
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return module as any;
  }

  /**
   * Get module by path
   */
  @RequireRoles('ADMIN', 'SUBSCRIPTION_MANAGER', 'BRANCH_ADMIN', 'ADMIN')
  @Query(() => Module, { description: 'Get module by path' })
  async getModuleByPath(@Args('path') path: string): Promise<Module> {
    const module = this.roleRegistry.getModuleByPath(path);
    if (!module) {
      throw new NotFoundException(`Module with path ${path} not found`);
    }
    return module as any;
  }

  /**
   * Get modules accessible to user based on roles
   */
  @RequireRoles('ADMIN', 'SUBSCRIPTION_MANAGER', 'BRANCH_ADMIN', 'ADMIN')
  @Query(() => [Module], { description: 'Get modules accessible to user' })
  async getUserAccessibleModules(
    @Args('userRoles', { type: () => [String] }) userRoles: string[],
  ): Promise<Module[]> {
    const allModules = this.roleRegistry.getAllModules();
    return allModules.filter((module) =>
      this.roleRegistry.canUserAccessModule(userRoles, module.id),
    ) as any;
  }
}
