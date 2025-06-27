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
var SpiritualMilestonesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpiritualMilestonesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../../audit/services/audit-log.service");
let SpiritualMilestonesService = SpiritualMilestonesService_1 = class SpiritualMilestonesService {
    prisma;
    auditLogService;
    logger = new common_1.Logger(SpiritualMilestonesService_1.name);
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async create(createSpiritualMilestoneInput, userId, ipAddress, userAgent) {
        try {
            const member = await this.prisma.member.findUnique({
                where: { id: createSpiritualMilestoneInput.memberId },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Member with ID ${createSpiritualMilestoneInput.memberId} not found`);
            }
            const milestone = await this.prisma.spiritualMilestone.create({
                data: {
                    type: createSpiritualMilestoneInput.type,
                    date: createSpiritualMilestoneInput.date,
                    location: createSpiritualMilestoneInput.location,
                    performedBy: createSpiritualMilestoneInput.performedBy,
                    description: createSpiritualMilestoneInput.description,
                    additionalDetails: createSpiritualMilestoneInput.additionalDetails,
                    memberId: createSpiritualMilestoneInput.memberId,
                },
                include: {
                    member: true,
                },
            });
            await this.auditLogService.create({
                action: 'CREATE',
                entityType: 'SpiritualMilestone',
                entityId: milestone.id,
                description: `Created spiritual milestone (${milestone.type}) for member: ${member.firstName} ${member.lastName}`,
                userId,
                ipAddress,
                userAgent,
            });
            if (createSpiritualMilestoneInput.type === 'BAPTISM') {
                await this.prisma.member.update({
                    where: { id: createSpiritualMilestoneInput.memberId },
                    data: {
                        baptismDate: createSpiritualMilestoneInput.date,
                    },
                });
            }
            else if (createSpiritualMilestoneInput.type === 'CONFIRMATION') {
                await this.prisma.member.update({
                    where: { id: createSpiritualMilestoneInput.memberId },
                    data: {
                        confirmationDate: createSpiritualMilestoneInput.date,
                    },
                });
            }
            return milestone;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error creating spiritual milestone: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findAll(skip = 0, take = 10, where, orderBy) {
        try {
            const milestones = await this.prisma.spiritualMilestone.findMany({
                skip,
                take,
                where,
                orderBy,
                include: {
                    member: true,
                },
            });
            return milestones;
        }
        catch (error) {
            this.logger.error(`Error finding spiritual milestones: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findOne(id) {
        try {
            const milestone = await this.prisma.spiritualMilestone.findUnique({
                where: { id },
                include: {
                    member: true,
                },
            });
            if (!milestone) {
                throw new common_1.NotFoundException(`Spiritual milestone with ID ${id} not found`);
            }
            return milestone;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error finding spiritual milestone: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findByMember(memberId) {
        try {
            const milestones = await this.prisma.spiritualMilestone.findMany({
                where: { memberId },
                include: {
                    member: true,
                },
                orderBy: {
                    date: 'desc',
                },
            });
            return milestones;
        }
        catch (error) {
            this.logger.error(`Error finding spiritual milestones by member: ${error.message}`, error.stack);
            throw error;
        }
    }
    async update(id, updateSpiritualMilestoneInput, userId, ipAddress, userAgent) {
        try {
            const existingMilestone = await this.prisma.spiritualMilestone.findUnique({
                where: { id },
                include: {
                    member: true,
                },
            });
            if (!existingMilestone) {
                throw new common_1.NotFoundException(`Spiritual milestone with ID ${id} not found`);
            }
            if (updateSpiritualMilestoneInput.memberId &&
                updateSpiritualMilestoneInput.memberId !== existingMilestone.memberId) {
                const member = await this.prisma.member.findUnique({
                    where: { id: updateSpiritualMilestoneInput.memberId },
                });
                if (!member) {
                    throw new common_1.NotFoundException(`Member with ID ${updateSpiritualMilestoneInput.memberId} not found`);
                }
            }
            const updatedMilestone = await this.prisma.spiritualMilestone.update({
                where: { id },
                data: {
                    type: updateSpiritualMilestoneInput.type,
                    date: updateSpiritualMilestoneInput.date,
                    location: updateSpiritualMilestoneInput.location,
                    performedBy: updateSpiritualMilestoneInput.performedBy,
                    description: updateSpiritualMilestoneInput.description,
                    additionalDetails: updateSpiritualMilestoneInput.additionalDetails,
                    memberId: updateSpiritualMilestoneInput.memberId,
                },
                include: {
                    member: true,
                },
            });
            await this.auditLogService.create({
                action: 'UPDATE',
                entityType: 'SpiritualMilestone',
                entityId: id,
                description: `Updated spiritual milestone (${updatedMilestone.type}) for member: ${updatedMilestone.member.firstName} ${updatedMilestone.member.lastName}`,
                userId,
                ipAddress,
                userAgent,
            });
            if (updateSpiritualMilestoneInput.type === 'BAPTISM' &&
                updateSpiritualMilestoneInput.date) {
                await this.prisma.member.update({
                    where: { id: updatedMilestone.memberId },
                    data: {
                        baptismDate: updateSpiritualMilestoneInput.date,
                    },
                });
            }
            else if (updateSpiritualMilestoneInput.type === 'CONFIRMATION' &&
                updateSpiritualMilestoneInput.date) {
                await this.prisma.member.update({
                    where: { id: updatedMilestone.memberId },
                    data: {
                        confirmationDate: updateSpiritualMilestoneInput.date,
                    },
                });
            }
            return updatedMilestone;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error updating spiritual milestone: ${error.message}`, error.stack);
            throw error;
        }
    }
    async remove(id, userId, ipAddress, userAgent) {
        try {
            const milestone = await this.prisma.spiritualMilestone.findUnique({
                where: { id },
                include: {
                    member: true,
                },
            });
            if (!milestone) {
                throw new common_1.NotFoundException(`Spiritual milestone with ID ${id} not found`);
            }
            await this.prisma.spiritualMilestone.delete({
                where: { id },
            });
            await this.auditLogService.create({
                action: 'DELETE',
                entityType: 'SpiritualMilestone',
                entityId: id,
                description: `Deleted spiritual milestone (${milestone.type}) for member: ${milestone.member.firstName} ${milestone.member.lastName}`,
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
            this.logger.error(`Error removing spiritual milestone: ${error.message}`, error.stack);
            throw error;
        }
    }
    async count(where) {
        try {
            return await this.prisma.spiritualMilestone.count({ where });
        }
        catch (error) {
            this.logger.error(`Error counting spiritual milestones: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SpiritualMilestonesService = SpiritualMilestonesService;
exports.SpiritualMilestonesService = SpiritualMilestonesService = SpiritualMilestonesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], SpiritualMilestonesService);
//# sourceMappingURL=spiritual-milestones.service.js.map