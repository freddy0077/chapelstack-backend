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
import { UserManagementService } from '../services/user-management.service';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  organisationId?: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field({ nullable: true })
  lastLogin?: Date;
}

@ObjectType()
export class UsersResponseType {
  @Field(() => [UserType])
  users: UserType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}

@InputType()
export class CreateUserInputType {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  password: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  organisationId?: string;

  @Field({ nullable: true })
  status?: string;
}

@InputType()
export class UpdateUserInputType {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  organisationId?: string;
}

@Resolver()
export class UserManagementResolver {
  constructor(private userManagementService: UserManagementService) {}

  @Query(() => UsersResponseType, { name: 'godModeUsers' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getUsers(
    @Args('skip', { type: () => Int, nullable: true }) skip: number = 0,
    @Args('take', { type: () => Int, nullable: true }) take: number = 10,
    @Context() context: any,
  ) {
    return this.userManagementService.getUsers(skip, take);
  }

  @Query(() => UserType, { name: 'godModeUser' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getUser(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    return this.userManagementService.getUserById(id);
  }

  @Query(() => UsersResponseType, { name: 'godModeSearchUsers' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async searchUsers(
    @Args('query') query: string,
    @Args('skip', { type: () => Int, nullable: true }) skip: number = 0,
    @Args('take', { type: () => Int, nullable: true }) take: number = 10,
    @Context() context: any,
  ) {
    return this.userManagementService.searchUsers(query, skip, take);
  }

  @Query(() => UsersResponseType, { name: 'godModeUsersByRole' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getUsersByRole(
    @Args('role') role: string,
    @Args('skip', { type: () => Int, nullable: true }) skip: number = 0,
    @Args('take', { type: () => Int, nullable: true }) take: number = 10,
    @Context() context: any,
  ) {
    return this.userManagementService.getUsersByRole(role, skip, take);
  }

  @Query(() => String, { name: 'godModeUserActivity' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getUserActivity(
    @Args('userId') userId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit: number = 20,
    @Context() context: any,
  ) {
    const activities = await this.userManagementService.getUserActivity(userId, limit);
    return JSON.stringify(activities);
  }

  @Mutation(() => UserType, { name: 'godModeCreateUser' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async createUser(
    @Args('input') input: CreateUserInputType,
    @Context() context: any,
  ) {
    return this.userManagementService.createUser(input);
  }

  @Mutation(() => UserType, { name: 'godModeUpdateUser' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserInputType,
    @Context() context: any,
  ) {
    return this.userManagementService.updateUser(id, input);
  }

  @Mutation(() => String, { name: 'godModeDeleteUser' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async deleteUser(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    const result = await this.userManagementService.deleteUser(id);
    return JSON.stringify(result);
  }

  @Mutation(() => String, { name: 'godModeResetUserPassword' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async resetUserPassword(
    @Args('userId') userId: string,
    @Args('newPassword') newPassword: string,
    @Context() context: any,
  ) {
    const result = await this.userManagementService.resetUserPassword(userId, newPassword);
    return JSON.stringify(result);
  }
}
