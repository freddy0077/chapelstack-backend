import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { GuardiansService } from '../services/guardians.service';
import { ChildrenService } from '../services/children.service';
import { Guardian } from '../entities/guardian.entity';
import { CreateGuardianInput } from '../dto/create-guardian.input';
import { UpdateGuardianInput } from '../dto/update-guardian.input';
import { CreateChildGuardianRelationInput } from '../dto/create-child-guardian-relation.input';
import { ChildGuardianRelation } from '../entities/child-guardian-relation.entity';
import { Child } from '../entities/child.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Resolver(() => Guardian)
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class GuardiansResolver {
  constructor(
    private readonly guardiansService: GuardiansService,
    private readonly childrenService: ChildrenService,
  ) {}

  @Mutation(() => Guardian)
  @RequirePermissions({ action: 'create', subject: 'Guardian' })
  createGuardian(
    @Args('input') createGuardianInput: CreateGuardianInput,
  ): Promise<Guardian> {
    return this.guardiansService.create(createGuardianInput);
  }

  @Query(() => [Guardian], { name: 'guardians' })
  @RequirePermissions({ action: 'read', subject: 'Guardian' })
  findAll(
    @Args('branchId', { nullable: true }) branchId?: string,
  ): Promise<Guardian[]> {
    return this.guardiansService.findAll(branchId);
  }

  @Query(() => Guardian, { name: 'guardian' })
  @RequirePermissions({ action: 'read', subject: 'Guardian' })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Guardian> {
    return this.guardiansService.findOne(id);
  }

  @Mutation(() => Guardian)
  @RequirePermissions({ action: 'update', subject: 'Guardian' })
  updateGuardian(
    @Args('input') updateGuardianInput: UpdateGuardianInput,
  ): Promise<Guardian> {
    return this.guardiansService.update(
      updateGuardianInput.id,
      updateGuardianInput,
    );
  }

  @Mutation(() => Guardian)
  @RequirePermissions({ action: 'delete', subject: 'Guardian' })
  removeGuardian(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Guardian> {
    return this.guardiansService.remove(id);
  }

  @Mutation(() => ChildGuardianRelation)
  @RequirePermissions({ action: 'create', subject: 'ChildGuardianRelation' })
  createChildGuardianRelation(
    @Args('input') input: CreateChildGuardianRelationInput,
  ): Promise<ChildGuardianRelation> {
    return this.guardiansService.createChildGuardianRelation(input);
  }

  @Mutation(() => Boolean)
  @RequirePermissions({ action: 'delete', subject: 'ChildGuardianRelation' })
  removeChildGuardianRelation(
    @Args('childId', { type: () => ID }) childId: string,
    @Args('guardianId', { type: () => ID }) guardianId: string,
  ): Promise<boolean> {
    return this.guardiansService.removeChildGuardianRelation(
      childId,
      guardianId,
    );
  }

  @ResolveField('children', () => [Child])
  async getChildren(@Parent() guardian: Guardian): Promise<Child[]> {
    return this.childrenService.findByGuardian(guardian.id);
  }
}
