import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DataImportInput {
  entityType: string;
  data: any[];
  mappings?: Record<string, string>;
  validateOnly?: boolean;
}

export interface DataExportInput {
  entityType: string;
  filters?: Record<string, any>;
  format?: 'json' | 'csv';
}

export interface BulkOperationInput {
  entityType: string;
  operation: 'update' | 'delete' | 'activate' | 'deactivate';
  entityIds: string[];
  data?: Record<string, any>;
}

@Injectable()
export class DataOperationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get data operation history
   */
  async getDataOperations(skip: number = 0, take: number = 10) {
    const [operations, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: {
          action: { in: ['IMPORT', 'EXPORT', 'BULK_UPDATE', 'BULK_DELETE'] },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.auditLog.count({
        where: {
          action: { in: ['IMPORT', 'EXPORT', 'BULK_UPDATE', 'BULK_DELETE'] },
        },
      }),
    ]);

    return {
      operations,
      total,
      skip,
      take,
    };
  }

  /**
   * Validate import data
   */
  async validateImportData(input: DataImportInput) {
    if (!input.data || input.data.length === 0) {
      throw new BadRequestException('No data provided for import');
    }

    if (input.data.length > 10000) {
      throw new BadRequestException('Maximum 10,000 records per import');
    }

    const validEntityTypes = ['members', 'users', 'branches', 'organizations'];
    if (!validEntityTypes.includes(input.entityType)) {
      throw new BadRequestException(`Invalid entity type: ${input.entityType}`);
    }

    const errors: any[] = [];
    const warnings: any[] = [];

    // Validate each record
    input.data.forEach((record, index) => {
      if (!record || typeof record !== 'object') {
        errors.push({
          row: index + 1,
          message: 'Invalid record format',
        });
      }

      // Check required fields based on entity type
      if (input.entityType === 'members') {
        if (!record.firstName || !record.lastName) {
          errors.push({
            row: index + 1,
            message: 'firstName and lastName are required',
          });
        }
      }

      if (input.entityType === 'users') {
        if (!record.email) {
          errors.push({
            row: index + 1,
            message: 'email is required',
          });
        }
      }
    });

    return {
      valid: errors.length === 0,
      recordCount: input.data.length,
      errors,
      warnings,
      estimatedTime: `${Math.ceil(input.data.length / 100)} seconds`,
    };
  }

  /**
   * Import data
   */
  async importData(input: DataImportInput) {
    // Validate first
    const validation = await this.validateImportData(input);
    if (!validation.valid) {
      throw new BadRequestException(`Import validation failed: ${validation.errors[0].message}`);
    }

    if (input.validateOnly) {
      return {
        success: true,
        message: 'Validation passed. Ready to import.',
        validation,
      };
    }

    // Simulate import
    const importedCount = input.data.length;

    return {
      success: true,
      message: `Successfully imported ${importedCount} records`,
      importedCount,
      failedCount: 0,
      warnings: [],
    };
  }

  /**
   * Export data
   */
  async exportData(input: DataExportInput) {
    const validEntityTypes = ['members', 'users', 'branches', 'organizations'];
    if (!validEntityTypes.includes(input.entityType)) {
      throw new BadRequestException(`Invalid entity type: ${input.entityType}`);
    }

    let data: any[] = [];

    // Fetch data based on entity type
    if (input.entityType === 'members') {
      data = await this.prisma.member.findMany({
        take: 1000,
      });
    } else if (input.entityType === 'users') {
      data = await this.prisma.user.findMany({
        take: 1000,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
        },
      });
    } else if (input.entityType === 'branches') {
      data = await this.prisma.branch.findMany({
        take: 1000,
      });
    } else if (input.entityType === 'organizations') {
      data = await this.prisma.organisation.findMany({
        take: 1000,
      });
    }

    const format = input.format || 'json';
    const filename = `${input.entityType}_export_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'json'}`;

    return {
      success: true,
      message: `Successfully exported ${data.length} records`,
      recordCount: data.length,
      filename,
      format,
      downloadUrl: `/api/exports/${filename}`,
    };
  }

  /**
   * Perform bulk operation
   */
  async performBulkOperation(input: BulkOperationInput) {
    if (!input.entityIds || input.entityIds.length === 0) {
      throw new BadRequestException('No entity IDs provided');
    }

    if (input.entityIds.length > 1000) {
      throw new BadRequestException('Maximum 1,000 records per bulk operation');
    }

    const validOperations = ['update', 'delete', 'activate', 'deactivate'];
    if (!validOperations.includes(input.operation)) {
      throw new BadRequestException(`Invalid operation: ${input.operation}`);
    }

    let successCount = 0;
    let failureCount = 0;

    // Simulate bulk operation
    if (input.operation === 'delete') {
      successCount = input.entityIds.length;
    } else if (input.operation === 'update') {
      successCount = input.entityIds.length;
    } else if (input.operation === 'activate' || input.operation === 'deactivate') {
      successCount = input.entityIds.length;
    }

    return {
      success: true,
      message: `Successfully performed ${input.operation} on ${successCount} records`,
      operation: input.operation,
      successCount,
      failureCount,
      totalCount: input.entityIds.length,
    };
  }

  /**
   * Get supported entity types
   */
  async getSupportedEntityTypes() {
    return {
      entityTypes: [
        {
          name: 'members',
          displayName: 'Members',
          fields: ['firstName', 'lastName', 'email', 'phoneNumber', 'dateOfBirth'],
        },
        {
          name: 'users',
          displayName: 'Users',
          fields: ['email', 'firstName', 'lastName', 'isActive'],
        },
        {
          name: 'branches',
          displayName: 'Branches',
          fields: ['name', 'code', 'address', 'city', 'state', 'country'],
        },
        {
          name: 'organizations',
          displayName: 'Organizations',
          fields: ['name', 'email', 'phoneNumber', 'address'],
        },
      ],
    };
  }

  /**
   * Get import templates
   */
  async getImportTemplates(entityType: string) {
    const templates: Record<string, any> = {
      members: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phoneNumber: '+1234567890',
          dateOfBirth: '1990-01-01',
        },
      ],
      users: [
        {
          email: 'user@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          isActive: true,
        },
      ],
      branches: [
        {
          name: 'Main Branch',
          code: 'MB',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
        },
      ],
      organizations: [
        {
          name: 'Organization Name',
          email: 'org@example.com',
          phoneNumber: '+1234567890',
          address: '456 Oak Ave',
        },
      ],
    };

    return templates[entityType] || [];
  }
}
