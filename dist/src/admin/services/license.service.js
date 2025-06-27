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
var LicenseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const license_entity_1 = require("../entities/license.entity");
const audit_log_service_1 = require("./audit-log.service");
const crypto = __importStar(require("crypto"));
let LicenseService = LicenseService_1 = class LicenseService {
    prisma;
    auditLogService;
    logger = new common_1.Logger(LicenseService_1.name);
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    mapToEntity(license) {
        return {
            id: license.id,
            key: license.key,
            type: license.type,
            status: license.status,
            startDate: license.startDate,
            expiryDate: license.expiryDate,
            features: license.features || {},
            organizationName: license.organizationName || undefined,
            contactEmail: license.contactEmail || undefined,
            contactPhone: license.contactPhone || undefined,
            maxUsers: license.maxUsers || undefined,
            maxBranches: license.maxBranches || undefined,
            notes: license.notes || undefined,
            createdAt: license.createdAt,
            updatedAt: license.updatedAt,
        };
    }
    async createLicense(input, userId, ipAddress, userAgent) {
        if (!this.isValidLicenseKey(input.key)) {
            throw new Error('Invalid license key format');
        }
        if (new Date(input.expiryDate) <= new Date(input.startDate)) {
            throw new Error('Expiry date must be after start date');
        }
        try {
            const license = await this.prisma.license.create({
                data: {
                    key: input.key,
                    type: input.type,
                    status: input.status,
                    startDate: new Date(input.startDate),
                    expiryDate: new Date(input.expiryDate),
                    organizationName: input.organizationName,
                    contactEmail: input.contactEmail,
                    contactPhone: input.contactPhone,
                    features: input.features || {},
                    maxUsers: input.maxUsers,
                    maxBranches: input.maxBranches,
                    notes: input.notes,
                },
            });
            await this.auditLogService.createAuditLog({
                action: 'LICENSE_CREATED',
                entityType: 'License',
                entityId: license.id,
                description: `Created ${input.type} license for ${input.organizationName || 'organization'}`,
                metadata: { licenseType: input.type, licenseStatus: input.status },
                userId,
                ipAddress,
                userAgent,
            });
            return this.mapToEntity(license);
        }
        catch (error) {
            this.logger.error(`Error creating license: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getLicense(id) {
        try {
            const license = await this.prisma.license.findUnique({
                where: { id },
            });
            if (!license) {
                throw new common_1.NotFoundException(`License with ID ${id} not found`);
            }
            return this.mapToEntity(license);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error fetching license: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getLicenseByKey(key) {
        try {
            const license = await this.prisma.license.findUnique({
                where: { key },
            });
            if (!license) {
                throw new common_1.NotFoundException(`License with key ${key} not found`);
            }
            return this.mapToEntity(license);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error fetching license by key: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getLicenses(filter) {
        try {
            const where = this.buildFilterWhereClause(filter);
            const licenses = await this.prisma.license.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return licenses.map((license) => this.mapToEntity(license));
        }
        catch (error) {
            this.logger.error(`Error fetching licenses: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateLicense(id, input, userId, ipAddress, userAgent) {
        try {
            const license = await this.prisma.license.findUnique({
                where: { id },
            });
            if (!license) {
                throw new common_1.NotFoundException(`License with ID ${id} not found`);
            }
            if (input.expiryDate && new Date(input.expiryDate) <= new Date()) {
                throw new Error('Expiry date must be in the future');
            }
            const updatedLicense = await this.prisma.license.update({
                where: { id },
                data: {
                    status: input.status,
                    expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
                    organizationName: input.organizationName,
                    contactEmail: input.contactEmail,
                    contactPhone: input.contactPhone,
                    features: input.features || {},
                    maxUsers: input.maxUsers,
                    maxBranches: input.maxBranches,
                    notes: input.notes,
                },
            });
            await this.auditLogService.createAuditLog({
                action: 'LICENSE_UPDATED',
                entityType: 'License',
                entityId: id,
                description: `Updated license for ${updatedLicense.organizationName || 'organization'}`,
                metadata: {
                    licenseType: updatedLicense.type,
                    licenseStatus: updatedLicense.status,
                    changes: this.getChanges(license, updatedLicense),
                },
                userId,
                ipAddress,
                userAgent,
            });
            return this.mapToEntity(updatedLicense);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error updating license: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteLicense(id, userId, ipAddress, userAgent) {
        try {
            const license = await this.prisma.license.findUnique({
                where: { id },
            });
            if (!license) {
                throw new common_1.NotFoundException(`License with ID ${id} not found`);
            }
            await this.prisma.license.delete({
                where: { id },
            });
            await this.auditLogService.createAuditLog({
                action: 'LICENSE_DELETED',
                entityType: 'License',
                entityId: id,
                description: `Deleted license for ${license.organizationName || 'organization'}`,
                metadata: {
                    licenseType: license.type,
                    licenseKey: license.key,
                },
                userId,
                ipAddress,
                userAgent,
            });
            return true;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error deleting license: ${error.message}`, error.stack);
            throw error;
        }
    }
    async validateCurrentLicense() {
        try {
            const license = await this.prisma.license.findFirst({
                where: {
                    status: license_entity_1.LicenseStatus.ACTIVE,
                    expiryDate: {
                        gte: new Date(),
                    },
                },
                orderBy: {
                    expiryDate: 'desc',
                },
            });
            if (!license) {
                return {
                    isValid: false,
                    details: {
                        reason: 'No active license found',
                        action: 'Please contact support to obtain a valid license',
                    },
                };
            }
            const expiryDate = new Date(license.expiryDate);
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            if (expiryDate <= thirtyDaysFromNow) {
                return {
                    isValid: true,
                    details: {
                        licenseId: license.id,
                        type: license.type,
                        expiryDate: license.expiryDate,
                        warning: 'License will expire soon',
                        daysRemaining: Math.ceil((expiryDate.getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24)),
                    },
                };
            }
            return {
                isValid: true,
                details: {
                    licenseId: license.id,
                    type: license.type,
                    expiryDate: license.expiryDate,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error validating license: ${error.message}`, error.stack);
            return {
                isValid: false,
                details: {
                    reason: 'Error validating license',
                    action: 'Please contact support',
                },
            };
        }
    }
    async generateLicenseKey() {
        try {
            const prefix = 'CHURCH';
            const randomBytes = crypto.randomBytes(16).toString('hex').toUpperCase();
            const segments = [];
            for (let i = 0; i < 16; i += 4) {
                segments.push(randomBytes.substring(i, i + 4));
            }
            return `${prefix}-${segments.join('-')}`;
        }
        catch (error) {
            this.logger.error(`Error generating license key: ${error.message}`, error.stack);
            throw error;
        }
    }
    isValidLicenseKey(key) {
        const keyPattern = /^CHURCH-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
        return keyPattern.test(key);
    }
    buildFilterWhereClause(filter) {
        if (!filter)
            return {};
        const where = {};
        if (filter.id) {
            where.id = filter.id;
        }
        if (filter.key) {
            where.key = filter.key;
        }
        if (filter.type) {
            where.type = filter.type;
        }
        if (filter.status) {
            where.status = filter.status;
        }
        if (filter.organizationName) {
            where.organizationName = {
                contains: filter.organizationName,
                mode: 'insensitive',
            };
        }
        return where;
    }
    getChanges(oldLicense, newLicense) {
        const changes = {};
        for (const key in newLicense) {
            if (JSON.stringify(oldLicense[key]) !== JSON.stringify(newLicense[key])) {
                changes[key] = {
                    old: oldLicense[key],
                    new: newLicense[key],
                };
            }
        }
        return changes;
    }
};
exports.LicenseService = LicenseService;
exports.LicenseService = LicenseService = LicenseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], LicenseService);
//# sourceMappingURL=license.service.js.map