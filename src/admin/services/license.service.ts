/**
 * NOTE: This service is temporarily disabled due to missing 'license' model in Prisma schema.
 * To enable this service, add the License model to the Prisma schema and run 'prisma generate'.
 */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateLicenseInput,
  UpdateLicenseInput,
  LicenseFilterInput,
} from '../dto/license.input';
import {
  License,
  LicenseStatus,
  LicenseType,
} from '../entities/license.entity';
import { AuditLogService } from '../../audit/services/audit-log.service';
import * as crypto from 'crypto';
import {
  PrismaLicense,
  PrismaClientWithLicense,
} from '../types/prisma-temp.types';

@Injectable()
export class LicenseService {
  private readonly logger = new Logger(LicenseService.name);

  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {
    // This is a temporary workaround until the License model is added to the Prisma schema
  }

  /**
   * Map Prisma License model to GraphQL License entity
   */
  private mapToEntity(license: Record<string, any>): License {
    // Explicitly map all fields to ensure type safety
    return {
      id: license.id,
      key: license.key,
      type: license.type as unknown as LicenseType,
      status: license.status as unknown as LicenseStatus,
      startDate: license.startDate,
      expiryDate: license.expiryDate,
      features: license.features || {},
      organizationName: license.organizationName || undefined,
      contactEmail: license.contactEmail || undefined,
      contactPhone: license.contactPhone || undefined,
      maxUsers: license.maxUsers || undefined,
      maxBranches: license.maxBranches || undefined,
      notes: license.notes || undefined,
      createdAt: license.createdAt,
      updatedAt: license.updatedAt,
    };
  }

  async createLicense(
    input: CreateLicenseInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<License> {
    // Validate license key if needed
    if (!this.isValidLicenseKey(input.key)) {
      throw new Error('Invalid license key format');
    }

    // Validate dates
    if (new Date(input.expiryDate) <= new Date(input.startDate)) {
      throw new Error('Expiry date must be after start date');
    }

    try {
      const license = await (
        this.prisma as unknown as PrismaClientWithLicense
      ).license.create({
        // Cast the entire data object to any to bypass TypeScript checking
        // This is necessary because the Prisma model and DTO don't match
        data: {
          key: input.key,
          type: input.type as unknown as string, // Cast to string for Prisma
          status: input.status as unknown as string, // Cast to string for Prisma
          startDate: new Date(input.startDate),
          expiryDate: new Date(input.expiryDate),
          organizationName: input.organizationName,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
          features: input.features || {},
          maxUsers: input.maxUsers,
          maxBranches: input.maxBranches,
          notes: input.notes,
        } as any,
      });

      // Log the action
      await this.auditLogService.create({
        action: 'LICENSE_CREATED',
        entityType: 'License',
        entityId: license.id,
        description: `Created ${input.type} license for ${input.organizationName || 'organization'}`,
        metadata: { licenseType: input.type, licenseStatus: input.status },
        userId,
        ipAddress,
        userAgent,
      });

      return this.mapToEntity(license);
    } catch (error) {
      this.logger.error(
        `Error creating license: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getLicense(id: string): Promise<License> {
    try {
      const license = await (
        this.prisma as unknown as PrismaClientWithLicense
      ).license.findUnique({
        where: { id },
      });

      if (!license) {
        throw new NotFoundException(`License with ID ${id} not found`);
      }

      return this.mapToEntity(license);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error fetching license: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getLicenseByKey(key: string): Promise<License> {
    try {
      const license = await (
        this.prisma as unknown as PrismaClientWithLicense
      ).license.findUnique({
        where: { key },
      });

      if (!license) {
        throw new NotFoundException(`License with key ${key} not found`);
      }

      return this.mapToEntity(license);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error fetching license by key: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getLicenses(filter?: LicenseFilterInput): Promise<License[]> {
    try {
      const where = this.buildFilterWhereClause(filter);

      const licenses = await (
        this.prisma as unknown as PrismaClientWithLicense
      ).license.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return licenses.map((license) => this.mapToEntity(license));
    } catch (error) {
      this.logger.error(
        `Error fetching licenses: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async updateLicense(
    id: string,
    input: UpdateLicenseInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<License> {
    try {
      const license = await (
        this.prisma as unknown as PrismaClientWithLicense
      ).license.findUnique({
        where: { id },
      });

      if (!license) {
        throw new NotFoundException(`License with ID ${id} not found`);
      }

      // Validate dates if provided
      if (input.expiryDate && new Date(input.expiryDate) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }

      const updatedLicense = await (
        this.prisma as unknown as PrismaClientWithLicense
      ).license.update({
        where: { id },
        data: {
          status: input.status as unknown as string,
          expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
          organizationName: input.organizationName,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
          features: input.features || {},
          maxUsers: input.maxUsers,
          maxBranches: input.maxBranches,
          notes: input.notes,
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'LICENSE_UPDATED',
        entityType: 'License',
        entityId: id,
        description: `Updated license for ${updatedLicense.organizationName || 'organization'}`,
        metadata: {
          licenseType: updatedLicense.type,
          licenseStatus: updatedLicense.status,
          changes: this.getChanges(license, updatedLicense),
        },
        userId,
        ipAddress,
        userAgent,
      });

      return this.mapToEntity(updatedLicense);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error updating license: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async deleteLicense(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    try {
      const license = await (
        this.prisma as unknown as PrismaClientWithLicense
      ).license.findUnique({
        where: { id },
      });

      if (!license) {
        throw new NotFoundException(`License with ID ${id} not found`);
      }

      await (this.prisma as unknown as PrismaClientWithLicense).license.delete({
        where: { id },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'LICENSE_DELETED',
        entityType: 'License',
        entityId: id,
        description: `Deleted license for ${license.organizationName || 'organization'}`,
        metadata: {
          licenseType: license.type as unknown as string,
          licenseKey: license.key,
        },
        userId,
        ipAddress,
        userAgent,
      });

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error deleting license: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async validateCurrentLicense(): Promise<{
    isValid: boolean;
    details?: Record<string, any>;
  }> {
    try {
      // Get the most recent active license
      const license = await (
        this.prisma as unknown as PrismaClientWithLicense
      ).license.findFirst({
        where: {
          status: LicenseStatus.ACTIVE as unknown as string,
          expiryDate: {
            gte: new Date(),
          },
        },
        orderBy: {
          expiryDate: 'desc',
        },
      });

      if (!license) {
        return {
          isValid: false,
          details: {
            reason: 'No active license found',
            action: 'Please contact support to obtain a valid license',
          },
        };
      }

      // Check if the license is about to expire (within 30 days)
      const expiryDate = new Date(license.expiryDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      if (expiryDate <= thirtyDaysFromNow) {
        return {
          isValid: true,
          details: {
            licenseId: license.id,
            type: license.type as unknown as string,
            expiryDate: license.expiryDate,
            warning: 'License will expire soon',
            daysRemaining: Math.ceil(
              (expiryDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          },
        };
      }

      return {
        isValid: true,
        details: {
          licenseId: license.id,
          type: license.type as unknown as string,
          expiryDate: license.expiryDate,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error validating license: ${(error as Error).message}`,
        (error as Error).stack,
      );
      return {
        isValid: false,
        details: {
          reason: 'Error validating license',
          action: 'Please contact support',
        },
      };
    }
  }

  async generateLicenseKey(): Promise<string> {
    try {
      // Generate a random license key with a specific format
      const prefix = 'CHURCH';
      const randomBytes = crypto.randomBytes(16).toString('hex').toUpperCase();

      // Format as CHURCH-XXXX-XXXX-XXXX-XXXX
      const segments: string[] = [];
      for (let i = 0; i < 16; i += 4) {
        segments.push(randomBytes.substring(i, i + 4));
      }

      return `${prefix}-${segments.join('-')}`;
    } catch (error) {
      this.logger.error(
        `Error generating license key: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  private isValidLicenseKey(key: string): boolean {
    // Validate license key format (e.g., CHURCH-XXXX-XXXX-XXXX-XXXX)
    const keyPattern =
      /^CHURCH-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
    return keyPattern.test(key);
  }

  private buildFilterWhereClause(
    filter?: LicenseFilterInput,
  ): Record<string, any> {
    if (!filter) return {} as Record<string, any>;

    const where: Record<string, any> = {};

    if (filter.id) {
      where.id = filter.id;
    }

    if (filter.key) {
      where.key = filter.key;
    }

    if (filter.type) {
      where.type = filter.type as unknown as string;
    }

    if (filter.status) {
      where.status = filter.status as unknown as string;
    }

    if (filter.organizationName) {
      where.organizationName = {
        contains: filter.organizationName,
        mode: 'insensitive',
      };
    }

    return where;
  }

  private getChanges(
    oldLicense: Record<string, any>,
    newLicense: Record<string, any>,
  ): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};

    for (const key in newLicense) {
      if (JSON.stringify(oldLicense[key]) !== JSON.stringify(newLicense[key])) {
        changes[key] = {
          old: oldLicense[key],
          new: newLicense[key],
        };
      }
    }

    return changes;
  }
}
