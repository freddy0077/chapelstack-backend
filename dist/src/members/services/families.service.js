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
var FamiliesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamiliesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/services/audit-log.service");
const family_entity_1 = require("../entities/family.entity");
let FamiliesService = FamiliesService_1 = class FamiliesService {
    prisma;
    auditLogService;
    logger = new common_1.Logger(FamiliesService_1.name);
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async createFamily(createFamilyInput, userId, ipAddress, userAgent) {
        try {
            const family = await this.prisma.family.create({
                data: {
                    name: createFamilyInput.name,
                    address: createFamilyInput.address,
                    city: createFamilyInput.city,
                    state: createFamilyInput.state,
                    postalCode: createFamilyInput.postalCode,
                    country: createFamilyInput.country,
                    phoneNumber: createFamilyInput.phoneNumber,
                    customFields: createFamilyInput.customFields,
                    members: createFamilyInput.memberIds
                        ? {
                            connect: createFamilyInput.memberIds.map((id) => ({ id })),
                        }
                        : undefined,
                },
                include: {
                    members: true,
                },
            });
            await this.auditLogService.create({
                action: 'CREATE',
                entityType: 'Family',
                entityId: family.id,
                description: `Created family: ${family.name}`,
                userId,
                ipAddress,
                userAgent,
            });
            return family;
        }
        catch (error) {
            this.logger.error(`Error creating family: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findAllFamilies(skip = 0, take = 10, where, orderBy) {
        try {
            const families = await this.prisma.family.findMany({
                skip,
                take,
                where,
                orderBy,
                include: {
                    members: true,
                },
            });
            return families;
        }
        catch (error) {
            this.logger.error(`Error finding families: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findFamilyById(id) {
        try {
            const family = await this.prisma.family.findUnique({
                where: { id },
                include: {
                    members: true,
                },
            });
            if (!family) {
                throw new common_1.NotFoundException(`Family with ID ${id} not found`);
            }
            return family;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error finding family: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateFamily(id, updateFamilyInput, userId, ipAddress, userAgent) {
        try {
            const existingFamily = await this.prisma.family.findUnique({
                where: { id },
            });
            if (!existingFamily) {
                throw new common_1.NotFoundException(`Family with ID ${id} not found`);
            }
            const updatedFamily = await this.prisma.family.update({
                where: { id },
                data: {
                    name: updateFamilyInput.name,
                    address: updateFamilyInput.address,
                    city: updateFamilyInput.city,
                    state: updateFamilyInput.state,
                    postalCode: updateFamilyInput.postalCode,
                    country: updateFamilyInput.country,
                    phoneNumber: updateFamilyInput.phoneNumber,
                    customFields: updateFamilyInput.customFields,
                    members: updateFamilyInput.memberIds
                        ? {
                            set: [],
                            connect: updateFamilyInput.memberIds.map((id) => ({ id })),
                        }
                        : undefined,
                },
                include: {
                    members: true,
                },
            });
            await this.auditLogService.create({
                action: 'UPDATE',
                entityType: 'Family',
                entityId: id,
                description: `Updated family: ${updatedFamily.name}`,
                userId,
                ipAddress,
                userAgent,
            });
            return updatedFamily;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error updating family: ${error.message}`, error.stack);
            throw error;
        }
    }
    async removeFamily(id, userId, ipAddress, userAgent) {
        try {
            const family = await this.prisma.family.findUnique({
                where: { id },
            });
            if (!family) {
                throw new common_1.NotFoundException(`Family with ID ${id} not found`);
            }
            await this.prisma.familyRelationship.deleteMany({
                where: { familyId: id },
            });
            await this.prisma.family.delete({
                where: { id },
            });
            await this.auditLogService.create({
                action: 'DELETE',
                entityType: 'Family',
                entityId: id,
                description: `Deleted family: ${family.name}`,
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
            this.logger.error(`Error removing family: ${error.message}`, error.stack);
            throw error;
        }
    }
    async addMemberToFamily(familyId, memberId, userId, ipAddress, userAgent) {
        try {
            const family = await this.prisma.family.findUnique({
                where: { id: familyId },
            });
            if (!family) {
                throw new common_1.NotFoundException(`Family with ID ${familyId} not found`);
            }
            const member = await this.prisma.member.findUnique({
                where: { id: memberId },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Member with ID ${memberId} not found`);
            }
            const updatedFamily = await this.prisma.family.update({
                where: { id: familyId },
                data: {
                    members: {
                        connect: { id: memberId },
                    },
                },
                include: {
                    members: true,
                },
            });
            await this.auditLogService.create({
                action: 'ADD_MEMBER_TO_FAMILY',
                entityType: 'Family',
                entityId: familyId,
                description: `Added member ${member.firstName} ${member.lastName} to family ${family.name}`,
                userId,
                ipAddress,
                userAgent,
            });
            return updatedFamily;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error adding member to family: ${error.message}`, error.stack);
            throw error;
        }
    }
    async removeMemberFromFamily(familyId, memberId, userId, ipAddress, userAgent) {
        try {
            const family = await this.prisma.family.findUnique({
                where: { id: familyId },
            });
            if (!family) {
                throw new common_1.NotFoundException(`Family with ID ${familyId} not found`);
            }
            const member = await this.prisma.member.findUnique({
                where: { id: memberId },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Member with ID ${memberId} not found`);
            }
            const updatedFamily = await this.prisma.family.update({
                where: { id: familyId },
                data: {
                    members: {
                        disconnect: { id: memberId },
                    },
                },
                include: {
                    members: true,
                },
            });
            await this.prisma.familyRelationship.deleteMany({
                where: {
                    familyId,
                    OR: [{ memberId }, { relatedMemberId: memberId }],
                },
            });
            await this.auditLogService.create({
                action: 'REMOVE_MEMBER_FROM_FAMILY',
                entityType: 'Family',
                entityId: familyId,
                description: `Removed member ${member.firstName} ${member.lastName} from family ${family.name}`,
                userId,
                ipAddress,
                userAgent,
            });
            return updatedFamily;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error removing member from family: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createFamilyRelationship(createFamilyRelationshipInput, userId, ipAddress, userAgent) {
        try {
            const member = await this.prisma.member.findUnique({
                where: { id: createFamilyRelationshipInput.memberId },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Member with ID ${createFamilyRelationshipInput.memberId} not found`);
            }
            const relatedMember = await this.prisma.member.findUnique({
                where: { id: createFamilyRelationshipInput.relatedMemberId },
            });
            if (!relatedMember) {
                throw new common_1.NotFoundException(`Related member with ID ${createFamilyRelationshipInput.relatedMemberId} not found`);
            }
            if (createFamilyRelationshipInput.familyId) {
                const family = await this.prisma.family.findUnique({
                    where: { id: createFamilyRelationshipInput.familyId },
                });
                if (!family) {
                    throw new common_1.NotFoundException(`Family with ID ${createFamilyRelationshipInput.familyId} not found`);
                }
            }
            const existingRelationship = await this.prisma.familyRelationship.findFirst({
                where: {
                    memberId: createFamilyRelationshipInput.memberId,
                    relatedMemberId: createFamilyRelationshipInput.relatedMemberId,
                },
            });
            if (existingRelationship) {
                throw new common_1.ConflictException(`A relationship already exists between these members`);
            }
            const relationship = await this.prisma.familyRelationship.create({
                data: {
                    memberId: createFamilyRelationshipInput.memberId,
                    relatedMemberId: createFamilyRelationshipInput.relatedMemberId,
                    relationshipType: createFamilyRelationshipInput.relationshipType,
                    familyId: createFamilyRelationshipInput.familyId,
                },
                include: {
                    member: true,
                    relatedMember: true,
                    family: true,
                },
            });
            if (createFamilyRelationshipInput.relationshipType ===
                family_entity_1.FamilyRelationshipType.SPOUSE) {
                await this.prisma.familyRelationship.create({
                    data: {
                        memberId: createFamilyRelationshipInput.relatedMemberId,
                        relatedMemberId: createFamilyRelationshipInput.memberId,
                        relationshipType: family_entity_1.FamilyRelationshipType.SPOUSE,
                        familyId: createFamilyRelationshipInput.familyId,
                    },
                });
                await this.prisma.member.update({
                    where: { id: createFamilyRelationshipInput.memberId },
                    data: { spouseId: createFamilyRelationshipInput.relatedMemberId },
                });
                await this.prisma.member.update({
                    where: { id: createFamilyRelationshipInput.relatedMemberId },
                    data: { spouseId: createFamilyRelationshipInput.memberId },
                });
            }
            else if (createFamilyRelationshipInput.relationshipType ===
                family_entity_1.FamilyRelationshipType.PARENT) {
                await this.prisma.familyRelationship.create({
                    data: {
                        memberId: createFamilyRelationshipInput.relatedMemberId,
                        relatedMemberId: createFamilyRelationshipInput.memberId,
                        relationshipType: family_entity_1.FamilyRelationshipType.CHILD,
                        familyId: createFamilyRelationshipInput.familyId,
                    },
                });
                await this.prisma.member.update({
                    where: { id: createFamilyRelationshipInput.relatedMemberId },
                    data: { parentId: createFamilyRelationshipInput.memberId },
                });
            }
            else if (createFamilyRelationshipInput.relationshipType ===
                family_entity_1.FamilyRelationshipType.CHILD) {
                await this.prisma.familyRelationship.create({
                    data: {
                        memberId: createFamilyRelationshipInput.relatedMemberId,
                        relatedMemberId: createFamilyRelationshipInput.memberId,
                        relationshipType: family_entity_1.FamilyRelationshipType.PARENT,
                        familyId: createFamilyRelationshipInput.familyId,
                    },
                });
                await this.prisma.member.update({
                    where: { id: createFamilyRelationshipInput.memberId },
                    data: { parentId: createFamilyRelationshipInput.relatedMemberId },
                });
            }
            else if (createFamilyRelationshipInput.relationshipType ===
                family_entity_1.FamilyRelationshipType.SIBLING) {
                await this.prisma.familyRelationship.create({
                    data: {
                        memberId: createFamilyRelationshipInput.relatedMemberId,
                        relatedMemberId: createFamilyRelationshipInput.memberId,
                        relationshipType: family_entity_1.FamilyRelationshipType.SIBLING,
                        familyId: createFamilyRelationshipInput.familyId,
                    },
                });
            }
            await this.auditLogService.create({
                action: 'CREATE',
                entityType: 'FamilyRelationship',
                entityId: relationship.id,
                description: `Created family relationship: ${member.firstName} ${member.lastName} is ${createFamilyRelationshipInput.relationshipType} of ${relatedMember.firstName} ${relatedMember.lastName}`,
                userId,
                ipAddress,
                userAgent,
            });
            return relationship;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            this.logger.error(`Error creating family relationship: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findAllFamilyRelationships(skip = 0, take = 10, where, orderBy) {
        try {
            const relationships = await this.prisma.familyRelationship.findMany({
                skip,
                take,
                where,
                orderBy,
                include: {
                    member: true,
                    relatedMember: true,
                    family: true,
                },
            });
            return relationships;
        }
        catch (error) {
            this.logger.error(`Error finding family relationships: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findFamilyRelationshipById(id) {
        try {
            const relationship = await this.prisma.familyRelationship.findUnique({
                where: { id },
                include: {
                    member: true,
                    relatedMember: true,
                    family: true,
                },
            });
            if (!relationship) {
                throw new common_1.NotFoundException(`Family relationship with ID ${id} not found`);
            }
            return relationship;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error finding family relationship: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findFamilyRelationshipsByMember(memberId) {
        try {
            const relationships = await this.prisma.familyRelationship.findMany({
                where: { memberId },
                include: {
                    member: true,
                    relatedMember: true,
                    family: true,
                },
            });
            return relationships;
        }
        catch (error) {
            this.logger.error(`Error finding family relationships by member: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateFamilyRelationship(id, updateFamilyRelationshipInput, userId, ipAddress, userAgent) {
        try {
            const existingRelationship = await this.prisma.familyRelationship.findUnique({
                where: { id },
                include: {
                    member: true,
                    relatedMember: true,
                },
            });
            if (!existingRelationship) {
                throw new common_1.NotFoundException(`Family relationship with ID ${id} not found`);
            }
            if (updateFamilyRelationshipInput.memberId) {
                const member = await this.prisma.member.findUnique({
                    where: { id: updateFamilyRelationshipInput.memberId },
                });
                if (!member) {
                    throw new common_1.NotFoundException(`Member with ID ${updateFamilyRelationshipInput.memberId} not found`);
                }
            }
            if (updateFamilyRelationshipInput.relatedMemberId) {
                const relatedMember = await this.prisma.member.findUnique({
                    where: { id: updateFamilyRelationshipInput.relatedMemberId },
                });
                if (!relatedMember) {
                    throw new common_1.NotFoundException(`Related member with ID ${updateFamilyRelationshipInput.relatedMemberId} not found`);
                }
            }
            if (updateFamilyRelationshipInput.familyId) {
                const family = await this.prisma.family.findUnique({
                    where: { id: updateFamilyRelationshipInput.familyId },
                });
                if (!family) {
                    throw new common_1.NotFoundException(`Family with ID ${updateFamilyRelationshipInput.familyId} not found`);
                }
            }
            const updatedRelationship = await this.prisma.familyRelationship.update({
                where: { id },
                data: {
                    memberId: updateFamilyRelationshipInput.memberId,
                    relatedMemberId: updateFamilyRelationshipInput.relatedMemberId,
                    relationshipType: updateFamilyRelationshipInput.relationshipType,
                    familyId: updateFamilyRelationshipInput.familyId,
                },
                include: {
                    member: true,
                    relatedMember: true,
                    family: true,
                },
            });
            await this.auditLogService.create({
                action: 'UPDATE',
                entityType: 'FamilyRelationship',
                entityId: id,
                description: `Updated family relationship between ${updatedRelationship.member.firstName} ${updatedRelationship.member.lastName} and ${updatedRelationship.relatedMember.firstName} ${updatedRelationship.relatedMember.lastName}`,
                userId,
                ipAddress,
                userAgent,
            });
            return updatedRelationship;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error updating family relationship: ${error.message}`, error.stack);
            throw error;
        }
    }
    async removeFamilyRelationship(id, userId, ipAddress, userAgent) {
        try {
            const relationship = await this.prisma.familyRelationship.findUnique({
                where: { id },
                include: {
                    member: true,
                    relatedMember: true,
                },
            });
            if (!relationship) {
                throw new common_1.NotFoundException(`Family relationship with ID ${id} not found`);
            }
            const reciprocalRelationship = await this.prisma.familyRelationship.findFirst({
                where: {
                    memberId: relationship.relatedMemberId,
                    relatedMemberId: relationship.memberId,
                },
            });
            if (reciprocalRelationship) {
                await this.prisma.familyRelationship.delete({
                    where: { id: reciprocalRelationship.id },
                });
            }
            if (relationship.relationshipType === 'SPOUSE') {
                await this.prisma.member.update({
                    where: { id: relationship.memberId },
                    data: { spouseId: null },
                });
                await this.prisma.member.update({
                    where: { id: relationship.relatedMemberId },
                    data: { spouseId: null },
                });
            }
            else if (relationship.relationshipType === 'PARENT') {
                await this.prisma.member.update({
                    where: { id: relationship.relatedMemberId },
                    data: { parentId: null },
                });
            }
            else if (relationship.relationshipType === 'CHILD') {
                await this.prisma.member.update({
                    where: { id: relationship.memberId },
                    data: { parentId: null },
                });
            }
            await this.prisma.familyRelationship.delete({
                where: { id },
            });
            await this.auditLogService.create({
                action: 'DELETE',
                entityType: 'FamilyRelationship',
                entityId: id,
                description: `Deleted family relationship between ${relationship.member.firstName} ${relationship.member.lastName} and ${relationship.relatedMember.firstName} ${relationship.relatedMember.lastName}`,
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
            this.logger.error(`Error removing family relationship: ${error.message}`, error.stack);
            throw error;
        }
    }
    async addMemberToFamilyByRfidCard(rfidCardId, familyId, relatedMemberId, relationship) {
        const member = await this.prisma.member.findUnique({
            where: { rfidCardId },
        });
        if (!member) {
            throw new common_1.NotFoundException(`Member with RFID card ID ${rfidCardId} not found`);
        }
        const family = await this.prisma.family.findUnique({
            where: { id: familyId },
        });
        if (!family) {
            throw new common_1.NotFoundException(`Family with ID ${familyId} not found`);
        }
        await this.prisma.familyRelationship.create({
            data: {
                familyId,
                memberId: member.id,
                relatedMemberId,
                relationshipType: relationship,
            },
        });
        return this.findFamilyById(familyId);
    }
    async countFamilies(where) {
        try {
            return await this.prisma.family.count({ where });
        }
        catch (error) {
            this.logger.error(`Error counting families: ${error.message}`, error.stack);
            throw error;
        }
    }
    async countFamilyRelationships(where) {
        try {
            return await this.prisma.familyRelationship.count({ where });
        }
        catch (error) {
            this.logger.error(`Error counting family relationships: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findFamiliesByMemberId(memberId) {
        const relationships = await this.prisma.familyRelationship.findMany({
            where: { memberId },
            include: { family: true },
        });
        const families = relationships
            .map((rel) => rel.family)
            .filter((fam) => fam != null);
        const uniqueFamilies = Array.from(new Map(families.map((f) => [f.id, f])).values());
        return uniqueFamilies;
    }
};
exports.FamiliesService = FamiliesService;
exports.FamiliesService = FamiliesService = FamiliesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], FamiliesService);
//# sourceMappingURL=families.service.js.map