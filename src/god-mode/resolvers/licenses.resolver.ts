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
import { LicensesManagementService } from '../services/licenses-management.service';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';

@ObjectType()
export class GodModeLicenseType {
  @Field()
  id: string;

  @Field()
  key: string;

  @Field()
  type: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  activatedAt?: Date;

  @Field(() => Int, { nullable: true })
  maxUsers?: number;

  @Field(() => Int, { nullable: true })
  currentUsers?: number;

  @Field(() => [String], { nullable: true })
  features?: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class LicensesResponseType {
  @Field(() => [GodModeLicenseType])
  licenses: GodModeLicenseType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
export class LicenseStatsType {
  @Field(() => Int)
  totalLicenses: number;

  @Field(() => Int)
  activeLicenses: number;

  @Field(() => Int)
  expiredLicenses: number;

  @Field(() => Int)
  totalUsers: number;

  @Field(() => Int)
  usersUsed: number;
}

@InputType()
export class CreateLicenseInputType {
  @Field()
  key: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field(() => Int, { nullable: true })
  maxUsers?: number;

  @Field(() => [String], { nullable: true })
  features?: string[];
}

@InputType()
export class UpdateLicenseInputType {
  @Field({ nullable: true })
  key?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field(() => Int, { nullable: true })
  maxUsers?: number;

  @Field(() => [String], { nullable: true })
  features?: string[];
}

@Resolver()
export class LicensesResolver {
  constructor(private licensesService: LicensesManagementService) {}

  @Query(() => LicensesResponseType, { name: 'godModeLicenses' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getLicenses(
    @Args('skip', { type: () => Int, nullable: true }) skip: number = 0,
    @Args('take', { type: () => Int, nullable: true }) take: number = 10,
    @Context() context: any,
  ) {
    return this.licensesService.getLicenses(skip, take);
  }

  @Query(() => GodModeLicenseType, { name: 'godModeLicense' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getLicense(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    return this.licensesService.getLicenseById(id);
  }

  @Query(() => LicensesResponseType, { name: 'godModeSearchLicenses' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async searchLicenses(
    @Args('query') query: string,
    @Args('skip', { type: () => Int, nullable: true }) skip: number = 0,
    @Args('take', { type: () => Int, nullable: true }) take: number = 10,
    @Context() context: any,
  ) {
    return this.licensesService.searchLicenses(query, skip, take);
  }

  @Query(() => LicenseStatsType, { name: 'godModeLicenseStats' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getLicenseStats(
    @Context() context: any,
  ) {
    return this.licensesService.getLicenseStats();
  }

  @Mutation(() => GodModeLicenseType, { name: 'godModeCreateLicense' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async createLicense(
    @Args('input') input: CreateLicenseInputType,
    @Context() context: any,
  ) {
    return this.licensesService.createLicense(input);
  }

  @Mutation(() => GodModeLicenseType, { name: 'godModeUpdateLicense' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async updateLicense(
    @Args('id') id: string,
    @Args('input') input: UpdateLicenseInputType,
    @Context() context: any,
  ) {
    return this.licensesService.updateLicense(id, input);
  }

  @Mutation(() => String, { name: 'godModeDeleteLicense' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async deleteLicense(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    const result = await this.licensesService.deleteLicense(id);
    return JSON.stringify(result);
  }

  @Mutation(() => GodModeLicenseType, { name: 'godModeActivateLicense' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async activateLicense(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    return this.licensesService.activateLicense(id);
  }

  @Mutation(() => GodModeLicenseType, { name: 'godModeDeactivateLicense' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async deactivateLicense(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    return this.licensesService.deactivateLicense(id);
  }
}
