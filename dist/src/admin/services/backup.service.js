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
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const backup_entity_1 = require("../entities/backup.entity");
const audit_log_service_1 = require("./audit-log.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
let BackupService = BackupService_1 = class BackupService {
    prisma;
    auditLogService;
    logger = new common_1.Logger(BackupService_1.name);
    backupsDir = path.join(process.cwd(), 'backups');
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.ensureDirectoryExists(this.backupsDir);
    }
    mapToEntity(backup) {
        return {
            ...backup,
            type: backup.type,
            status: backup.status,
            metadata: backup.metadata || undefined,
            filePath: backup.filePath || undefined,
            fileSize: backup.fileSize || undefined,
            duration: backup.duration || undefined,
            errorDetails: backup.errorDetails || undefined,
            userId: backup?.userId || undefined,
            user: backup.user || undefined,
        };
    }
    ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    async createBackup(input, ipAddress, userAgent) {
        const backup = await this.prisma.backup.create({
            data: {
                type: input.type,
                status: backup_entity_1.BackupStatus.PENDING,
                description: input.description,
                metadata: input.metadata || {},
                userId: input?.userId || undefined,
            },
        });
        await this.auditLogService.createAuditLog({
            action: 'BACKUP_CREATED',
            entityType: 'Backup',
            entityId: backup.id,
            description: `Created ${input.type.toLowerCase()} backup`,
            metadata: { backupType: input.type },
            userId: input?.userId || undefined,
            ipAddress,
            userAgent,
        });
        this.processBackup(backup.id).catch((error) => {
            this.logger.error(`Error processing backup ${backup.id}: ${error.message}`, error.stack);
        });
        return this.mapToEntity(backup);
    }
    async getBackup(id) {
        const backup = await this.prisma.backup.findUnique({
            where: { id },
            include: {
                user: true,
            },
        });
        if (!backup) {
            throw new common_1.NotFoundException(`Backup with ID ${id} not found`);
        }
        return this.mapToEntity(backup);
    }
    async getBackups(filter) {
        const where = {};
        if (filter) {
            if (filter.type) {
                where.type = filter.type;
            }
            if (filter.status) {
                where.status = filter.status;
            }
            if (filter.userId) {
                where.userId = filter.userId;
            }
            if (filter.createdAfter || filter.createdBefore) {
                where.createdAt = {};
                if (filter.createdAfter) {
                    where.createdAt.gte = new Date(filter.createdAfter);
                }
                if (filter.createdBefore) {
                    where.createdAt.lte = new Date(filter.createdBefore);
                }
            }
        }
        const backups = await this.prisma.backup.findMany({
            where,
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return backups.map((backup) => this.mapToEntity(backup));
    }
    async restoreBackup(input, ipAddress, userAgent) {
        const sourceBackup = await this.prisma.backup.findUnique({
            where: { id: input.backupId },
        });
        if (!sourceBackup) {
            throw new common_1.NotFoundException(`Source backup with ID ${input.backupId} not found`);
        }
        if (sourceBackup.status !== backup_entity_1.BackupStatus.COMPLETED) {
            throw new Error(`Source backup is not in COMPLETED status`);
        }
        if (!sourceBackup.filePath) {
            throw new Error(`Source backup has no file path`);
        }
        const restore = await this.prisma.backup.create({
            data: {
                type: backup_entity_1.BackupType.MANUAL,
                status: backup_entity_1.BackupStatus.PENDING,
                description: input.description,
                metadata: {
                    sourceBackupId: input.backupId,
                    sourceBackupPath: sourceBackup.filePath,
                },
                userId: input?.userId || undefined,
            },
        });
        await this.auditLogService.createAuditLog({
            action: 'BACKUP_RESTORE_INITIATED',
            entityType: 'Backup',
            entityId: restore.id,
            description: `Initiated restore from backup ${input.backupId}`,
            metadata: { sourceBackupId: input.backupId },
            userId: input?.userId || undefined,
            ipAddress,
            userAgent,
        });
        this.processRestore(restore.id).catch((error) => {
            this.logger.error(`Error processing restore ${restore.id}: ${error.message}`, error.stack);
        });
        return this.mapToEntity(restore);
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
        if (filter.status) {
            where.status = filter.status;
        }
        if (filter.userId) {
            where.userId = filter.userId;
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
    async processBackup(backupId) {
        const startTime = Date.now();
        try {
            await this.prisma.backup.update({
                where: { id: backupId },
                data: { status: backup_entity_1.BackupStatus.IN_PROGRESS },
            });
            const backup = await this.prisma.backup.findUnique({
                where: { id: backupId },
            });
            if (!backup) {
                throw new Error('Invalid backup operation');
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `backup_${backup.type.toLowerCase()}_${timestamp}.sql`;
            const filePath = path.join(this.backupsDir, fileName);
            const dbName = process.env.DATABASE_NAME || 'church_system';
            const dbUser = process.env.DATABASE_USER || 'frederickankamah';
            const dbHost = process.env.DATABASE_HOST || 'localhost';
            const dbPort = process.env.DATABASE_PORT || '5432';
            const pgDumpCommand = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -F c -b -v -f "${filePath}" ${dbName}`;
            const { stdout, stderr } = await execPromise(pgDumpCommand);
            if (stderr && !stderr.includes('pg_dump: dumping contents of table')) {
                this.logger.warn(`pg_dump stderr: ${stderr}`);
            }
            const stats = fs.statSync(filePath);
            const fileSize = stats.size;
            const duration = Date.now() - startTime;
            await this.prisma.backup.update({
                where: { id: backupId },
                data: {
                    status: backup_entity_1.BackupStatus.COMPLETED,
                    filePath,
                    fileSize,
                    duration,
                    completedAt: new Date(),
                },
            });
            this.logger.log(`Backup ${backupId} completed successfully`);
        }
        catch (error) {
            await this.prisma.backup.update({
                where: { id: backupId },
                data: {
                    status: backup_entity_1.BackupStatus.FAILED,
                    errorDetails: { message: error.message, stack: error.stack },
                    duration: Date.now() - startTime,
                    completedAt: new Date(),
                },
            });
            this.logger.error(`Backup ${backupId} failed: ${error.message}`, error.stack);
        }
    }
    async processRestore(restoreId) {
        const startTime = Date.now();
        try {
            await this.prisma.backup.update({
                where: { id: restoreId },
                data: { status: backup_entity_1.BackupStatus.IN_PROGRESS },
            });
            const restoreOperation = await this.prisma.backup.findUnique({
                where: { id: restoreId },
            });
            if (!restoreOperation ||
                !restoreOperation.metadata ||
                typeof restoreOperation.metadata !== 'object') {
                throw new Error('Invalid restore operation or missing metadata');
            }
            const metadata = restoreOperation.metadata;
            if (!metadata.sourceBackupPath ||
                typeof metadata.sourceBackupPath !== 'string') {
                throw new Error('Missing or invalid source backup path in metadata');
            }
            const sourceBackupPath = metadata.sourceBackupPath;
            const dbName = process.env.DATABASE_NAME || 'church_system';
            const dbUser = process.env.DATABASE_USER || 'frederickankamah';
            const dbHost = process.env.DATABASE_HOST || 'localhost';
            const dbPort = process.env.DATABASE_PORT || '5432';
            const pgRestoreCommand = `pg_restore -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "${sourceBackupPath}"`;
            const { stdout, stderr } = await execPromise(pgRestoreCommand);
            if (stderr && !stderr.includes('pg_restore: processing data for table')) {
                this.logger.warn(`pg_restore stderr: ${stderr}`);
            }
            const duration = Date.now() - startTime;
            await this.prisma.backup.update({
                where: { id: restoreId },
                data: {
                    status: backup_entity_1.BackupStatus.COMPLETED,
                    duration,
                    completedAt: new Date(),
                },
            });
            this.logger.log(`Restore ${restoreId} completed successfully`);
        }
        catch (error) {
            await this.prisma.backup.update({
                where: { id: restoreId },
                data: {
                    status: backup_entity_1.BackupStatus.FAILED,
                    errorDetails: { message: error.message, stack: error.stack },
                    duration: Date.now() - startTime,
                    completedAt: new Date(),
                },
            });
            this.logger.error(`Restore ${restoreId} failed: ${error.message}`, error.stack);
        }
    }
};
exports.BackupService = BackupService;
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], BackupService);
//# sourceMappingURL=backup.service.js.map