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
exports.SacramentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function isPrismaSacramentalRecord(record) {
    return Boolean(record && typeof record === 'object' && 'id' in record);
}
let SacramentsService = class SacramentsService {
    prisma;
    async getSacramentStats(period, branchId) {
        const where = {};
        if (branchId)
            where.branchId = branchId;
        let dateFrom = undefined;
        let dateTo = undefined;
        const today = new Date();
        if (period === 'last12months') {
            dateTo = today;
            dateFrom = new Date(today);
            dateFrom.setFullYear(today.getFullYear() - 1);
        }
        if (dateFrom && dateTo) {
            where.dateOfSacrament = { gte: dateFrom, lte: dateTo };
        }
        const records = await this.prisma.sacramentalRecord.findMany({ where });
        const statsMap = {};
        for (const record of records) {
            statsMap[record.sacramentType] = statsMap[record.sacramentType] || { count: 0 };
            statsMap[record.sacramentType].count++;
        }
        const allTypes = ['BAPTISM', 'COMMUNION', 'CONFIRMATION', 'MARRIAGE'];
        const totalPrevYear = 1;
        const result = allTypes.map(type => {
            const count = statsMap[type]?.count || 0;
            return {
                sacramentType: type,
                count,
                trend: 'neutral',
                percentage: 0,
                period: period === 'last12months' ? 'Last 12 months' : '',
            };
        });
        return result;
    }
    async getUpcomingAnniversaries(limit, branchId) {
        const today = new Date();
        const where = {};
        if (branchId)
            where.branchId = branchId;
        const records = await this.prisma.sacramentalRecord.findMany({
            where,
            orderBy: { dateOfSacrament: 'asc' },
            include: { member: true },
        });
        const anniversaries = records
            .map(record => {
            const sacramentDate = new Date(record.dateOfSacrament);
            const thisYear = today.getFullYear();
            let nextAnniversary = new Date(sacramentDate);
            nextAnniversary.setFullYear(thisYear);
            if (nextAnniversary < today) {
                nextAnniversary.setFullYear(thisYear + 1);
            }
            const diffDays = Math.ceil((nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays > 60 || diffDays < 0)
                return undefined;
            const years = nextAnniversary.getFullYear() - sacramentDate.getFullYear();
            const anniversaryType = `${years}${years === 1 ? 'st' : years === 2 ? 'nd' : years === 3 ? 'rd' : 'th'} ${record.sacramentType.charAt(0) + record.sacramentType.slice(1).toLowerCase()}`;
            return {
                name: `${record.member.firstName}${record.member.middleName ? ' ' + record.member.middleName : ''}${record.member.lastName ? ' ' + record.member.lastName : ''}`.trim() || 'N/A',
                sacramentType: record.sacramentType,
                anniversaryType,
                date: nextAnniversary,
                isSpecial: years % 5 === 0,
                timeUntil: diffDays === 0 ? 'Today' : `In ${diffDays} days`,
            };
        })
            .filter((a) => !!a)
            .sort((a, b) => a.date.getTime() - b.date.getTime());
        return limit ? anniversaries.slice(0, limit) : anniversaries;
    }
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapPrismaRecordToEntity(record) {
        if (!isPrismaSacramentalRecord(record)) {
            throw new Error('Invalid sacramental record data');
        }
        return {
            id: record.id,
            memberId: record.memberId,
            sacramentType: record.sacramentType,
            dateOfSacrament: record.dateOfSacrament,
            locationOfSacrament: record.locationOfSacrament,
            officiantName: record.officiantName,
            officiantId: record.officiantId,
            godparent1Name: record.godparent1Name,
            godparent2Name: record.godparent2Name,
            sponsorName: record.sponsorName,
            witness1Name: record.witness1Name,
            witness2Name: record.witness2Name,
            certificateNumber: record.certificateNumber,
            certificateUrl: record.certificateUrl,
            notes: record.notes,
            branchId: record.branchId,
            organisationId: record.organisationId,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        };
    }
    async create(createSacramentalRecordInput) {
        const member = await this.prisma.member.findUnique({
            where: { id: createSacramentalRecordInput.memberId },
        });
        if (!member) {
            throw new common_1.NotFoundException(`Member with ID ${createSacramentalRecordInput.memberId} not found`);
        }
        const branch = await this.prisma.branch.findUnique({
            where: { id: createSacramentalRecordInput.branchId },
        });
        if (!branch) {
            throw new common_1.NotFoundException(`Branch with ID ${createSacramentalRecordInput.branchId} not found`);
        }
        const prismaResult = await this.prisma.sacramentalRecord.create({
            data: createSacramentalRecordInput,
        });
        const record = prismaResult;
        return this.mapPrismaRecordToEntity(record);
    }
    async findAll(filter) {
        const where = {};
        if (filter) {
            if (filter.sacramentType) {
                where.sacramentType = filter.sacramentType;
            }
            if (filter.branchId) {
                where.branchId = filter.branchId;
            }
            if (filter.organisationId) {
                where.organisationId = filter.organisationId;
            }
            if (filter.certificateNumber) {
                where.certificateNumber = {
                    contains: filter.certificateNumber,
                    mode: 'insensitive',
                };
            }
            if (filter.officiantName) {
                where.officiantName = {
                    contains: filter.officiantName,
                    mode: 'insensitive',
                };
            }
            if (filter.locationOfSacrament) {
                where.locationOfSacrament = {
                    contains: filter.locationOfSacrament,
                    mode: 'insensitive',
                };
            }
            if (filter.dateFrom || filter.dateTo) {
                where.dateOfSacrament = {};
                if (filter.dateFrom) {
                    where.dateOfSacrament.gte = filter.dateFrom;
                }
                if (filter.dateTo) {
                    where.dateOfSacrament.lte = filter.dateTo;
                }
            }
        }
        const prismaResults = await this.prisma.sacramentalRecord.findMany({
            where,
            orderBy: { dateOfSacrament: 'desc' },
        });
        const records = prismaResults;
        return records.map((record) => this.mapPrismaRecordToEntity(record));
    }
    async findOne(id) {
        const prismaResult = await this.prisma.sacramentalRecord.findUnique({
            where: { id },
        });
        const record = prismaResult;
        if (!record) {
            throw new common_1.NotFoundException(`Sacramental record with ID ${id} not found`);
        }
        return this.mapPrismaRecordToEntity(record);
    }
    async findByMember(memberId) {
        const member = await this.prisma.member.findUnique({
            where: { id: memberId },
        });
        if (!member) {
            throw new common_1.NotFoundException(`Member with ID ${memberId} not found`);
        }
        const prismaResults = await this.prisma.sacramentalRecord.findMany({
            where: { memberId },
            orderBy: { dateOfSacrament: 'desc' },
        });
        const records = prismaResults;
        return records.map((record) => this.mapPrismaRecordToEntity(record));
    }
    async update(id, updateSacramentalRecordInput) {
        await this.findOne(id);
        if (updateSacramentalRecordInput.memberId) {
            const member = await this.prisma.member.findUnique({
                where: { id: updateSacramentalRecordInput.memberId },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Member with ID ${updateSacramentalRecordInput.memberId} not found`);
            }
        }
        if (updateSacramentalRecordInput.branchId) {
            const branch = await this.prisma.branch.findUnique({
                where: { id: updateSacramentalRecordInput.branchId },
            });
            if (!branch) {
                throw new common_1.NotFoundException(`Branch with ID ${updateSacramentalRecordInput.branchId} not found`);
            }
        }
        const prismaResult = await this.prisma.sacramentalRecord.update({
            where: { id },
            data: updateSacramentalRecordInput,
        });
        const record = prismaResult;
        return this.mapPrismaRecordToEntity(record);
    }
    async remove(id) {
        const existingRecord = await this.findOne(id);
        if (!existingRecord) {
            throw new common_1.NotFoundException(`Sacramental record with ID ${id} not found`);
        }
        await this.prisma.sacramentalRecord.delete({
            where: { id },
        });
        return true;
    }
    async uploadCertificate(recordId, certificateUrl) {
        const existingRecord = await this.findOne(recordId);
        if (!existingRecord) {
            throw new common_1.NotFoundException(`Sacramental record with ID ${recordId} not found`);
        }
        const updatedRecord = await this.prisma.sacramentalRecord.update({
            where: { id: recordId },
            data: { certificateUrl },
        });
        const result = updatedRecord;
        return this.mapPrismaRecordToEntity(result);
    }
    async updateCertificateUrl(id, certificateUrl) {
        await this.findOne(id);
        const prismaResult = await this.prisma.sacramentalRecord.update({
            where: { id },
            data: { certificateUrl },
        });
        const record = prismaResult;
        return this.mapPrismaRecordToEntity(record);
    }
};
exports.SacramentsService = SacramentsService;
exports.SacramentsService = SacramentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SacramentsService);
//# sourceMappingURL=sacraments.service.js.map