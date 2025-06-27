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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuditLogService = class AuditLogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAuditLogInput) {
        const auditLog = await this.prisma.auditLog.create({
            data: createAuditLogInput,
            include: {
                user: true,
                branch: true,
            },
        });
        return this.mapToEntity(auditLog);
    }
    async findAll(paginationInput, filterInput) {
        const { skip = 0, take = 10 } = paginationInput;
        const where = {};
        if (filterInput) {
            if (filterInput.action) {
                where.action = filterInput.action;
            }
            if (filterInput.entityType) {
                where.entityType = filterInput.entityType;
            }
            if (filterInput.entityId) {
                where.entityId = filterInput.entityId;
            }
            if (filterInput.descriptionContains) {
                where.description = {
                    contains: filterInput.descriptionContains,
                    mode: 'insensitive',
                };
            }
            if (filterInput.userId) {
                where.userId = filterInput.userId;
            }
            if (filterInput.branchId) {
                where.branchId = filterInput.branchId;
            }
            if (filterInput.createdAfter || filterInput.createdBefore) {
                where.createdAt = {};
                if (filterInput.createdAfter) {
                    where.createdAt.gte = new Date(filterInput.createdAfter);
                }
                if (filterInput.createdBefore) {
                    where.createdAt.lte = new Date(filterInput.createdBefore);
                }
            }
        }
        const [auditLogs, totalCount] = await this.prisma.$transaction([
            this.prisma.auditLog.findMany({
                skip,
                take,
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: true,
                    branch: true,
                },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return {
            items: auditLogs.map(this.mapToEntity),
            totalCount,
            hasNextPage: skip + take < totalCount,
        };
    }
    async findOne(id) {
        const auditLog = await this.prisma.auditLog.findUnique({
            where: { id },
            include: {
                user: true,
                branch: true,
            },
        });
        if (!auditLog) {
            throw new Error(`Audit log with ID ${id} not found`);
        }
        return this.mapToEntity(auditLog);
    }
    async createAuditLog(createAuditLogInput) {
        return this.create(createAuditLogInput);
    }
    mapToEntity(auditLog) {
        return {
            ...auditLog,
            metadata: auditLog.metadata || undefined,
            ipAddress: auditLog.ipAddress || undefined,
            userAgent: auditLog.userAgent || undefined,
            userId: auditLog.userId || undefined,
            user: auditLog.user || undefined,
            branchId: auditLog.branchId || undefined,
            branch: auditLog.branch || undefined,
            entityId: auditLog.entityId || undefined,
        };
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map