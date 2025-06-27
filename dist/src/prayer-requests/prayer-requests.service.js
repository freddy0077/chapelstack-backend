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
exports.PrayerRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PrayerRequestsService = class PrayerRequestsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.prayerRequest.create({
            data,
            include: {
                member: true,
            },
        });
    }
    async findAll({ branchId, status, organisationId }) {
        const where = { status };
        if (branchId) {
            where.branchId = branchId;
        }
        else if (organisationId) {
            where.organisationId = organisationId;
        }
        return this.prisma.prayerRequest.findMany({
            where,
            include: {
                member: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const req = await this.prisma.prayerRequest.findUnique({
            where: { id },
            include: { member: true },
        });
        if (!req)
            throw new common_1.NotFoundException('Prayer request not found');
        return req;
    }
    async update(id, data) {
        return this.prisma.prayerRequest.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.prayerRequest.delete({ where: { id } });
    }
};
exports.PrayerRequestsService = PrayerRequestsService;
exports.PrayerRequestsService = PrayerRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrayerRequestsService);
//# sourceMappingURL=prayer-requests.service.js.map