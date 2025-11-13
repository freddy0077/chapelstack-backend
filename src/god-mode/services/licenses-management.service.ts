import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateLicenseInput {
  key: string;
  type: string;
  expiresAt?: Date;
  maxUsers?: number;
  features?: string[];
}

export interface UpdateLicenseInput {
  key?: string;
  type?: string;
  expiresAt?: Date;
  maxUsers?: number;
  features?: string[];
}

@Injectable()
export class LicensesManagementService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all licenses with pagination
   */
  async getLicenses(skip: number = 0, take: number = 10) {
    const [licenses, total] = await Promise.all([
      this.prisma.license.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.license.count(),
    ]);

    return {
      licenses,
      total,
      skip,
      take,
    };
  }

  /**
   * Get license by ID
   */
  async getLicenseById(id: string) {
    const license = await this.prisma.license.findUnique({
      where: { id },
    });

    if (!license) {
      throw new NotFoundException(`License with ID ${id} not found`);
    }

    return license;
  }

  /**
   * Search licenses by key or type
   */
  async searchLicenses(query: string, skip: number = 0, take: number = 10) {
    const [licenses, total] = await Promise.all([
      this.prisma.license.findMany({
        where: {
          OR: [
            { key: { contains: query, mode: 'insensitive' } },
            { type: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.license.count({
        where: {
          OR: [
            { key: { contains: query, mode: 'insensitive' } },
            { type: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      licenses,
      total,
      skip,
      take,
    };
  }

  /**
   * Get license statistics
   */
  async getLicenseStats() {
    const [totalLicenses, activeLicenses, expiredLicenses] = await Promise.all([
      this.prisma.license.count(),
      this.prisma.license.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.license.count({
        where: {
          status: 'EXPIRED',
        },
      }),
    ]);

    // Calculate total users
    const licenses = await this.prisma.license.findMany({
      select: {
        maxUsers: true,
      },
    });

    const totalUsers = licenses.reduce((sum, l) => sum + (l.maxUsers || 0), 0);

    return {
      totalLicenses,
      activeLicenses,
      expiredLicenses,
      totalUsers,
      usersUsed: 0, // Not tracked in current schema
    };
  }

  /**
   * Create new license
   */
  async createLicense(input: CreateLicenseInput) {
    // Check if license key already exists
    const existingLicense = await this.prisma.license.findFirst({
      where: { key: input.key },
    });

    if (existingLicense) {
      throw new BadRequestException(`License key "${input.key}" already exists`);
    }

    // Determine status based on expiration date
    let status = 'ACTIVE';
    if (input.expiresAt && new Date(input.expiresAt) < new Date()) {
      status = 'EXPIRED';
    }

    const license = await this.prisma.license.create({
      data: {
        id: input.key, // Use key as ID
        key: input.key,
        type: input.type,
        status,
        expiryDate: input.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        startDate: new Date(),
        maxUsers: input.maxUsers || 10,
        features: input.features || [],
        updatedAt: new Date(),
      },
    });

    return license;
  }

  /**
   * Update license
   */
  async updateLicense(id: string, input: UpdateLicenseInput) {
    // Verify license exists
    const license = await this.prisma.license.findUnique({
      where: { id },
    });

    if (!license) {
      throw new NotFoundException(`License with ID ${id} not found`);
    }

    // If updating key, check for duplicates
    if (input.key && input.key !== license.key) {
      const existingLicense = await this.prisma.license.findFirst({
        where: {
          key: input.key,
          id: { not: id },
        },
      });

      if (existingLicense) {
        throw new BadRequestException(`License key "${input.key}" already exists`);
      }
    }

    // Determine status based on expiration date
    let status = license.status;
    if (input.expiresAt) {
      if (new Date(input.expiresAt) < new Date()) {
        status = 'EXPIRED';
      } else if (status === 'EXPIRED') {
        status = 'ACTIVE';
      }
    }

    const updatedLicense = await this.prisma.license.update({
      where: { id },
      data: {
        key: input.key,
        type: input.type,
        expiryDate: input.expiresAt,
        maxUsers: input.maxUsers,
        features: input.features,
        status,
      },
    });

    return updatedLicense;
  }

  /**
   * Delete license
   */
  async deleteLicense(id: string) {
    // Verify license exists
    const license = await this.prisma.license.findUnique({
      where: { id },
    });

    if (!license) {
      throw new NotFoundException(`License with ID ${id} not found`);
    }

    await this.prisma.license.delete({
      where: { id },
    });

    return {
      success: true,
      message: `License deleted successfully`,
    };
  }

  /**
   * Activate license
   */
  async activateLicense(id: string) {
    // Verify license exists
    const license = await this.prisma.license.findUnique({
      where: { id },
    });

    if (!license) {
      throw new NotFoundException(`License with ID ${id} not found`);
    }

    const updatedLicense = await this.prisma.license.update({
      where: { id },
      data: {
        status: 'ACTIVE',
      },
    });

    return updatedLicense;
  }

  /**
   * Deactivate license
   */
  async deactivateLicense(id: string) {
    // Verify license exists
    const license = await this.prisma.license.findUnique({
      where: { id },
    });

    if (!license) {
      throw new NotFoundException(`License with ID ${id} not found`);
    }

    const updatedLicense = await this.prisma.license.update({
      where: { id },
      data: {
        status: 'INACTIVE',
      },
    });

    return updatedLicense;
  }

  /**
   * Validate license
   */
  async validateLicense(key: string) {
    const license = await this.prisma.license.findFirst({
      where: { key },
    });

    if (!license) {
      return {
        valid: false,
        message: 'License not found',
      };
    }

    if (license.status !== 'ACTIVE') {
      return {
        valid: false,
        message: `License is ${license.status.toLowerCase()}`,
      };
    }

    if (license.expiryDate && new Date(license.expiryDate) < new Date()) {
      return {
        valid: false,
        message: 'License has expired',
      };
    }

    return {
      valid: true,
      message: 'License is valid',
      license,
    };
  }
}
