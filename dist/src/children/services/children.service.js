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
exports.ChildrenService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ChildrenService = class ChildrenService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createChildInput) {
        return this.prisma.child.create({
            data: {
                ...createChildInput,
            },
        });
    }
    async findAll(filter) {
        const where = {};
        if (filter) {
            if (filter.firstName) {
                where.firstName = { contains: filter.firstName, mode: 'insensitive' };
            }
            if (filter.lastName) {
                where.lastName = { contains: filter.lastName, mode: 'insensitive' };
            }
            if (filter.gender) {
                where.gender = filter.gender;
            }
            if (filter.branchId) {
                where.branchId = filter.branchId;
            }
            if (filter.dateOfBirthFrom || filter.dateOfBirthTo) {
                where.dateOfBirth = {};
                if (filter.dateOfBirthFrom) {
                    where.dateOfBirth.gte = filter.dateOfBirthFrom;
                }
                if (filter.dateOfBirthTo) {
                    where.dateOfBirth.lte = filter.dateOfBirthTo;
                }
            }
        }
        return this.prisma.child.findMany({
            where,
            orderBy: { lastName: 'asc' },
        });
    }
    async findOne(id) {
        const child = await this.prisma.child.findUnique({
            where: { id },
            include: {
                guardianRelations: {
                    include: {
                        guardian: true,
                    },
                },
            },
        });
        if (!child) {
            throw new common_1.NotFoundException(`Child with ID ${id} not found`);
        }
        return child;
    }
    async update(id, updateChildInput) {
        await this.findOne(id);
        return this.prisma.child.update({
            where: { id },
            data: {
                ...updateChildInput,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.child.delete({
            where: { id },
        });
    }
    async findByGuardian(guardianId) {
        return this.prisma.child.findMany({
            where: {
                guardianRelations: {
                    some: {
                        guardianId,
                    },
                },
            },
            orderBy: { lastName: 'asc' },
        });
    }
    async getRecentCheckIns(childId, limit = 5) {
        return this.prisma.checkInRecord.findMany({
            where: { childId },
            orderBy: { checkedInAt: 'desc' },
            take: limit,
            include: {
                event: true,
                checkedInBy: true,
                checkedOutBy: true,
            },
        });
    }
};
exports.ChildrenService = ChildrenService;
exports.ChildrenService = ChildrenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChildrenService);
//# sourceMappingURL=children.service.js.map