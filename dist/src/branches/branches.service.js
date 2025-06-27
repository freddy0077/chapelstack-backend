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
exports.BranchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function toGraphQLBranch(prismaBranch) {
    return {
        ...prismaBranch,
        address: prismaBranch.address,
        city: prismaBranch.city,
        state: prismaBranch.state,
        postalCode: prismaBranch.postalCode,
        country: prismaBranch.country,
        phoneNumber: prismaBranch.phoneNumber,
        email: prismaBranch.email,
        website: prismaBranch.website,
        establishedAt: prismaBranch.establishedAt,
        settings: null,
    };
}
let BranchesService = class BranchesService {
    prisma;
    async countAll() {
        return this.prisma.branch.count();
    }
    async countActive() {
        return this.prisma.branch.count({ where: { isActive: true } });
    }
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createBranchInput) {
        if (createBranchInput.email) {
            const existingBranchByEmail = await this.prisma.branch.findUnique({
                where: { email: createBranchInput.email },
            });
            if (existingBranchByEmail) {
                throw new common_1.ConflictException(`Branch with email ${createBranchInput.email} already exists.`);
            }
        }
        const newBranch = await this.prisma.branch.create({
            data: {
                name: createBranchInput.name,
                address: createBranchInput.address,
                city: createBranchInput.city,
                state: createBranchInput.state,
                postalCode: createBranchInput.postalCode,
                country: createBranchInput.country,
                phoneNumber: createBranchInput.phoneNumber,
                email: createBranchInput.email,
                website: createBranchInput.website,
                establishedAt: createBranchInput.establishedAt,
                isActive: createBranchInput.isActive,
                organisationId: createBranchInput.organisationId,
            },
        });
        return toGraphQLBranch(newBranch);
    }
    async findAll(paginationInput, filterInput) {
        const { skip = 0, take = 10 } = paginationInput;
        const where = {};
        if (filterInput) {
            if (filterInput.id) {
                where.id = filterInput.id;
            }
            if (filterInput.nameContains) {
                where.name = {
                    contains: filterInput.nameContains,
                    mode: 'insensitive',
                };
            }
            if (filterInput.cityContains) {
                where.city = {
                    contains: filterInput.cityContains,
                    mode: 'insensitive',
                };
            }
            if (filterInput.stateContains) {
                where.state = {
                    contains: filterInput.stateContains,
                    mode: 'insensitive',
                };
            }
            if (filterInput.countryContains) {
                where.country = {
                    contains: filterInput.countryContains,
                    mode: 'insensitive',
                };
            }
            if (filterInput.isActive !== undefined) {
                where.isActive = filterInput.isActive;
            }
            if (filterInput.emailContains) {
                where.email = {
                    contains: filterInput.emailContains,
                    mode: 'insensitive',
                };
            }
            if (filterInput.organisationId) {
                where.organisationId = filterInput.organisationId;
            }
        }
        const [prismaBranches, totalCount] = await this.prisma.$transaction([
            this.prisma.branch.findMany({
                skip,
                take,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.branch.count({ where }),
        ]);
        return {
            items: prismaBranches.map(toGraphQLBranch),
            totalCount,
            hasNextPage: skip + take < totalCount,
        };
    }
    async findOne(id) {
        const branch = await this.prisma.branch.findUnique({
            where: { id },
        });
        if (!branch) {
            throw new common_1.NotFoundException(`Branch with ID ${id} not found`);
        }
        return toGraphQLBranch(branch);
    }
    async update(id, updateBranchInput) {
        await this.findOne(id);
        if (updateBranchInput.email) {
            const existingBranchByEmail = await this.prisma.branch.findFirst({
                where: {
                    email: updateBranchInput.email,
                    id: { not: id },
                },
            });
            if (existingBranchByEmail) {
                throw new common_1.ConflictException(`Another branch with email ${updateBranchInput.email} already exists.`);
            }
        }
        const updatedBranch = await this.prisma.branch.update({
            where: { id },
            data: updateBranchInput,
        });
        return toGraphQLBranch(updatedBranch);
    }
    async remove(id) {
        const branch = await this.findOne(id);
        if (!branch.isActive) {
            return branch;
        }
        const removedBranch = await this.prisma.branch.update({
            where: { id },
            data: { isActive: false },
        });
        return toGraphQLBranch(removedBranch);
    }
    async findBranchSettings(branchId) {
        await this.findOne(branchId);
        return this.prisma.branchSetting.findMany({
            where: { branchId },
        });
    }
    async updateBranchSetting(branchId, { key, value }) {
        await this.findOne(branchId);
        return this.prisma.branchSetting.upsert({
            where: { branchId_key: { branchId, key } },
            update: { value },
            create: { branchId, key, value },
        });
    }
    async getSettingsByBranchId(branchId) {
        return await this.prisma.branchSetting.findMany({
            where: { branchId },
        });
    }
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BranchesService);
//# sourceMappingURL=branches.service.js.map