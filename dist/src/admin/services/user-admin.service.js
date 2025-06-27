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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UserAdminService = class UserAdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSuperAdminRoleId() {
        let role = await this.prisma.role.findFirst({
            where: { name: 'SUPER_ADMIN' },
        });
        if (!role) {
            role = await this.prisma.role.create({
                data: {
                    name: 'SUPER_ADMIN',
                    description: 'Full system access',
                },
            });
        }
        return role.id;
    }
    async getBranchAdminRoleId() {
        let role = await this.prisma.role.findFirst({
            where: { name: 'BRANCH_ADMIN' },
        });
        if (!role) {
            role = await this.prisma.role.create({
                data: {
                    name: 'BRANCH_ADMIN',
                    description: 'Branch administrator with full branch permissions',
                },
            });
        }
        return role.id;
    }
    async createUser({ email, password, firstName, lastName, isActive, organisationId, }) {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        return this.prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                isActive,
                isEmailVerified: false,
                organisation: {
                    connect: { id: organisationId },
                },
                member: {
                    create: {
                        firstName,
                        lastName,
                        email,
                        organisation: {
                            connect: { id: organisationId },
                        },
                        gender: 'UNKNOWN',
                    },
                },
            },
        });
    }
    async findAllUsers(paginationInput, filterOptions) {
        const { skip = 0, take = 10 } = paginationInput;
        const where = {};
        if (filterOptions) {
            if (filterOptions.isActive !== undefined) {
                where.isActive = filterOptions.isActive;
            }
            if (filterOptions.emailContains) {
                where.email = {
                    contains: filterOptions.emailContains,
                    mode: 'insensitive',
                };
            }
            if (filterOptions.nameContains) {
                where.OR = [
                    {
                        firstName: {
                            contains: filterOptions.nameContains,
                            mode: 'insensitive',
                        },
                    },
                    {
                        lastName: {
                            contains: filterOptions.nameContains,
                            mode: 'insensitive',
                        },
                    },
                ];
            }
            if (filterOptions.roleId) {
                where.roles = {
                    some: {
                        id: filterOptions.roleId,
                    },
                };
            }
        }
        const [users, totalCount] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                skip,
                take,
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    roles: true,
                    userBranches: {
                        include: {
                            branch: true,
                            role: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            items: users,
            totalCount,
            hasNextPage: skip + take < totalCount,
        };
    }
    async findUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                roles: true,
                userBranches: {
                    include: {
                        branch: true,
                        role: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async updateUserActiveStatus(id, isActive) {
        const user = await this.findUserById(id);
        return this.prisma.user.update({
            where: { id },
            data: { isActive },
            include: {
                roles: true,
                userBranches: {
                    include: {
                        branch: true,
                        role: true,
                    },
                },
            },
        });
    }
    async assignRoleToUser(userId, roleId) {
        const user = await this.findUserById(userId);
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
        }
        const existingRole = user.roles.find((r) => r.id === roleId);
        if (existingRole) {
            throw new common_1.ConflictException(`User already has role ${role.name}`);
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                roles: {
                    connect: { id: roleId },
                },
            },
            include: {
                roles: true,
                userBranches: {
                    include: {
                        branch: true,
                        role: true,
                    },
                },
            },
        });
    }
    async removeRoleFromUser(userId, roleId) {
        const user = await this.findUserById(userId);
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
        }
        const existingRole = user.roles.find((r) => r.id === roleId);
        if (!existingRole) {
            throw new common_1.NotFoundException(`User does not have role ${role.name}`);
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                roles: {
                    disconnect: { id: roleId },
                },
            },
            include: {
                roles: true,
                userBranches: {
                    include: {
                        branch: true,
                        role: true,
                    },
                },
            },
        });
    }
    async assignBranchRoleToUser(userId, branchId, roleId, assignedBy) {
        const user = await this.findUserById(userId);
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch) {
            throw new common_1.NotFoundException(`Branch with ID ${branchId} not found`);
        }
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
        }
        const existingUserBranch = user.userBranches.find((ub) => ub.branchId === branchId && ub.roleId === roleId);
        if (existingUserBranch) {
            throw new common_1.ConflictException(`User already has role ${role.name} in branch ${branch.name}`);
        }
        const userBranch = await this.prisma.userBranch.create({
            data: {
                userId,
                branchId,
                roleId,
                assignedBy,
            },
            include: {
                user: true,
                branch: {
                    include: {
                        settings: true,
                    },
                },
                role: true,
            },
        });
        return userBranch;
    }
    async removeBranchRoleFromUser(userId, branchId, roleId) {
        const user = await this.findUserById(userId);
        const existingUserBranch = user.userBranches.find((ub) => ub.branchId === branchId && ub.roleId === roleId);
        if (!existingUserBranch) {
            throw new common_1.NotFoundException(`User does not have the specified role in this branch`);
        }
        return this.prisma.userBranch.delete({
            where: {
                userId_roleId: {
                    userId,
                    roleId,
                },
            },
            include: {
                user: true,
                branch: true,
                role: true,
            },
        });
    }
};
exports.UserAdminService = UserAdminService;
exports.UserAdminService = UserAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserAdminService);
//# sourceMappingURL=user-admin.service.js.map