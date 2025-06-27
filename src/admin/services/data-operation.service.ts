import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDataImportInput,
  CreateDataExportInput,
  DataOperationFilterInput,
} from '../dto/data-operation.input';
import {
  DataOperation,
  DataOperationStatus,
  DataOperationType,
} from '../entities/data-operation.entity';
import { AuditLogService } from './audit-log.service';
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore - csv-parser doesn't have proper TypeScript types
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { Prisma } from '@prisma/client';

// Define types for CSV processing results
interface CsvProcessingResult {
  successCount: number;
  errorCount: number;
  errors: Array<{ row: Record<string, any>; message: string }>;
}

// Define types for import results
interface ImportResult {
  success: boolean;
  errors?: Array<{ row: Record<string, any>; message: string }>;
}

@Injectable()
export class DataOperationService {
  private readonly logger = new Logger(DataOperationService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');
  private readonly exportsDir = path.join(process.cwd(), 'exports');

  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {
    // Ensure directories exist
    this.ensureDirectoryExists(this.uploadsDir);
    this.ensureDirectoryExists(this.exportsDir);
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Map Prisma DataOperation model to GraphQL DataOperation entity
   */
  private mapToEntity(dataOperation: any): DataOperation {
    return {
      ...dataOperation,
      type: dataOperation.type as DataOperationType,
      status: dataOperation.status as DataOperationStatus,
      metadata: dataOperation.metadata || undefined,
      filePath: dataOperation.filePath || undefined,
      fileSize: dataOperation.fileSize || undefined,
      duration: dataOperation.duration || undefined,
      errorDetails: dataOperation.errorDetails || undefined,
      userId: dataOperation.userId || undefined,
      user: dataOperation.user || undefined,
    };
  }

  async createDataImport(
    input: CreateDataImportInput,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<DataOperation> {
    const dataOperation = await this.prisma.dataOperation.create({
      data: {
        type: DataOperationType.IMPORT as unknown as string, // Cast to string for Prisma
        status: DataOperationStatus.PENDING as unknown as string, // Cast to string for Prisma
        entityType: input.entityType,
        description: input.description,
        metadata: input.metadata || {},
        filePath: input.filePath,
        userId: input.userId,
      },
    });

    // Log the action
    await this.auditLogService.createAuditLog({
      action: 'DATA_IMPORT_CREATED',
      entityType: 'DataOperation',
      entityId: dataOperation.id,
      description: `Created data import operation for ${input.entityType}`,
      metadata: { operationType: 'IMPORT', entityType: input.entityType },
      userId: input.userId,
      ipAddress,
      userAgent,
    });

    // Process the import asynchronously
    this.processImport(dataOperation.id).catch((error) => {
      this.logger.error(
        `Error processing import ${dataOperation.id}: ${error.message}`,
        error.stack,
      );
    });

    return this.mapToEntity(dataOperation);
  }

  async createDataExport(
    input: CreateDataExportInput,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<DataOperation> {
    const dataOperation = await this.prisma.dataOperation.create({
      data: {
        type: DataOperationType.EXPORT as unknown as string, // Cast to string for Prisma
        status: DataOperationStatus.PENDING as unknown as string, // Cast to string for Prisma
        entityType: input.entityType,
        description: input.description,
        metadata: input.metadata || {},
        userId: input.userId,
      },
    });

    // Log the action
    await this.auditLogService.createAuditLog({
      action: 'DATA_EXPORT_CREATED',
      entityType: 'DataOperation',
      entityId: dataOperation.id,
      description: `Created data export operation for ${input.entityType}`,
      metadata: { operationType: 'EXPORT', entityType: input.entityType },
      userId: input.userId,
      ipAddress,
      userAgent,
    });

    // Process the export asynchronously
    this.processExport(dataOperation.id).catch((error) => {
      this.logger.error(
        `Error processing export ${dataOperation.id}: ${error.message}`,
        error.stack,
      );
    });

    return this.mapToEntity(dataOperation);
  }

  async getDataOperation(id: string): Promise<DataOperation> {
    const dataOperation = await this.prisma.dataOperation.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!dataOperation) {
      throw new NotFoundException(`Data operation with ID ${id} not found`);
    }

    return this.mapToEntity(dataOperation);
  }

  async getDataOperations(
    filter?: DataOperationFilterInput,
  ): Promise<DataOperation[]> {
    const where = this.buildFilterWhereClause(filter);

    const operations = await this.prisma.dataOperation.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return operations.map((op) => this.mapToEntity(op));
  }

  async cancelDataOperation(
    id: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<DataOperation> {
    const dataOperation = await this.prisma.dataOperation.findUnique({
      where: { id },
    });

    if (!dataOperation) {
      throw new NotFoundException(`Data operation with ID ${id} not found`);
    }

    if (
      dataOperation.status === DataOperationStatus.COMPLETED ||
      dataOperation.status === DataOperationStatus.FAILED
    ) {
      throw new Error(
        `Cannot cancel operation in ${dataOperation.status} status`,
      );
    }

    const updatedOperation = await this.prisma.dataOperation.update({
      where: { id },
      data: {
        status: DataOperationStatus.CANCELLED as unknown as string, // Cast to string for Prisma
      },
    });

    // Log the action
    await this.auditLogService.createAuditLog({
      action: 'DATA_OPERATION_CANCELLED',
      entityType: 'DataOperation',
      entityId: id,
      description: `Cancelled ${dataOperation.type.toLowerCase()} operation for ${dataOperation.entityType}`,
      userId,
      ipAddress,
      userAgent,
    });

    return this.mapToEntity(updatedOperation);
  }

  private buildFilterWhereClause(filter?: DataOperationFilterInput): any {
    if (!filter) return {};

    const where: any = {};

    if (filter.id) {
      where.id = filter.id;
    }

    if (filter.type) {
      where.type = filter.type;
    }

    if (filter.entityType) {
      where.entityType = filter.entityType;
    }

    if (filter.userId) {
      where.userId = filter.userId;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.startDate || filter.endDate) {
      where.createdAt = {};

      if (filter.startDate) {
        where.createdAt.gte = new Date(filter.startDate);
      }

      if (filter.endDate) {
        where.createdAt.lte = new Date(filter.endDate);
      }
    }

    return where;
  }

  private async processImport(operationId: string): Promise<void> {
    try {
      const operation = await this.prisma.dataOperation.findUnique({
        where: { id: operationId },
      });

      if (!operation) {
        throw new NotFoundException(
          `Data operation with ID ${operationId} not found`,
        );
      }

      if (
        operation.status !== (DataOperationStatus.PENDING as unknown as string)
      ) {
        this.logger.warn(
          `Skipping import for operation ${operationId} with status ${operation.status}`,
        );
        return;
      }

      // Update status to processing
      await this.prisma.dataOperation.update({
        where: { id: operationId },
        data: {
          status: DataOperationStatus.IN_PROGRESS as unknown as string,
        },
      });

      // Get file path from operation
      const filePath = operation.filePath;
      if (!filePath || !fs.existsSync(filePath)) {
        throw new Error(`Import file not found: ${filePath}`);
      }

      // Process the file based on entity type
      const startTime = Date.now();
      let results: CsvProcessingResult;

      switch (operation.entityType.toLowerCase()) {
        case 'member':
        case 'members':
          results = await this.processCsvImport(
            filePath,
            this.importMember.bind(this),
          );
          break;
        case 'user':
        case 'users':
          results = await this.processCsvImport(
            filePath,
            this.importUser.bind(this),
          );
          break;
        default:
          throw new Error(`Unsupported entity type: ${operation.entityType}`);
      }

      const duration = Date.now() - startTime;

      // Update operation with results
      await this.prisma.dataOperation.update({
        where: { id: operationId },
        data: {
          status: DataOperationStatus.COMPLETED as unknown as string,
          completedAt: new Date(),

          recordCount: results.successCount + results.errorCount,
          errorCount: results.errorCount,
          metadata:
            results.errorCount > 0
              ? ({ errors: results.errors } as Prisma.InputJsonValue)
              : undefined,
        },
      });

      this.logger.log(
        `Import completed for operation ${operationId}: ${results.successCount} succeeded, ${results.errorCount} failed`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing import ${operationId}: ${(error as Error).message}`,
        (error as Error).stack,
      );

      // Update operation with error status
      await this.prisma.dataOperation.update({
        where: { id: operationId },
        data: {
          status: DataOperationStatus.FAILED as unknown as string,
          completedAt: new Date(),
          metadata: {
            errorDetails: {
              message: (error as Error).message,
              stack: (error as Error).stack,
            },
          } as Prisma.InputJsonValue,
        },
      });
    }
  }

  private async processExport(operationId: string): Promise<void> {
    try {
      const operation = await this.prisma.dataOperation.findUnique({
        where: { id: operationId },
      });

      if (!operation) {
        throw new NotFoundException(
          `Data operation with ID ${operationId} not found`,
        );
      }

      if (
        operation.status !== (DataOperationStatus.PENDING as unknown as string)
      ) {
        this.logger.warn(
          `Skipping export for operation ${operationId} with status ${operation.status}`,
        );
        return;
      }

      // Update status to processing
      await this.prisma.dataOperation.update({
        where: { id: operationId },
        data: {
          status: DataOperationStatus.IN_PROGRESS as unknown as string,
        },
      });

      const entityType = operation.entityType.toLowerCase();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${entityType}-export-${timestamp}.csv`;
      const filePath = path.join(this.exportsDir, fileName);

      // Process based on entity type
      const startTime = Date.now();
      let recordCount = 0;

      switch (entityType) {
        case 'member':
        case 'members':
          recordCount = await this.exportMembers(filePath);
          break;

        case 'user':
        case 'users':
          recordCount = await this.exportUsers(filePath);
          break;

        // Add other entity types as needed

        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }

      // Get file size
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      const duration = Date.now() - startTime;

      // Update operation with results
      await this.prisma.dataOperation.update({
        where: { id: operationId },
        data: {
          status: DataOperationStatus.COMPLETED as unknown as string,
          filePath,
          fileSize,
          completedAt: new Date(),

          recordCount: recordCount,
        },
      });

      this.logger.log(
        `Export completed for operation ${operationId}: ${recordCount} records exported`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing export ${operationId}: ${(error as Error).message}`,
        (error as Error).stack,
      );

      // Update operation with error status
      await this.prisma.dataOperation.update({
        where: { id: operationId },
        data: {
          status: DataOperationStatus.FAILED as unknown as string,
          completedAt: new Date(),
          metadata: {
            errorDetails: {
              message: (error as Error).message,
              stack: (error as Error).stack,
            },
          } as Prisma.InputJsonValue,
        },
      });
    }
  }

  private async processCsvImport(
    filePath: string,
    processRowFn: (row: any) => Promise<void>,
  ): Promise<CsvProcessingResult> {
    return new Promise((resolve, reject) => {
      const results: CsvProcessingResult = {
        successCount: 0,
        errorCount: 0,
        errors: [],
      };

      const rows: any[] = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', async () => {
          // Process rows sequentially to avoid race conditions
          for (const row of rows) {
            try {
              await processRowFn(row);
              results.successCount++;
            } catch (error) {
              results.errorCount++;
              results.errors.push({
                row,
                message: (error as Error).message,
              });
            }
          }
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private async importMember(row: any): Promise<void> {
    // Since there's no member model in the Prisma service, we need to implement this
    // based on the actual database schema. For now, we'll log a warning and skip.
    this.logger.warn(
      'Member import not implemented - prisma.member model not available',
    );

    // When the member model is added to the Prisma schema, uncomment and customize this:
    /*
    await this.prisma.member.create({
      data: {
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phoneNumber: row.phoneNumber,
        // Add other fields as needed
      },
    });
    */
  }

  private async importUser(row: any): Promise<void> {
    // Generate a temporary password hash for imported users
    // In a real implementation, you would want to generate a random password
    // and send it to the user via email, or implement a password reset flow
    const tempPasswordHash = 'TEMPORARY_HASH_PLACEHOLDER'; // This should be a proper hash in production

    await this.prisma.user.create({
      data: {
        email: row.email,
        firstName: row.firstName,
        lastName: row.lastName,
        phoneNumber: row.phoneNumber,
        passwordHash: tempPasswordHash, // Required field
        // Add other fields as needed
      },
    });
  }

  private async exportMembers(filePath: string): Promise<number> {
    // Since there's no member model in the Prisma service, we need to implement this
    // based on the actual database schema. For now, we'll log a warning and return 0.
    this.logger.warn(
      'Member export not implemented - prisma.member model not available',
    );

    // Create an empty CSV file to avoid errors
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'firstName', title: 'First Name' },
        { id: 'lastName', title: 'Last Name' },
        { id: 'email', title: 'Email' },
        { id: 'phoneNumber', title: 'Phone Number' },
      ],
    });

    // Write empty records array
    await csvWriter.writeRecords([]);
    return 0;

    /* When the member model is added to the Prisma schema, uncomment and customize this:
    const members = await this.prisma.member.findMany();
    await csvWriter.writeRecords(members);
    return members.length;
    */
  }

  private async exportUsers(filePath: string): Promise<number> {
    // Get users from database, excluding sensitive fields like passwordHash
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'email', title: 'Email' },
        { id: 'firstName', title: 'First Name' },
        { id: 'lastName', title: 'Last Name' },
        { id: 'phoneNumber', title: 'Phone Number' },
        { id: 'isActive', title: 'Active' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'updatedAt', title: 'Updated At' },
      ],
    });

    await csvWriter.writeRecords(users);
    return users.length;
  }
}
