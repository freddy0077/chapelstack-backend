import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OnboardingService } from './onboarding.service';
import * as path from 'path';
import * as fs from 'fs';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { pipeline as streamPipeline } from 'stream';

// Type definition for file uploads
interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path: string;
  buffer?: Buffer;
  createReadStream?: () => fs.ReadStream;
}

const pipeline = promisify(streamPipeline);

@Injectable()
export class DataImportService {
  private readonly logger: Logger;
  private readonly uploadDir: string;
  private readonly prisma: PrismaService;
  private readonly onboardingService: OnboardingService;

  constructor(prisma: PrismaService, onboardingService: OnboardingService) {
    this.prisma = prisma;
    this.onboardingService = onboardingService;
    this.logger = new Logger(DataImportService.name);
    this.uploadDir = path.join(process.cwd(), 'uploads', 'imports');

    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async importMembers(
    file: UploadedFile,
    branchId: string,
  ): Promise<any> {
    const filePath = path.join(this.uploadDir, `${uuidv4()}.csv`);
    const readStream = file.createReadStream
      ? file.createReadStream()
      : fs.createReadStream(file.path || '');

    try {
      // Save the uploaded file
      await pipeline(readStream, fs.createWriteStream(filePath));

      // Process the CSV file
      const csvData = await this.parseCSV<Record<string, unknown>>(
        filePath,
        async (row) => row,
      );
      const validationResult = this.validateMemberRecords(csvData);

      // Process valid records
      let importedCount = 0;
      if (validationResult.validRecords.length > 0) {
        importedCount = await this.processMemberImport(
          validationResult.validRecords,
          branchId,
        );
      }

      // Update onboarding progress
      await this.onboardingService.updateImportStatus(
        branchId,
        'members',
        true,
      );

      // Clean up the temporary file
      void fs.promises.unlink(filePath).catch((err) => {
        if (err instanceof Error) {
          this.logger.error(`Error deleting temporary file: ${err.message}`);
        }
      });

      // Return the result
      return {
        success: true,
        totalRecords: csvData.length,
        importedRecords: importedCount,
        errors:
          validationResult.errors.length > 0
            ? validationResult.errors
            : undefined,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack =
        error instanceof Error ? error.stack : 'No stack trace';
      this.logger.error(`Error importing members: ${errorMessage}`, errorStack);

      return {
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        errors: [
          {
            row: 0,
            column: '',
            message: `Error processing file: ${errorMessage}`,
          },
        ],
      };
    }
  }

  async importFinancialData(
    branchId: string,
    file: UploadedFile,
    mapping: Record<string, string>,
    type: 'funds' | 'accounts' | 'contributions',
  ): Promise<any> {
    try {
      // Validate mapping based on type
      this.validateFinancialMapping(mapping, type);

      // Process the file
      const filePath = path.join(this.uploadDir, `${uuidv4()}.csv`);
      const readStream = file.createReadStream
        ? file.createReadStream()
        : fs.createReadStream(file.path || '');

      // Save the uploaded file
      await pipeline(readStream, fs.createWriteStream(filePath));

      // Process the CSV file
      const csvData = await this.parseCSV<Record<string, unknown>>(
        filePath,
        async (row) => row,
      );

      let result: any;

      // Process based on type
      switch (type) {
        case 'funds':
          result = await this.processFundsImport(branchId, csvData, mapping);
          break;
        case 'accounts':
          result = await this.processAccountsImport(branchId, csvData, mapping);
          break;
        case 'contributions':
          result = await this.processContributionsImport(
            branchId,
            csvData,
            mapping,
          );
          break;
        default:
          throw new Error(`Unsupported financial data type: ${type}`);
      }

      // Update onboarding progress
      await this.onboardingService.updateImportStatus(
        branchId,
        'finances',
        true,
      );

      // Generate report
      const reportContent = this.generateImportReport(result, type, branchId);
      const reportPath = path.join(
        this.uploadDir,
        `${type}_import_report_${uuidv4()}.txt`,
      );
      await fs.promises.writeFile(reportPath, reportContent);

      // Clean up the temporary file
      void fs.promises.unlink(filePath).catch((err) => {
        if (err instanceof Error) {
          this.logger.error(`Error deleting temporary file: ${err.message}`);
        }
      });

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack =
        error instanceof Error ? error.stack : 'No stack trace';
      this.logger.error(
        `Error importing ${type} data: ${errorMessage}`,
        errorStack,
      );

      return {
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        errors: [
          {
            row: 0,
            column: '',
            message: `Error processing file: ${errorMessage}`,
          },
        ],
      };
    }
  }

  private async parseCSV<T>(
    filePath: string,
    processRow: (row: Record<string, unknown>) => Promise<T>,
  ): Promise<T[]> {
    try {
      return await new Promise<T[]>((resolve, reject) => {
        const results: T[] = [];
        const errors: Error[] = [];

        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row: Record<string, unknown>) => {
            try {
              // Process row and add to results
              void processRow(row)
                .then((processedRow) => {
                  results.push(processedRow);
                })
                .catch((error) => {
                  if (error instanceof Error) {
                    errors.push(error);
                  } else {
                    errors.push(new Error(String(error)));
                  }
                });
            } catch (error) {
              if (error instanceof Error) {
                errors.push(error);
              } else {
                errors.push(new Error(String(error)));
              }
            }
          })
          .on('end', () => {
            if (errors.length > 0) {
              reject(new Error(`Errors processing CSV rows: ${errors.length}`));
            } else {
              resolve(results);
            }
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack =
        error instanceof Error ? error.stack : 'No stack trace';
      this.logger.error(`Error parsing CSV: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  private validateFinancialMapping(
    mapping: Record<string, string>,
    type: 'funds' | 'accounts' | 'contributions',
  ): void {
    // Implementation of financial mapping validation based on type
    switch (type) {
      case 'funds':
        if (!mapping.name) {
          throw new Error('Fund mapping must include a name field');
        }
        break;
      case 'accounts':
        if (!mapping.name || !mapping.type) {
          throw new Error('Account mapping must include name and type fields');
        }
        break;
      case 'contributions':
        if (!mapping.amount || !mapping.date || !mapping.fund) {
          throw new Error(
            'Contribution mapping must include amount, date, and fund fields',
          );
        }
        break;
      default:
        throw new Error(`Unknown financial data type: ${type}`);
    }
  }

  private validateMemberRecords(records: Record<string, unknown>[]): {
    validRecords: Record<string, unknown>[];
    errors: any[];
  } {
    const validRecords: Record<string, unknown>[] = [];
    const errors: any[] = [];

    // Filter records with missing required fields
    const validationErrors = records.filter((record) => {
      return !record.email || !record.phoneNumber;
    });

    validationErrors.forEach((record, index) => {
      errors.push({
        row: index + 1,
        column: 'email/phoneNumber',
        message: 'Either email or phone number is required',
      });
    });

    records.forEach((record, index) => {
      try {
        // Email validation if present
        const email = record.email as string | undefined;
        if (email && !this.isValidEmail(email)) {
          errors.push({
            row: index + 1,
            column: 'email',
            message: 'Invalid email format',
          });
          return;
        }

        validRecords.push(record);
      } catch (error) {
        errors.push({
          row: index + 1,
          column: 'unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    return { validRecords, errors };
  }

  private isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async processMemberImport(
    records: Record<string, unknown>[],
    branchId: string,
  ): Promise<number> {
    let importedCount = 0;

    for (const record of records) {
      try {
        // Extract and validate fields
        const firstName = record.firstName
          ? String(record.firstName).trim()
          : null;
        const lastName = record.lastName
          ? String(record.lastName).trim()
          : null;
        const email = record.email ? String(record.email).trim() : null;
        const phoneNumber = record.phoneNumber
          ? String(record.phoneNumber).trim()
          : null;
        const address = record.address ? String(record.address).trim() : null;

        // Parse date of birth if present
        let dateOfBirth: Date | null = null;
        if (record.dateOfBirth) {
          try {
            dateOfBirth = new Date(String(record.dateOfBirth));
            if (isNaN(dateOfBirth.getTime())) {
              dateOfBirth = null;
            }
          } catch {
            dateOfBirth = null;
          }
        }

        // Parse gender if present
        let gender: string | null = null;
        if (record.gender) {
          const genderString = String(record.gender).toUpperCase();
          if (['MALE', 'FEMALE', 'OTHER'].includes(genderString)) {
            gender = genderString;
          }
        }

        // Parse membership status if present
        let membershipStatus: string | null = null;
        if (record.membershipStatus) {
          const statusString = String(record.membershipStatus).toUpperCase();
          // Validate membership status
          if (['ACTIVE', 'INACTIVE', 'VISITOR'].includes(statusString)) {
            membershipStatus = statusString;
          }
        }

        // Create member in database
        await this.prisma.member.create({
          data: {
            firstName: firstName || '',
            lastName: lastName || '',
            email: email,
            phoneNumber: phoneNumber,
            address: address,
            dateOfBirth,
            gender: gender || '',
            membershipStatus: membershipStatus,
            branch: { connect: { id: branchId } },
          },
        });

        importedCount++;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errorStack =
          error instanceof Error ? error.stack : 'No stack trace';
        this.logger.error(
          `Error importing member: ${errorMessage}`,
          errorStack,
        );
        // Continue with next record
      }
    }

    return importedCount;
  }

  private async processFundsImport(
    branchId: string,
    records: Record<string, unknown>[],
    mapping: Record<string, string>,
  ): Promise<any> {
    // Placeholder implementation
    await Promise.resolve();
    return {
      success: true,
      totalRecords: records.length,
      importedRecords: 0,
      errors: [],
    };
  }

  private async processAccountsImport(
    branchId: string,
    records: Record<string, unknown>[],
    mapping: Record<string, string>,
  ): Promise<any> {
    // Placeholder implementation
    await Promise.resolve();
    return {
      success: true,
      totalRecords: records.length,
      importedRecords: 0,
      errors: [],
    };
  }

  private async processContributionsImport(
    branchId: string,
    records: Record<string, unknown>[],
    mapping: Record<string, string>,
  ): Promise<any> {
    // Placeholder implementation
    await Promise.resolve();
    return {
      success: true,
      totalRecords: records.length,
      importedRecords: 0,
      errors: [],
    };
  }

  private generateImportReport(
    result: any,
    type: string,
    branchId: string,
  ): string {
    const timestamp = new Date().toISOString();
    const report = [
      `Import Report - ${type.toUpperCase()}`,
      `Timestamp: ${timestamp}`,
      `Branch ID: ${branchId}`,
      `Total Records: ${result.totalRecords}`,
      `Imported Records: ${result.importedRecords}`,
      `Success: ${result.success ? 'Yes' : 'No'}`,
      '',
      'Messages:',
    ];

    if (result.errors && result.errors.length > 0) {
      report.push('Errors:');
      result.errors.forEach((error) => {
        report.push(
          `  Row ${error.row}, Column ${error.column}: ${error.message}`,
        );
      });
    } else {
      report.push('  No errors reported.');
    }

    return report.join('\n');
  }

  async generateMemberImportTemplate(): Promise<string> {
    const templatePath = path.join(
      this.uploadDir,
      'members_import_template.csv',
    );
    const headers = [
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'address',
      'dateOfBirth',
      'gender',
      'membershipStatus',
    ].join(',');

    await fs.promises.writeFile(templatePath, `${headers}\n`);
    return templatePath;
  }

  async generateFundsImportTemplate(): Promise<string> {
    const templatePath = path.join(this.uploadDir, 'funds_import_template.csv');
    const headers = ['Fund Name', 'Description'].join(',');

    await fs.promises.writeFile(templatePath, `${headers}\n`);
    return templatePath;
  }

  async generateAccountsImportTemplate(): Promise<string> {
    const templatePath = path.join(
      this.uploadDir,
      'accounts_import_template.csv',
    );
    const headers = ['Account Name', 'Account Type', 'Description'].join(',');

    await fs.promises.writeFile(templatePath, `${headers}\n`);
    return templatePath;
  }

  async generateContributionsImportTemplate(): Promise<string> {
    const templatePath = path.join(
      this.uploadDir,
      'contributions_import_template.csv',
    );
    const headers = [
      'Date',
      'Amount',
      'Fund',
      'Member Email',
      'Payment Method',
      'Notes',
    ].join(',');

    await fs.promises.writeFile(templatePath, `${headers}\n`);
    return templatePath;
  }
}
