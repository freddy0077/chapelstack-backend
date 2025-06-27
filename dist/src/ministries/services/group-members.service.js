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
exports.GroupMembersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const group_member_input_1 = require("../dto/group-member.input");
let GroupMembersService = class GroupMembersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = filters
            ? {
                ...(filters.id && { id: filters.id }),
                ...(filters.memberId && { memberId: filters.memberId }),
                ...(filters.ministryId && { ministryId: filters.ministryId }),
                ...(filters.smallGroupId && { smallGroupId: filters.smallGroupId }),
                ...(filters.role && { role: filters.role }),
                ...(filters.status && { status: filters.status }),
            }
            : {};
        return this.prisma.groupMember.findMany({
            where,
            include: {
                member: true,
                ministry: true,
                smallGroup: true,
            },
        });
    }
    async findOne(idOrFilter) {
        let where;
        if (typeof idOrFilter === 'string') {
            where = { id: idOrFilter };
        }
        else {
            where = {
                ...(idOrFilter.id && { id: idOrFilter.id }),
                ...(idOrFilter.memberId && { memberId: idOrFilter.memberId }),
                ...(idOrFilter.ministryId && { ministryId: idOrFilter.ministryId }),
                ...(idOrFilter.smallGroupId && {
                    smallGroupId: idOrFilter.smallGroupId,
                }),
                ...(idOrFilter.role && { role: idOrFilter.role }),
                ...(idOrFilter.status && { status: idOrFilter.status }),
            };
        }
        const groupMember = await this.prisma.groupMember.findFirst({
            where,
            include: {
                member: true,
                ministry: true,
                smallGroup: true,
            },
        });
        if (!groupMember) {
            if (typeof idOrFilter === 'string') {
                throw new common_1.NotFoundException(`Group Member with ID ${idOrFilter} not found`);
            }
            else {
                throw new common_1.NotFoundException(`Group Member with specified criteria not found`);
            }
        }
        return groupMember;
    }
    async addMemberToGroup(input) {
        if (!input.ministryId && !input.smallGroupId) {
            throw new common_1.BadRequestException('Either ministryId or smallGroupId must be provided');
        }
        const member = await this.prisma.member.findUnique({
            where: { id: input.memberId },
        });
        if (!member) {
            throw new common_1.NotFoundException(`Member with ID ${input.memberId} not found`);
        }
        if (input.ministryId) {
            const ministry = await this.prisma.ministry.findUnique({
                where: { id: input.ministryId },
            });
            if (!ministry) {
                throw new common_1.NotFoundException(`Ministry with ID ${input.ministryId} not found`);
            }
        }
        if (input.smallGroupId) {
            const smallGroup = await this.prisma.smallGroup.findUnique({
                where: { id: input.smallGroupId },
            });
            if (!smallGroup) {
                throw new common_1.NotFoundException(`Small Group with ID ${input.smallGroupId} not found`);
            }
            if (smallGroup.maximumCapacity) {
                const currentMemberCount = await this.prisma.groupMember.count({
                    where: {
                        smallGroupId: input.smallGroupId,
                        status: 'ACTIVE',
                    },
                });
                if (currentMemberCount >= smallGroup.maximumCapacity) {
                    throw new common_1.BadRequestException(`Small Group has reached maximum capacity of ${smallGroup.maximumCapacity} members`);
                }
            }
        }
        const existingMembership = await this.prisma.groupMember.findFirst({
            where: {
                memberId: input.memberId,
                ...(input.ministryId ? { ministryId: input.ministryId } : {}),
                ...(input.smallGroupId ? { smallGroupId: input.smallGroupId } : {}),
            },
        });
        if (existingMembership) {
            throw new common_1.BadRequestException('Member is already part of this group');
        }
        const newGroupMember = await this.prisma.groupMember.create({
            data: {
                memberId: input.memberId,
                ministryId: input.ministryId,
                smallGroupId: input.smallGroupId,
                role: input.role,
                status: input.status,
            },
            include: {
                member: true,
                ministry: true,
                smallGroup: true,
            },
        });
        return newGroupMember;
    }
    async updateGroupMember(id, input) {
        const groupMember = await this.prisma.groupMember.findUnique({
            where: { id },
        });
        if (!groupMember) {
            throw new common_1.NotFoundException(`Group Member with ID ${id} not found`);
        }
        return this.prisma.groupMember.update({
            where: { id },
            data: {
                ...(input.role !== undefined && { role: input.role }),
                ...(input.status !== undefined && { status: input.status }),
            },
            include: {
                member: true,
                ministry: true,
                smallGroup: true,
            },
        });
    }
    async removeMemberFromGroup(id) {
        const groupMember = await this.prisma.groupMember.findUnique({
            where: { id },
        });
        if (!groupMember) {
            throw new common_1.NotFoundException(`Group Member with ID ${id} not found`);
        }
        await this.prisma.groupMember.delete({
            where: { id },
        });
        return true;
    }
    async assignGroupLeader(groupMemberId) {
        const groupMember = await this.prisma.groupMember.findUnique({
            where: { id: groupMemberId },
            include: {
                smallGroup: true,
                ministry: true,
            },
        });
        if (!groupMember) {
            throw new common_1.NotFoundException(`Group Member with ID ${groupMemberId} not found`);
        }
        const leaderGroupMember = await this.prisma.groupMember.update({
            where: { id: groupMemberId },
            data: {
                role: group_member_input_1.GroupMemberRole.LEADER,
            },
            include: {
                member: true,
                ministry: true,
                smallGroup: true,
            },
        });
        return leaderGroupMember;
    }
    async getMembersByMinistry(ministryId) {
        const ministryMembers = await this.prisma.groupMember.findMany({
            where: { ministryId },
            include: {
                member: true,
            },
        });
        return ministryMembers;
    }
    async getMembersBySmallGroup(smallGroupId) {
        const smallGroupMembers = await this.prisma.groupMember.findMany({
            where: { smallGroupId },
            include: {
                member: true,
            },
        });
        console.log('Fetched smallGroupMembers in service:', JSON.stringify(smallGroupMembers, null, 2));
        return smallGroupMembers;
    }
};
exports.GroupMembersService = GroupMembersService;
exports.GroupMembersService = GroupMembersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupMembersService);
//# sourceMappingURL=group-members.service.js.map