"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuditLogService = AuditLogService_1 = class AuditLogService {
    prisma;
    logger = new common_1.Logger(AuditLogService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(input) {
        try {
            const auditLog = await this.prisma.auditLog.create({
                data: {
                    action: input.action,
                    entityType: input.entityType,
                    entityId: input.entityId,
                    description: input.description,
                    metadata: input.metadata,
                    userId: input.userId,
                    branchId: input.branchId,
                    ipAddress: input.ipAddress,
                    userAgent: input.userAgent,
                },
            });
            return auditLog;
        }
        catch (error) {
            this.logger.error(`Error creating audit log: ${error.message}`, error.stack);
            return null;
        }
    }
    async findAll(skip = 0, take = 10, filters) {
        try {
            const where = {};
            if (filters?.action) {
                where.action = filters.action;
            }
            if (filters?.entityType) {
                where.entityType = filters.entityType;
            }
            if (filters?.entityId) {
                where.entityId = filters.entityId;
            }
            if (filters?.userId) {
                where.userId = filters.userId;
            }
            if (filters?.branchId) {
                where.branchId = filters.branchId;
            }
            if (filters?.startDate || filters?.endDate) {
                where.createdAt = {};
                if (filters?.startDate) {
                    where.createdAt.gte = filters.startDate;
                }
                if (filters?.endDate) {
                    where.createdAt.lte = filters.endDate;
                }
            }
            const auditLogs = await this.prisma.auditLog.findMany({
                skip,
                take,
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: true,
                    branch: true,
                },
            });
            return auditLogs;
        }
        catch (error) {
            this.logger.error(`Error finding audit logs: ${error.message}`, error.stack);
            throw error;
        }
    }
    async count(filters) {
        try {
            const where = {};
            if (filters?.action) {
                where.action = filters.action;
            }
            if (filters?.entityType) {
                where.entityType = filters.entityType;
            }
            if (filters?.entityId) {
                where.entityId = filters.entityId;
            }
            if (filters?.userId) {
                where.userId = filters.userId;
            }
            if (filters?.branchId) {
                where.branchId = filters.branchId;
            }
            if (filters?.startDate || filters?.endDate) {
                where.createdAt = {};
                if (filters?.startDate) {
                    where.createdAt.gte = filters.startDate;
                }
                if (filters?.endDate) {
                    where.createdAt.lte = filters.endDate;
                }
            }
            return await this.prisma.auditLog.count({ where });
        }
        catch (error) {
            this.logger.error(`Error counting audit logs: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = AuditLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map