import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserAdminService } from '../services/user-admin.service';
import { User } from '../../auth/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PaginationInput } from '../../common/dto/pagination.input';
import { UserFilterInput } from '../dto/user-filter.input';
import { PaginatedUsers } from '../entities/paginated-users.entity';
import { UserBranch } from '../../auth/entities/user-branch.entity';
import { CreateBranchAdminInput } from '../dto/create-branch-admin.input';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class UserAdminResolver {
  constructor(private readonly userAdminService: UserAdminService) {}

  @Mutation(() => UserBranch)
  async createBranchAdmin(
    @Args('input') input: CreateBranchAdminInput,
  ): Promise<UserBranch> {
    // 1. Create the user and linked member in a single transaction
    const user = await this.userAdminService.createUser({
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      isActive: true,
      organisationId: input.organisationId,
    });

    // 2. Get the BRANCH_ADMIN role ID
    const branchAdminRoleId =
      await this.userAdminService.getBranchAdminRoleId();

    // 3. Assign the BRANCH_ADMIN SYSTEM role to the user
    await this.userAdminService.assignRoleToUser(user.id, branchAdminRoleId);

    // 4. Assign branch admin role (branch-specific)
    const userBranch = await this.userAdminService.assignBranchRoleToUser(
      user.id,
      input.branchId,
      branchAdminRoleId,
    );

    return {
      ...userBranch,
      branchId: userBranch.branchId ?? undefined,
      branch: userBranch.branch ?? undefined,
    };
  }

  @Query(() => PaginatedUsers, { name: 'adminUsers' })
  // @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  async findAllUsers(
    @Args('pagination', { nullable: true })
    paginationInput: PaginationInput = { skip: 0, take: 10 },
    @Args('filter', { nullable: true }) filterInput?: UserFilterInput,
  ) {
    return this.userAdminService.findAllUsers(paginationInput, filterInput);
  }

  @Query(() => User, { name: 'adminUser' })
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async findUserById(@Args('id', { type: () => ID }) id: string) {
    return this.userAdminService.findUserById(id);
  }

  @Mutation(() => User)
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  async updateUserActiveStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('isActive') isActive: boolean,
  ) {
    return this.userAdminService.updateUserActiveStatus(id, isActive);
  }

  @Mutation(() => User)
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  async assignRoleToUser(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('roleId', { type: () => ID }) roleId: string,
  ) {
    return this.userAdminService.assignRoleToUser(userId, roleId);
  }

  @Mutation(() => User)
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN')
  async removeRoleFromUser(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('roleId', { type: () => ID }) roleId: string,
  ) {
    return this.userAdminService.removeRoleFromUser(userId, roleId);
  }

  @Mutation(() => UserBranch)
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async assignBranchRoleToUser(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('assignedBy', { type: () => ID, nullable: true }) assignedBy?: string,
  ) {
    const userBranch = await this.userAdminService.assignBranchRoleToUser(
      userId,
      branchId,
      roleId,
      assignedBy,
    );
    return {
      ...userBranch,
      branchId: userBranch.branchId ?? undefined,
      branch: userBranch.branch ?? undefined,
    };
  }

  @Mutation(() => UserBranch)
  @Roles('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN')
  async removeBranchRoleFromUser(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('roleId', { type: () => ID }) roleId: string,
  ) {
    return this.userAdminService.removeBranchRoleFromUser(
      userId,
      branchId,
      roleId,
    );
  }
}
