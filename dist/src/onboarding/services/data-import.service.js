"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var DataImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataImportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const onboarding_service_1 = require("./onboarding.service");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const uuid_1 = require("uuid");
const util_1 = require("util");
const stream_1 = require("stream");
const pipeline = (0, util_1.promisify)(stream_1.pipeline);
let DataImportService = DataImportService_1 = class DataImportService {
    logger;
    uploadDir;
    prisma;
    onboardingService;
    constructor(prisma, onboardingService) {
        this.prisma = prisma;
        this.onboardingService = onboardingService;
        this.logger = new common_1.Logger(DataImportService_1.name);
        this.uploadDir = path.join(process.cwd(), 'uploads', 'imports');
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async importMembers(file, branchId) {
        const filePath = path.join(this.uploadDir, `${(0, uuid_1.v4)()}.csv`);
        const readStream = file.createReadStream
            ? file.createReadStream()
            : fs.createReadStream(file.path || '');
        try {
            await pipeline(readStream, fs.createWriteStream(filePath));
            const csvData = await this.parseCSV(filePath, async (row) => row);
            const validationResult = this.validateMemberRecords(csvData);
            let importedCount = 0;
            if (validationResult.validRecords.length > 0) {
                importedCount = await this.processMemberImport(validationResult.validRecords, branchId);
            }
            await this.onboardingService.updateImportStatus(branchId, 'members', true);
            void fs.promises.unlink(filePath).catch((err) => {
                if (err instanceof Error) {
                    this.logger.error(`Error deleting temporary file: ${err.message}`);
                }
            });
            return {
                success: true,
                totalRecords: csvData.length,
                importedRecords: importedCount,
                errors: validationResult.errors.length > 0
                    ? validationResult.errors
                    : undefined,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : 'No stack trace';
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
    async importFinancialData(branchId, file, mapping, type) {
        try {
            this.validateFinancialMapping(mapping, type);
            const filePath = path.join(this.uploadDir, `${(0, uuid_1.v4)()}.csv`);
            const readStream = file.createReadStream
                ? file.createReadStream()
                : fs.createReadStream(file.path || '');
            await pipeline(readStream, fs.createWriteStream(filePath));
            const csvData = await this.parseCSV(filePath, async (row) => row);
            let result;
            switch (type) {
                case 'funds':
                    result = await this.processFundsImport(branchId, csvData, mapping);
                    break;
                case 'accounts':
                    result = await this.processAccountsImport(branchId, csvData, mapping);
                    break;
                case 'contributions':
                    result = await this.processContributionsImport(branchId, csvData, mapping);
                    break;
                default:
                    throw new Error(`Unsupported financial data type: ${String(type)}`);
            }
            await this.onboardingService.updateImportStatus(branchId, 'finances', true);
            const reportContent = this.generateImportReport(result, type, branchId);
            const reportPath = path.join(this.uploadDir, `${type}_import_report_${(0, uuid_1.v4)()}.txt`);
            await fs.promises.writeFile(reportPath, reportContent);
            void fs.promises.unlink(filePath).catch((err) => {
                if (err instanceof Error) {
                    this.logger.error(`Error deleting temporary file: ${err.message}`);
                }
            });
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : 'No stack trace';
            this.logger.error(`Error importing ${type} data: ${errorMessage}`, errorStack);
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
    async parseCSV(filePath, processRow) {
        try {
            return await new Promise((resolve, reject) => {
                const results = [];
                const errors = [];
                fs.createReadStream(filePath)
                    .pipe((0, csv_parser_1.default)())
                    .on('data', (row) => {
                    try {
                        void processRow(row)
                            .then((processedRow) => {
                            results.push(processedRow);
                        })
                            .catch((error) => {
                            if (error instanceof Error) {
                                errors.push(error);
                            }
                            else {
                                errors.push(new Error(String(error)));
                            }
                        });
                    }
                    catch (error) {
                        if (error instanceof Error) {
                            errors.push(error);
                        }
                        else {
                            errors.push(new Error(String(error)));
                        }
                    }
                })
                    .on('end', () => {
                    if (errors.length > 0) {
                        reject(new Error(`Errors processing CSV rows: ${errors.length}`));
                    }
                    else {
                        resolve(results);
                    }
                })
                    .on('error', (error) => {
                    reject(error);
                });
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : 'No stack trace';
            this.logger.error(`Error parsing CSV: ${errorMessage}`, errorStack);
            throw error;
        }
    }
    validateFinancialMapping(mapping, type) {
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
                    throw new Error('Contribution mapping must include amount, date, and fund fields');
                }
                break;
            default:
                throw new Error(`Unknown financial data type: ${String(type)}`);
        }
    }
    validateMemberRecords(records) {
        const validRecords = [];
        const errors = [];
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
                const email = record.email;
                if (email && !this.isValidEmail(email)) {
                    errors.push({
                        row: index + 1,
                        column: 'email',
                        message: 'Invalid email format',
                    });
                    return;
                }
                validRecords.push(record);
            }
            catch (error) {
                errors.push({
                    row: index + 1,
                    column: 'unknown',
                    message: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        return { validRecords, errors };
    }
    isValidEmail(email) {
        if (!email)
            return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    async processMemberImport(records, branchId) {
        let importedCount = 0;
        for (const record of records) {
            try {
                const firstName = record.firstName != null ? String(record.firstName).trim() : null;
                const lastName = record.lastName != null ? String(record.lastName).trim() : null;
                const email = record.email != null ? String(record.email).trim() : null;
                const phoneNumber = record.phoneNumber != null ? String(record.phoneNumber).trim() : null;
                const address = record.address != null ? String(record.address).trim() : null;
                let dateOfBirth = null;
                if (record.dateOfBirth != null) {
                    try {
                        dateOfBirth = new Date(String(record.dateOfBirth));
                        if (isNaN(dateOfBirth.getTime())) {
                            dateOfBirth = null;
                        }
                    }
                    catch {
                        dateOfBirth = null;
                    }
                }
                let gender = null;
                if (record.gender != null) {
                    const genderString = String(record.gender).toUpperCase();
                    if (['MALE', 'FEMALE', 'OTHER'].includes(genderString)) {
                        gender = genderString;
                    }
                }
                let membershipStatus = null;
                if (record.membershipStatus != null) {
                    const statusString = String(record.membershipStatus).toUpperCase();
                    if (['ACTIVE', 'INACTIVE', 'VISITOR'].includes(statusString)) {
                        membershipStatus = statusString;
                    }
                }
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
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                const errorStack = error instanceof Error ? error.stack : 'No stack trace';
                this.logger.error(`Error importing member: ${errorMessage}`, errorStack);
            }
        }
        return importedCount;
    }
    async processFundsImport(branchId, records, _mapping) {
        await Promise.resolve();
        return {
            success: true,
            totalRecords: records.length,
            importedRecords: 0,
            errors: [],
        };
    }
    async processAccountsImport(branchId, records, _mapping) {
        await Promise.resolve();
        return {
            success: true,
            totalRecords: records.length,
            importedRecords: 0,
            errors: [],
        };
    }
    async processContributionsImport(branchId, records, _mapping) {
        await Promise.resolve();
        return {
            success: true,
            totalRecords: records.length,
            importedRecords: 0,
            errors: [],
        };
    }
    generateImportReport(result, type, branchId) {
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
                report.push(`  Row ${error.row}, Column ${error.column}: ${error.message}`);
            });
        }
        else {
            report.push('  No errors reported.');
        }
        return report.join('\n');
    }
    async generateMemberImportTemplate() {
        const templatePath = path.join(this.uploadDir, 'members_import_template.csv');
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
    async generateFundsImportTemplate() {
        const templatePath = path.join(this.uploadDir, 'funds_import_template.csv');
        const headers = ['Fund Name', 'Description'].join(',');
        await fs.promises.writeFile(templatePath, `${headers}\n`);
        return templatePath;
    }
    async generateAccountsImportTemplate() {
        const templatePath = path.join(this.uploadDir, 'accounts_import_template.csv');
        const headers = ['Account Name', 'Account Type', 'Description'].join(',');
        await fs.promises.writeFile(templatePath, `${headers}\n`);
        return templatePath;
    }
    async generateContributionsImportTemplate() {
        const templatePath = path.join(this.uploadDir, 'contributions_import_template.csv');
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
};
exports.DataImportService = DataImportService;
exports.DataImportService = DataImportService = DataImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, onboarding_service_1.OnboardingService])
], DataImportService);
//# sourceMappingURL=data-import.service.js.map