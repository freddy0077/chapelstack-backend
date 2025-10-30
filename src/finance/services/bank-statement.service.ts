import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadBankStatementInput } from '../dto/upload-bank-statement.input';
import { BankStatementEntity } from '../entities/bank-statement.entity';

@Injectable()
export class BankStatementService {
  constructor(private prisma: PrismaService) {}

  // Allowed file types
  private readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
  ];

  // Max file size: 10MB
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  /**
   * Validate uploaded file
   */
  validateFile(file: any): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: PDF, CSV, Excel, JPEG, PNG`,
      );
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }
  }

  /**
   * Upload bank statement
   * Note: This is a placeholder. In production, integrate with cloud storage (S3, Azure, GCS)
   */
  async uploadStatement(
    input: UploadBankStatementInput & { fileUrl?: string },
    file: any,
    uploadedBy: string,
  ): Promise<BankStatementEntity> {
    // Validate file
    this.validateFile(file);

    // Verify bank account exists
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id: input.bankAccountId },
    });

    if (!bankAccount) {
      throw new NotFoundException(
        `Bank account with ID ${input.bankAccountId} not found`,
      );
    }

    // Use provided fileUrl or generate placeholder
    const fileUrl = input.fileUrl || `/uploads/bank-statements/${Date.now()}-${file.originalname}`;

    // Create bank statement record
    const statement = await this.prisma.bankStatement.create({
      data: {
        bankAccountId: input.bankAccountId,
        fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        statementDate: input.statementDate,
        statementPeriod: input.statementPeriod,
        uploadedBy,
        organisationId: input.organisationId,
        branchId: input.branchId,
      },
    });

    return this.mapToEntity(statement);
  }

  /**
   * Get all statements for a bank account
   */
  async findByBankAccount(bankAccountId: string): Promise<BankStatementEntity[]> {
    const statements = await this.prisma.bankStatement.findMany({
      where: { bankAccountId },
      orderBy: { statementDate: 'desc' },
    });

    return statements.map((s) => this.mapToEntity(s));
  }

  /**
   * Get statement by ID
   */
  async findOne(id: string): Promise<BankStatementEntity> {
    const statement = await this.prisma.bankStatement.findUnique({
      where: { id },
    });

    if (!statement) {
      throw new NotFoundException(`Bank statement with ID ${id} not found`);
    }

    return this.mapToEntity(statement);
  }

  /**
   * Delete bank statement
   */
  async delete(id: string): Promise<boolean> {
    const statement = await this.prisma.bankStatement.findUnique({
      where: { id },
    });

    if (!statement) {
      throw new NotFoundException(`Bank statement with ID ${id} not found`);
    }

    // TODO: Delete file from cloud storage

    await this.prisma.bankStatement.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Map Prisma model to GraphQL entity
   */
  private mapToEntity(statement: any): BankStatementEntity {
    return {
      id: statement.id,
      bankAccountId: statement.bankAccountId,
      fileUrl: statement.fileUrl,
      fileName: statement.fileName,
      fileSize: statement.fileSize,
      fileType: statement.fileType,
      statementDate: statement.statementDate,
      statementPeriod: statement.statementPeriod,
      uploadedBy: statement.uploadedBy,
      uploadedAt: statement.uploadedAt,
      organisationId: statement.organisationId,
      branchId: statement.branchId,
      createdAt: statement.createdAt,
      updatedAt: statement.updatedAt,
    };
  }
}
