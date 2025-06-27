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
exports.GuardiansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GuardiansService = class GuardiansService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createGuardianInput) {
        return this.prisma.guardian.create({
            data: {
                ...createGuardianInput,
            },
        });
    }
    async findAll(branchId) {
        const where = branchId ? { branchId } : {};
        return this.prisma.guardian.findMany({
            where,
            orderBy: { lastName: 'asc' },
        });
    }
    async findOne(id) {
        const guardian = await this.prisma.guardian.findUnique({
            where: { id },
            include: {
                childRelations: {
                    include: {
                        child: true,
                    },
                },
            },
        });
        if (!guardian) {
            throw new common_1.NotFoundException(`Guardian with ID ${id} not found`);
        }
        return guardian;
    }
    async update(id, updateGuardianInput) {
        await this.findOne(id);
        return this.prisma.guardian.update({
            where: { id },
            data: {
                ...updateGuardianInput,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.guardian.delete({
            where: { id },
        });
    }
    async findByChild(childId) {
        return this.prisma.guardian.findMany({
            where: {
                childRelations: {
                    some: {
                        childId,
                    },
                },
            },
            orderBy: [{ isPrimaryGuardian: 'desc' }, { lastName: 'asc' }],
        });
    }
    async findByMember(memberId) {
        return this.prisma.guardian.findMany({
            where: { memberId },
        });
    }
    async createChildGuardianRelation(input) {
        const existingRelation = await this.prisma.childGuardianRelation.findFirst({
            where: {
                childId: input.childId,
                guardianId: input.guardianId,
            },
        });
        if (existingRelation) {
            return this.prisma.childGuardianRelation.update({
                where: { id: existingRelation.id },
                data: { relationship: input.relationship },
            });
        }
        return this.prisma.childGuardianRelation.create({
            data: input,
        });
    }
    async removeChildGuardianRelation(childId, guardianId) {
        const relation = await this.prisma.childGuardianRelation.findFirst({
            where: {
                childId,
                guardianId,
            },
        });
        if (!relation) {
            throw new common_1.NotFoundException(`Relation between child ${childId} and guardian ${guardianId} not found`);
        }
        await this.prisma.childGuardianRelation.delete({
            where: { id: relation.id },
        });
        return true;
    }
};
exports.GuardiansService = GuardiansService;
exports.GuardiansService = GuardiansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GuardiansService);
//# sourceMappingURL=guardians.service.js.map