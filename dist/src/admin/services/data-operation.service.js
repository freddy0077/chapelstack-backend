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
var DataOperationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataOperationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const data_operation_entity_1 = require("../entities/data-operation.entity");
const audit_log_service_1 = require("./audit-log.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const csv_writer_1 = require("csv-writer");
let DataOperationService = DataOperationService_1 = class DataOperationService {
    prisma;
    auditLogService;
    logger = new common_1.Logger(DataOperationService_1.name);
    uploadsDir = path.join(process.cwd(), 'uploads');
    exportsDir = path.join(process.cwd(), 'exports');
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ensureDirectoryExists(this.uploadsDir);
        this.ensureDirectoryExists(this.exportsDir);
    }
    ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    mapToEntity(dataOperation) {
        return {
            ...dataOperation,
            type: dataOperation.type,
            status: dataOperation.status,
            metadata: dataOperation.metadata || undefined,
            filePath: dataOperation.filePath || undefined,
            fileSize: dataOperation.fileSize || undefined,
            duration: dataOperation.duration || undefined,
            errorDetails: dataOperation.errorDetails || undefined,
            userId: dataOperation.userId || undefined,
            user: dataOperation.user || undefined,
        };
    }
    async createDataImport(input, ipAddress, userAgent) {
        const dataOperation = await this.prisma.dataOperation.create({
            data: {
                type: data_operation_entity_1.DataOperationType.IMPORT,
                status: data_operation_entity_1.DataOperationStatus.PENDING,
                entityType: input.entityType,
                description: input.description,
                metadata: input.metadata || {},
                filePath: input.filePath,
                userId: input.userId,
            },
        });
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
        this.processImport(dataOperation.id).catch((error) => {
            this.logger.error(`Error processing import ${dataOperation.id}: ${error.message}`, error.stack);
        });
        return this.mapToEntity(dataOperation);
    }
    async createDataExport(input, ipAddress, userAgent) {
        const dataOperation = await this.prisma.dataOperation.create({
            data: {
                type: data_operation_entity_1.DataOperationType.EXPORT,
                status: data_operation_entity_1.DataOperationStatus.PENDING,
                entityType: input.entityType,
                description: input.description,
                metadata: input.metadata || {},
                userId: input.userId,
            },
        });
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
        this.processExport(dataOperation.id).catch((error) => {
            this.logger.error(`Error processing export ${dataOperation.id}: ${error.message}`, error.stack);
        });
        return this.mapToEntity(dataOperation);
    }
    async getDataOperation(id) {
        const dataOperation = await this.prisma.dataOperation.findUnique({
            where: { id },
            include: {
                user: true,
            },
        });
        if (!dataOperation) {
            throw new common_1.NotFoundException(`Data operation with ID ${id} not found`);
        }
        return this.mapToEntity(dataOperation);
    }
    async getDataOperations(filter) {
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
    async cancelDataOperation(id, userId, ipAddress, userAgent) {
        const dataOperation = await this.prisma.dataOperation.findUnique({
            where: { id },
        });
        if (!dataOperation) {
            throw new common_1.NotFoundException(`Data operation with ID ${id} not found`);
        }
        if (dataOperation.status === data_operation_entity_1.DataOperationStatus.COMPLETED ||
            dataOperation.status === data_operation_entity_1.DataOperationStatus.FAILED) {
            throw new Error(`Cannot cancel operation in ${dataOperation.status} status`);
        }
        const updatedOperation = await this.prisma.dataOperation.update({
            where: { id },
            data: {
                status: data_operation_entity_1.DataOperationStatus.CANCELLED,
            },
        });
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
    buildFilterWhereClause(filter) {
        if (!filter)
            return {};
        const where = {};
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
    async processImport(operationId) {
        try {
            const operation = await this.prisma.dataOperation.findUnique({
                where: { id: operationId },
            });
            if (!operation) {
                throw new common_1.NotFoundException(`Data operation with ID ${operationId} not found`);
            }
            if (operation.status !== data_operation_entity_1.DataOperationStatus.PENDING) {
                this.logger.warn(`Skipping import for operation ${operationId} with status ${operation.status}`);
                return;
            }
            await this.prisma.dataOperation.update({
                where: { id: operationId },
                data: {
                    status: data_operation_entity_1.DataOperationStatus.IN_PROGRESS,
                },
            });
            const filePath = operation.filePath;
            if (!filePath || !fs.existsSync(filePath)) {
                throw new Error(`Import file not found: ${filePath}`);
            }
            const startTime = Date.now();
            let results;
            switch (operation.entityType.toLowerCase()) {
                case 'member':
                case 'members':
                    results = await this.processCsvImport(filePath, this.importMember.bind(this));
                    break;
                case 'user':
                case 'users':
                    results = await this.processCsvImport(filePath, this.importUser.bind(this));
                    break;
                default:
                    throw new Error(`Unsupported entity type: ${operation.entityType}`);
            }
            const duration = Date.now() - startTime;
            await this.prisma.dataOperation.update({
                where: { id: operationId },
                data: {
                    status: data_operation_entity_1.DataOperationStatus.COMPLETED,
                    completedAt: new Date(),
                    recordCount: results.successCount + results.errorCount,
                    errorCount: results.errorCount,
                    metadata: results.errorCount > 0
                        ? { errors: results.errors }
                        : undefined,
                },
            });
            this.logger.log(`Import completed for operation ${operationId}: ${results.successCount} succeeded, ${results.errorCount} failed`);
        }
        catch (error) {
            this.logger.error(`Error processing import ${operationId}: ${error.message}`, error.stack);
            await this.prisma.dataOperation.update({
                where: { id: operationId },
                data: {
                    status: data_operation_entity_1.DataOperationStatus.FAILED,
                    completedAt: new Date(),
                    metadata: {
                        errorDetails: {
                            message: error.message,
                            stack: error.stack,
                        },
                    },
                },
            });
        }
    }
    async processExport(operationId) {
        try {
            const operation = await this.prisma.dataOperation.findUnique({
                where: { id: operationId },
            });
            if (!operation) {
                throw new common_1.NotFoundException(`Data operation with ID ${operationId} not found`);
            }
            if (operation.status !== data_operation_entity_1.DataOperationStatus.PENDING) {
                this.logger.warn(`Skipping export for operation ${operationId} with status ${operation.status}`);
                return;
            }
            await this.prisma.dataOperation.update({
                where: { id: operationId },
                data: {
                    status: data_operation_entity_1.DataOperationStatus.IN_PROGRESS,
                },
            });
            const entityType = operation.entityType.toLowerCase();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `${entityType}-export-${timestamp}.csv`;
            const filePath = path.join(this.exportsDir, fileName);
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
                default:
                    throw new Error(`Unsupported entity type: ${entityType}`);
            }
            const stats = fs.statSync(filePath);
            const fileSize = stats.size;
            const duration = Date.now() - startTime;
            await this.prisma.dataOperation.update({
                where: { id: operationId },
                data: {
                    status: data_operation_entity_1.DataOperationStatus.COMPLETED,
                    filePath,
                    fileSize,
                    completedAt: new Date(),
                    recordCount: recordCount,
                },
            });
            this.logger.log(`Export completed for operation ${operationId}: ${recordCount} records exported`);
        }
        catch (error) {
            this.logger.error(`Error processing export ${operationId}: ${error.message}`, error.stack);
            await this.prisma.dataOperation.update({
                where: { id: operationId },
                data: {
                    status: data_operation_entity_1.DataOperationStatus.FAILED,
                    completedAt: new Date(),
                    metadata: {
                        errorDetails: {
                            message: error.message,
                            stack: error.stack,
                        },
                    },
                },
            });
        }
    }
    async processCsvImport(filePath, processRowFn) {
        return new Promise((resolve, reject) => {
            const results = {
                successCount: 0,
                errorCount: 0,
                errors: [],
            };
            const rows = [];
            fs.createReadStream(filePath)
                .pipe((0, csv_parser_1.default)())
                .on('data', (row) => {
                rows.push(row);
            })
                .on('end', async () => {
                for (const row of rows) {
                    try {
                        await processRowFn(row);
                        results.successCount++;
                    }
                    catch (error) {
                        results.errorCount++;
                        results.errors.push({
                            row,
                            message: error.message,
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
    async importMember(row) {
        this.logger.warn('Member import not implemented - prisma.member model not available');
    }
    async importUser(row) {
        const tempPasswordHash = 'TEMPORARY_HASH_PLACEHOLDER';
        await this.prisma.user.create({
            data: {
                email: row.email,
                firstName: row.firstName,
                lastName: row.lastName,
                phoneNumber: row.phoneNumber,
                passwordHash: tempPasswordHash,
            },
        });
    }
    async exportMembers(filePath) {
        this.logger.warn('Member export not implemented - prisma.member model not available');
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: filePath,
            header: [
                { id: 'id', title: 'ID' },
                { id: 'firstName', title: 'First Name' },
                { id: 'lastName', title: 'Last Name' },
                { id: 'email', title: 'Email' },
                { id: 'phoneNumber', title: 'Phone Number' },
            ],
        });
        await csvWriter.writeRecords([]);
        return 0;
    }
    async exportUsers(filePath) {
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
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
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
};
exports.DataOperationService = DataOperationService;
exports.DataOperationService = DataOperationService = DataOperationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], DataOperationService);
//# sourceMappingURL=data-operation.service.js.map