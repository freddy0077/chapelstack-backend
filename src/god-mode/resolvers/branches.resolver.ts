import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { BranchesManagementService } from '../services/branches-management.service';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';

@ObjectType()
export class BranchType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  postalCode?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;

  @Field()
  organisationId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class BranchesResponseType {
  @Field(() => [BranchType])
  branches: BranchType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}

@InputType()
export class CreateBranchInputType {
  @Field()
  organisationId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  postalCode?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true, defaultValue: true })
  isActive?: boolean;
}

@InputType()
export class UpdateBranchInputType {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  postalCode?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}

@Resolver()
export class BranchesResolver {
  constructor(private branchesService: BranchesManagementService) {}

  @Query(() => BranchesResponseType, { name: 'godModeBranches' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getBranches(
    @Args('organisationId') organisationId: string,
    @Args('skip', { type: () => Int, nullable: true }) skip: number = 0,
    @Args('take', { type: () => Int, nullable: true }) take: number = 10,
    @Context() context: any,
  ) {
    return this.branchesService.getBranches(organisationId, skip, take);
  }

  @Query(() => BranchType, { name: 'godModeBranch' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getBranch(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    return this.branchesService.getBranchById(id);
  }

  @Query(() => BranchesResponseType, { name: 'godModeSearchBranches' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async searchBranches(
    @Args('organisationId') organisationId: string,
    @Args('query') query: string,
    @Args('skip', { type: () => Int, nullable: true }) skip: number = 0,
    @Args('take', { type: () => Int, nullable: true }) take: number = 10,
    @Context() context: any,
  ) {
    return this.branchesService.searchBranches(organisationId, query, skip, take);
  }

  @Mutation(() => BranchType, { name: 'godModeCreateBranch' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async createBranch(
    @Args('input') input: CreateBranchInputType,
    @Context() context: any,
  ) {
    return this.branchesService.createBranch(input);
  }

  @Mutation(() => BranchType, { name: 'godModeUpdateBranch' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async updateBranch(
    @Args('id') id: string,
    @Args('input') input: UpdateBranchInputType,
    @Context() context: any,
  ) {
    return this.branchesService.updateBranch(id, input);
  }

  @Mutation(() => String, { name: 'godModeDeleteBranch' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async deleteBranch(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    const result = await this.branchesService.deleteBranch(id);
    return JSON.stringify(result);
  }
}
