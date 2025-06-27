import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ChildrenService } from '../services/children.service';
import { GuardiansService } from '../services/guardians.service';
import { Child } from '../entities/child.entity';
import { CreateChildInput } from '../dto/create-child.input';
import { UpdateChildInput } from '../dto/update-child.input';
import { ChildFilterInput } from '../dto/child-filter.input';
import { Guardian } from '../entities/guardian.entity';
import { CheckInRecord } from '../entities/check-in-record.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
// Import the PermissionsGuard that we created earlier
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { CanActivate } from '@nestjs/common';

@Resolver(() => Child)
@UseGuards(GqlAuthGuard, PermissionsGuard as unknown as CanActivate)
export class ChildrenResolver {
  constructor(
    private readonly childrenService: ChildrenService,
    private readonly guardiansService: GuardiansService,
  ) {}

  @Mutation(() => Child)
  @RequirePermissions({ action: 'create', subject: 'Child' })
  async createChild(
    @Args('input') createChildInput: CreateChildInput,
  ): Promise<Child> {
    try {
      return await this.childrenService.create(createChildInput);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create child: ${errorMessage}`);
    }
  }

  @Query(() => [Child], { name: 'children' })
  @RequirePermissions({ action: 'read', subject: 'Child' })
  async findAll(
    @Args('filter', { nullable: true }) filter?: ChildFilterInput,
  ): Promise<Child[]> {
    try {
      return await this.childrenService.findAll(filter);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to find children: ${errorMessage}`);
    }
  }

  @Query(() => Child, { name: 'child' })
  @RequirePermissions({ action: 'read', subject: 'Child' })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Child> {
    try {
      return await this.childrenService.findOne(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to find child: ${errorMessage}`);
    }
  }

  @Mutation(() => Child)
  @RequirePermissions({ action: 'update', subject: 'Child' })
  async updateChild(
    @Args('input') updateChildInput: UpdateChildInput,
  ): Promise<Child> {
    try {
      return await this.childrenService.update(
        updateChildInput.id,
        updateChildInput,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update child: ${errorMessage}`);
    }
  }

  @Mutation(() => Child)
  @RequirePermissions({ action: 'delete', subject: 'Child' })
  async removeChild(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Child> {
    try {
      return await this.childrenService.remove(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to remove child: ${errorMessage}`);
    }
  }

  @ResolveField('guardians', () => [Guardian])
  async getGuardians(@Parent() child: Child): Promise<Guardian[]> {
    return this.guardiansService.findByChild(child.id);
  }

  @ResolveField('recentCheckIns', () => [CheckInRecord])
  async recentCheckIns(@Parent() child: Child): Promise<CheckInRecord[]> {
    try {
      const checkIns = await this.childrenService.getRecentCheckIns(child.id);
      return checkIns as CheckInRecord[];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get recent check-ins: ${errorMessage}`);
    }
  }
}
