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
exports.RolePermissionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RolePermissionService = class RolePermissionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRole(name, description) {
        const existingRole = await this.prisma.role.findUnique({
            where: { name },
        });
        if (existingRole) {
            throw new common_1.ConflictException(`Role with name ${name} already exists`);
        }
        return this.prisma.role.create({
            data: {
                name,
                description,
            },
        });
    }
    async findAllRoles() {
        return this.prisma.role.findMany({
            include: {
                permissions: true,
                users: true,
                userBranches: true,
            },
        });
    }
    async findRoleById(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: true,
                users: true,
                userBranches: true,
            },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }
    async updateRole(id, name, description) {
        const role = await this.findRoleById(id);
        if (name && name !== role.name) {
            const existingRole = await this.prisma.role.findUnique({
                where: { name },
            });
            if (existingRole && existingRole.id !== id) {
                throw new common_1.ConflictException(`Another role with name ${name} already exists`);
            }
        }
        return this.prisma.role.update({
            where: { id },
            data: {
                name: name || undefined,
                description: description !== undefined ? description : undefined,
            },
            include: {
                permissions: true,
                users: true,
                userBranches: true,
            },
        });
    }
    async deleteRole(id) {
        const role = await this.findRoleById(id);
        if (role.users.length > 0 || role.userBranches.length > 0) {
            throw new common_1.ConflictException(`Cannot delete role ${role.name} as it is assigned to users`);
        }
        return this.prisma.role.delete({
            where: { id },
            include: {
                permissions: true,
            },
        });
    }
    async createPermission(action, subject, description) {
        try {
            return await this.prisma.permission.create({
                data: {
                    action,
                    subject,
                    description,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException(`Permission with action '${action}' and subject '${subject}' already exists`);
            }
            throw error;
        }
    }
    async findAllPermissions() {
        return this.prisma.permission.findMany({
            include: {
                roles: true,
            },
        });
    }
    async findPermissionById(id) {
        const permission = await this.prisma.permission.findUnique({
            where: { id },
            include: {
                roles: true,
            },
        });
        if (!permission) {
            throw new common_1.NotFoundException(`Permission with ID ${id} not found`);
        }
        return permission;
    }
    async updatePermission(id, action, subject, description) {
        const permission = await this.findPermissionById(id);
        if ((action && action !== permission.action) ||
            (subject && subject !== permission.subject)) {
            const existingPermission = await this.prisma.permission.findFirst({
                where: {
                    action: action || permission.action,
                    subject: subject || permission.subject,
                    NOT: {
                        id,
                    },
                },
            });
            if (existingPermission) {
                throw new common_1.ConflictException(`Another permission with action '${action || permission.action}' and subject '${subject || permission.subject}' already exists`);
            }
        }
        return this.prisma.permission.update({
            where: { id },
            data: {
                action: action || undefined,
                subject: subject || undefined,
                description: description !== undefined ? description : undefined,
            },
            include: {
                roles: true,
            },
        });
    }
    async deletePermission(id) {
        const permission = await this.findPermissionById(id);
        if (permission.roles.length > 0) {
            throw new common_1.ConflictException(`Cannot delete permission as it is assigned to roles`);
        }
        return this.prisma.permission.delete({
            where: { id },
        });
    }
    async assignPermissionToRole(roleId, permissionId) {
        const role = await this.findRoleById(roleId);
        const permission = await this.findPermissionById(permissionId);
        const hasPermission = role.permissions.some((p) => p.id === permissionId);
        if (hasPermission) {
            throw new common_1.ConflictException(`Role ${role.name} already has permission ${permission.action} ${permission.subject}`);
        }
        return this.prisma.role.update({
            where: { id: roleId },
            data: {
                permissions: {
                    connect: { id: permissionId },
                },
            },
            include: {
                permissions: true,
                users: true,
                userBranches: true,
            },
        });
    }
    async removePermissionFromRole(roleId, permissionId) {
        const role = await this.findRoleById(roleId);
        const permission = await this.findPermissionById(permissionId);
        const hasPermission = role.permissions.some((p) => p.id === permissionId);
        if (!hasPermission) {
            throw new common_1.NotFoundException(`Role ${role.name} does not have permission ${permission.action} ${permission.subject}`);
        }
        return this.prisma.role.update({
            where: { id: roleId },
            data: {
                permissions: {
                    disconnect: { id: permissionId },
                },
            },
            include: {
                permissions: true,
                users: true,
                userBranches: true,
            },
        });
    }
    async createRoleWithPermissions(name, description, permissionIds) {
        const existingRole = await this.prisma.role.findUnique({
            where: { name },
        });
        if (existingRole) {
            throw new common_1.ConflictException(`Role with name ${name} already exists`);
        }
        const permissions = await this.prisma.permission.findMany({
            where: { id: { in: permissionIds } },
        });
        if (permissions.length !== permissionIds.length) {
            throw new common_1.NotFoundException('One or more permissions not found');
        }
        return this.prisma.role.create({
            data: {
                name,
                description,
                permissions: {
                    connect: permissionIds.map((id) => ({ id })),
                },
            },
            include: {
                permissions: true,
                users: true,
                userBranches: true,
            },
        });
    }
};
exports.RolePermissionService = RolePermissionService;
exports.RolePermissionService = RolePermissionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolePermissionService);
//# sourceMappingURL=role-permission.service.js.map