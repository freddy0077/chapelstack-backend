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
import { OrganizationManagementService } from '../services/organization-management.service';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';

@ObjectType()
export class OrganizationType {
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
  website?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  status: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class OrganizationStatsType {
  @Field()
  organizationId: string;

  @Field()
  organizationName: string;

  @Field(() => Int)
  totalMembers: number;

  @Field(() => Int)
  totalUsers: number;

  @Field(() => Int)
  totalBranches: number;

  @Field(() => Int)
  totalTransactions: number;
}

@ObjectType()
export class OrganizationsResponseType {
  @Field(() => [OrganizationType])
  organizations: OrganizationType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}

@InputType()
export class CreateOrganizationInputType {
  @Field()
  name: string;

  @Field()
  email: string;

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
  website?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class UpdateOrganizationInputType {
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
  website?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  status?: string;
}

@Resolver()
export class OrganizationResolver {
  constructor(private organizationService: OrganizationManagementService) {}

  @Query(() => OrganizationsResponseType, { name: 'godModeOrganizations' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getOrganizations(
    @Args('skip', { type: () => Int, nullable: true }) skip: number = 0,
    @Args('take', { type: () => Int, nullable: true }) take: number = 10,
    @Context() context: any,
  ) {
    return this.organizationService.getOrganizations(skip, take);
  }

  @Query(() => OrganizationType, { name: 'godModeOrganization' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getOrganization(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    return this.organizationService.getOrganizationById(id);
  }

  @Query(() => OrganizationStatsType, { name: 'godModeOrganizationStats' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getOrganizationStats(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    return this.organizationService.getOrganizationStats(id);
  }

  @Query(() => OrganizationsResponseType, { name: 'godModeSearchOrganizations' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async searchOrganizations(
    @Args('query') query: string,
    @Args('skip', { type: () => Int, nullable: true }) skip: number = 0,
    @Args('take', { type: () => Int, nullable: true }) take: number = 10,
    @Context() context: any,
  ) {
    return this.organizationService.searchOrganizations(query, skip, take);
  }

  @Mutation(() => OrganizationType, { name: 'godModeCreateOrganization' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async createOrganization(
    @Args('input') input: CreateOrganizationInputType,
    @Context() context: any,
  ) {
    return this.organizationService.createOrganization(input);
  }

  @Mutation(() => OrganizationType, { name: 'godModeUpdateOrganization' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async updateOrganization(
    @Args('id') id: string,
    @Args('input') input: UpdateOrganizationInputType,
    @Context() context: any,
  ) {
    return this.organizationService.updateOrganization(id, input);
  }

  @Mutation(() => String, { name: 'godModeDeleteOrganization' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async deleteOrganization(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    const result = await this.organizationService.deleteOrganization(id);
    return JSON.stringify(result);
  }
}
