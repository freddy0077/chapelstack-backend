import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { UseGuards } from '@nestjs/common';
import { LicenseService } from '../services/license.service';
import { License } from '../entities/license.entity';
import {
  CreateLicenseInput,
  UpdateLicenseInput,
  LicenseFilterInput,
} from '../dto/license.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver(() => License)
@UseGuards(JwtAuthGuard, RolesGuard)
export class LicenseResolver {
  constructor(private readonly licenseService: LicenseService) {}

  @Mutation(() => License)
  @Roles('SUPER_ADMIN') // Restrict to super admins only
  async createLicense(
    @Args('input') input: CreateLicenseInput,
    @Context() context: any,
  ): Promise<License> {
    const { req } = context;
    const userId = req.user?.id;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.licenseService.createLicense(
      input,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Query(() => License)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async license(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<License> {
    return this.licenseService.getLicense(id);
  }

  @Query(() => License)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async licenseByKey(@Args('key') key: string): Promise<License> {
    return this.licenseService.getLicenseByKey(key);
  }

  @Query(() => [License])
  @Roles('SUPER_ADMIN', 'ADMIN')
  async licenses(
    @Args('filter', { nullable: true }) filter?: LicenseFilterInput,
  ): Promise<License[]> {
    return this.licenseService.getLicenses(filter);
  }

  @Mutation(() => License)
  @Roles('SUPER_ADMIN')
  async updateLicense(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('input') input: UpdateLicenseInput,
    @Context() context: any,
  ): Promise<License> {
    const { req } = context;
    const userId = req.user?.id;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.licenseService.updateLicense(
      id,
      input,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Boolean)
  @Roles('SUPER_ADMIN')
  async deleteLicense(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const { req } = context;
    const userId = req.user?.id;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.licenseService.deleteLicense(id, userId, ipAddress, userAgent);
  }

  @Query(() => String)
  @Roles('SUPER_ADMIN')
  async generateLicenseKey(): Promise<string> {
    return this.licenseService.generateLicenseKey();
  }

  @Query(() => GraphQLJSON)
  async validateCurrentLicense(): Promise<{
    isValid: boolean;
    details?: Record<string, any>;
  }> {
    return this.licenseService.validateCurrentLicense();
  }
}
