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
var MembersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const services_1 = require("../../audit/services");
const member_entity_1 = require("../entities/member.entity");
let MembersService = MembersService_1 = class MembersService {
    prisma;
    auditLogService;
    countAssignedRfidCards() {
        return 0;
    }
    countUnassignedRfidCards() {
        return 0;
    }
    logger = new common_1.Logger(MembersService_1.name);
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async createMember(data) {
        try {
            const existing = await this.prisma.member.findFirst({
                where: { OR: [{ email: data.email }, { userId: data.userId }] },
            });
            if (existing) {
                this.logger.warn(`Attempted to create a duplicate member for email: ${data.email} or userId: ${data.userId}`);
                throw new common_1.ConflictException('A member with this email or user ID already exists.');
            }
            const member = await this.prisma.member.create({
                data: {
                    ...data,
                    status: member_entity_1.MemberStatus.ACTIVE,
                    gender: 'NOT_SPECIFIED',
                },
            });
            await this.auditLogService.create({
                action: 'CREATE',
                entityType: 'Member',
                entityId: member.id,
                description: `Created member: ${member.firstName} ${member.lastName} via user creation flow.`,
                userId: data.userId,
            });
            return member;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            this.logger.error(`Error creating member for user ${data.userId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async create(createMemberInput, userId, ipAddress, userAgent) {
        try {
            const member = await this.prisma.member.create({
                data: {
                    firstName: createMemberInput.firstName,
                    middleName: createMemberInput.middleName,
                    lastName: createMemberInput.lastName,
                    email: createMemberInput.email,
                    phoneNumber: createMemberInput.phoneNumber,
                    address: createMemberInput.address,
                    city: createMemberInput.city,
                    state: createMemberInput.state,
                    postalCode: createMemberInput.postalCode,
                    country: createMemberInput.country,
                    dateOfBirth: createMemberInput.dateOfBirth,
                    gender: createMemberInput.gender,
                    maritalStatus: createMemberInput.maritalStatus,
                    occupation: createMemberInput.occupation,
                    employerName: createMemberInput.employerName,
                    status: createMemberInput.status,
                    membershipDate: createMemberInput.membershipDate,
                    baptismDate: (() => {
                        const val = createMemberInput.baptismDate;
                        if (val == null)
                            return null;
                        if (typeof val === 'string') {
                            return val.trim() === '' ? null : val;
                        }
                        return val;
                    })(),
                    confirmationDate: (() => {
                        const val = createMemberInput.confirmationDate;
                        if (val == null)
                            return null;
                        if (typeof val === 'string') {
                            return val.trim() === '' ? null : val;
                        }
                        return val;
                    })(),
                    customFields: createMemberInput.customFields,
                    privacySettings: createMemberInput.privacySettings,
                    notes: createMemberInput.notes,
                    branchId: createMemberInput.branchId,
                    organisationId: createMemberInput.organisationId,
                    spouseId: createMemberInput.spouseId,
                    parentId: createMemberInput.parentId,
                },
                include: {
                    branch: true,
                    spouse: true,
                    parent: true,
                    children: true,
                    spiritualMilestones: true,
                    families: true,
                    groupMemberships: {
                        include: {
                            ministry: true,
                            smallGroup: true,
                        },
                    },
                    attendanceRecords: {
                        orderBy: { checkInTime: 'desc' },
                        take: 10,
                        include: {
                            session: true,
                        },
                    },
                    sacramentalRecords: true,
                    guardianProfile: true,
                    notifications: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                    prayerRequests: true,
                    contributions: true,
                },
            });
            await this.auditLogService.create({
                action: 'CREATE',
                entityType: 'Member',
                entityId: member.id,
                description: `Created member: ${member.firstName} ${member.lastName}`,
                userId,
                ipAddress,
                userAgent,
            });
            return member;
        }
        catch (error) {
            this.logger.error(`Error creating member: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findAll(skip = 0, take = 10, where, orderBy, search) {
        try {
            if (search && search.trim().length > 0) {
                where = {
                    ...where,
                    OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { phoneNumber: { contains: search, mode: 'insensitive' } },
                    ],
                };
            }
            const members = await this.prisma.member.findMany({
                skip,
                take,
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    branch: true,
                    spouse: true,
                    parent: true,
                    children: true,
                    spiritualMilestones: true,
                    families: true,
                    familyRelationships: true,
                    groupMemberships: {
                        include: {
                            ministry: true,
                            smallGroup: true,
                        },
                    },
                    attendanceRecords: true,
                    sacramentalRecords: true,
                    guardianProfile: true,
                    notifications: true,
                    prayerRequests: true,
                    contributions: true,
                },
            });
            return members;
        }
        catch (error) {
            this.logger.error(`Error finding members: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findOne(id) {
        try {
            const member = await this.prisma.member.findUnique({
                where: { id },
                include: {
                    branch: true,
                    spouse: true,
                    parent: true,
                    children: true,
                    spiritualMilestones: true,
                    families: true,
                    familyRelationships: true,
                    groupMemberships: {
                        include: {
                            ministry: true,
                            smallGroup: true,
                        },
                    },
                    attendanceRecords: {
                        orderBy: { checkInTime: 'desc' },
                        take: 10,
                        include: {
                            session: true,
                        },
                    },
                    sacramentalRecords: true,
                    guardianProfile: true,
                    notifications: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                    prayerRequests: true,
                    contributions: true,
                },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Member with ID ${id} not found`);
            }
            return member;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error finding member: ${error.message}`, error.stack);
            throw error;
        }
    }
    async update(id, updateMemberInput, userId, ipAddress, userAgent) {
        try {
            const existingMember = await this.prisma.member.findUnique({
                where: { id },
            });
            if (!existingMember) {
                throw new common_1.NotFoundException(`Member with ID ${id} not found`);
            }
            const updatedMember = await this.prisma.member.update({
                where: { id },
                data: {
                    firstName: updateMemberInput.firstName,
                    middleName: updateMemberInput.middleName,
                    lastName: updateMemberInput.lastName,
                    email: updateMemberInput.email,
                    phoneNumber: updateMemberInput.phoneNumber,
                    address: updateMemberInput.address,
                    city: updateMemberInput.city,
                    state: updateMemberInput.state,
                    postalCode: updateMemberInput.postalCode,
                    country: updateMemberInput.country,
                    dateOfBirth: updateMemberInput.dateOfBirth,
                    gender: updateMemberInput.gender,
                    maritalStatus: updateMemberInput.maritalStatus,
                    occupation: updateMemberInput.occupation,
                    employerName: updateMemberInput.employerName,
                    status: updateMemberInput.status,
                    membershipDate: updateMemberInput.membershipDate,
                    baptismDate: (() => {
                        const val = updateMemberInput.baptismDate;
                        if (val == null)
                            return null;
                        if (typeof val === 'string') {
                            return val.trim() === '' ? null : val;
                        }
                        return val;
                    })(),
                    confirmationDate: (() => {
                        const val = updateMemberInput.confirmationDate;
                        if (val == null)
                            return null;
                        if (typeof val === 'string') {
                            return val.trim() === '' ? null : val;
                        }
                        return val;
                    })(),
                    customFields: updateMemberInput.customFields,
                    privacySettings: updateMemberInput.privacySettings,
                    notes: updateMemberInput.notes,
                    branchId: updateMemberInput.branchId,
                    spouseId: updateMemberInput.spouseId,
                    parentId: updateMemberInput.parentId,
                },
                include: {
                    branch: true,
                    spouse: true,
                    parent: true,
                    children: true,
                    spiritualMilestones: true,
                    families: true,
                    prayerRequests: true,
                    contributions: true,
                },
            });
            await this.auditLogService.create({
                action: 'UPDATE',
                entityType: 'Member',
                entityId: updatedMember.id,
                description: `Updated member: ${updatedMember.firstName} ${updatedMember.lastName}`,
                userId,
                ipAddress,
                userAgent,
            });
            return updatedMember;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error updating member: ${error.message}`, error.stack);
            throw error;
        }
    }
    async remove(id, userId, ipAddress, userAgent) {
        try {
            const member = await this.prisma.member.findUnique({
                where: { id },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Member with ID ${id} not found`);
            }
            await this.prisma.member.delete({
                where: { id },
            });
            await this.auditLogService.create({
                action: 'DELETE',
                entityType: 'Member',
                entityId: id,
                description: `Deleted member: ${member.firstName} ${member.lastName}`,
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
            this.logger.error(`Error deleting member: ${error.message}`, error.stack);
            throw error;
        }
    }
    async addMemberToBranch(memberId, branchId, userId, ipAddress, userAgent) {
        try {
            const member = await this.prisma.member.findUnique({
                where: { id: memberId },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Member with ID ${memberId} not found`);
            }
            const branch = await this.prisma.branch.findUnique({
                where: { id: branchId },
            });
            if (!branch) {
                throw new common_1.NotFoundException(`Branch with ID ${branchId} not found`);
            }
            const updatedMember = await this.prisma.member.update({
                where: { id: memberId },
                data: {
                    branchId: branchId,
                },
                include: {
                    branch: true,
                    spouse: true,
                    parent: true,
                    children: true,
                    spiritualMilestones: true,
                    families: true,
                    prayerRequests: true,
                    contributions: true,
                },
            });
            await this.auditLogService.create({
                action: 'ADD_TO_BRANCH',
                entityType: 'Member',
                entityId: memberId,
                description: `Added member ${member.firstName} ${member.lastName} to branch ${branch.name}`,
                userId,
                ipAddress,
                userAgent,
                branchId,
            });
            return updatedMember;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error adding member to branch: ${error.message}`, error.stack);
            throw error;
        }
    }
    async removeMemberFromBranch(memberId, branchId, userId, ipAddress, userAgent) {
        try {
            const member = await this.prisma.member.findUnique({
                where: { id: memberId },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Member with ID ${memberId} not found`);
            }
            const branch = await this.prisma.branch.findUnique({
                where: { id: branchId },
            });
            if (!branch) {
                throw new common_1.NotFoundException(`Branch with ID ${branchId} not found`);
            }
            const updatedMember = await this.prisma.member.update({
                where: { id: memberId },
                data: {
                    branchId: null,
                },
                include: {
                    branch: true,
                    spouse: true,
                    parent: true,
                    children: true,
                    spiritualMilestones: true,
                    families: true,
                    prayerRequests: true,
                    contributions: true,
                },
            });
            await this.auditLogService.create({
                action: 'REMOVE_FROM_BRANCH',
                entityType: 'Member',
                entityId: memberId,
                description: `Removed member ${member.firstName} ${member.lastName} from branch ${branch.name}`,
                userId,
                ipAddress,
                userAgent,
                branchId,
            });
            return updatedMember;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error removing member from branch: ${error.message}`, error.stack);
            throw error;
        }
    }
    async transferMember(memberId, fromBranchId, toBranchId, reason, userId, ipAddress, userAgent) {
        try {
            const member = await this.prisma.member.findUnique({
                where: { id: memberId },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Member with ID ${memberId} not found`);
            }
            const fromBranch = await this.prisma.branch.findUnique({
                where: { id: fromBranchId },
            });
            if (!fromBranch) {
                throw new common_1.NotFoundException(`Source branch with ID ${fromBranchId} not found`);
            }
            const toBranch = await this.prisma.branch.findUnique({
                where: { id: toBranchId },
            });
            if (!toBranch) {
                throw new common_1.NotFoundException(`Destination branch with ID ${toBranchId} not found`);
            }
            const updatedMember = await this.prisma.member.update({
                where: { id: memberId },
                data: {
                    branchId: toBranchId,
                },
                include: {
                    branch: true,
                    spouse: true,
                    parent: true,
                    children: true,
                    spiritualMilestones: true,
                    families: true,
                    prayerRequests: true,
                    contributions: true,
                },
            });
            await this.auditLogService.create({
                action: 'TRANSFER',
                entityType: 'Member',
                entityId: memberId,
                description: `Transferred member ${member.firstName} ${member.lastName} from branch ${fromBranch.name} to ${toBranch.name}`,
                userId,
                ipAddress,
                userAgent,
            });
            return updatedMember;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error transferring member: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateMemberStatus(id, status, reason, userId, ipAddress, userAgent) {
        try {
            const member = await this.prisma.member.findUnique({
                where: { id },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Member with ID ${id} not found`);
            }
            const updatedMember = await this.prisma.member.update({
                where: { id },
                data: {
                    status: status,
                    statusChangeDate: new Date(),
                    statusChangeReason: reason,
                },
                include: {
                    branch: true,
                    spouse: true,
                    parent: true,
                    children: true,
                    spiritualMilestones: true,
                    families: true,
                    prayerRequests: true,
                    contributions: true,
                },
            });
            await this.auditLogService.create({
                action: 'UPDATE_STATUS',
                entityType: 'Member',
                entityId: id,
                description: `Updated member status: ${member.firstName} ${member.lastName} to ${status}`,
                userId,
                ipAddress,
                userAgent,
            });
            return updatedMember;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error updating member status: ${error.message}`, error.stack);
            throw error;
        }
    }
    async count(where) {
        try {
            return await this.prisma.member.count({ where });
        }
        catch (error) {
            this.logger.error(`Error counting members: ${error.message}`, error.stack);
            throw error;
        }
    }
    async assignRfidCard(assignRfidCardInput, userId, ipAddress, userAgent) {
        const { memberId, rfidCardId } = assignRfidCardInput;
        this.logger.log(`Attempting to assign RFID card ${rfidCardId} to member ${memberId}`);
        try {
            const member = await this.prisma.member.findUnique({
                where: { id: memberId },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Member with ID ${memberId} not found`);
            }
            const existingCardUser = await this.prisma.member.findFirst({
                where: {
                    rfidCardId: rfidCardId,
                    NOT: {
                        id: memberId,
                    },
                },
            });
            if (existingCardUser) {
                throw new common_1.ConflictException(`RFID card ID ${rfidCardId} is already assigned to another member (ID: ${existingCardUser.id})`);
            }
            const updatedMember = await this.prisma.member.update({
                where: { id: memberId },
                data: {
                    rfidCardId: rfidCardId,
                },
                include: {
                    branch: true,
                    spouse: true,
                    parent: true,
                    children: true,
                    spiritualMilestones: true,
                    families: true,
                    prayerRequests: true,
                    contributions: true,
                },
            });
            await this.auditLogService.create({
                action: 'ASSIGN_RFID_CARD',
                entityType: 'Member',
                entityId: memberId,
                description: `Assigned RFID card ID ${rfidCardId} to member ${member.firstName} ${member.lastName}`,
                userId,
                ipAddress,
                userAgent,
            });
            return updatedMember;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            this.logger.error(`Error assigning RFID card: ${error.message}`, error.stack);
            throw error;
        }
    }
    async removeRfidCard(memberId, userId, ipAddress, userAgent) {
        this.logger.log(`Attempting to remove RFID card from member ${memberId}`);
        try {
            const member = await this.prisma.member.findUnique({
                where: { id: memberId },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Member with ID ${memberId} not found`);
            }
            if (!member.rfidCardId) {
                this.logger.warn(`Member ${memberId} does not have an RFID card assigned.`);
                return member;
            }
            const updatedMember = await this.prisma.member.update({
                where: { id: memberId },
                data: {
                    rfidCardId: null,
                },
                include: {
                    branch: true,
                    spouse: true,
                    parent: true,
                    children: true,
                    spiritualMilestones: true,
                    families: true,
                    prayerRequests: true,
                    contributions: true,
                },
            });
            await this.auditLogService.create({
                action: 'REMOVE_RFID_CARD',
                entityType: 'Member',
                entityId: memberId,
                description: `Removed RFID card ID ${member.rfidCardId} from member ${member.firstName} ${member.lastName}`,
                userId,
                ipAddress,
                userAgent,
            });
            return updatedMember;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error removing RFID card: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findMemberByRfidCard(rfidCardId) {
        this.logger.log(`Attempting to find member by RFID card ID ${rfidCardId}`);
        try {
            const member = await this.prisma.member.findUnique({
                where: { rfidCardId: rfidCardId },
                include: {
                    branch: true,
                    spouse: true,
                    parent: true,
                    children: true,
                    spiritualMilestones: true,
                    families: true,
                    familyRelationships: true,
                    groupMemberships: {
                        include: {
                            ministry: true,
                            smallGroup: true,
                        },
                    },
                    attendanceRecords: true,
                    sacramentalRecords: true,
                    guardianProfile: true,
                    notifications: true,
                    prayerRequests: true,
                    contributions: true,
                },
            });
            if (!member) {
                this.logger.log(`No member found with RFID card ID ${rfidCardId}`);
                return null;
            }
            return member;
        }
        catch (error) {
            this.logger.error(`Error finding member by RFID card ID: ${error.message}`, error.stack);
            return null;
        }
    }
    async getStatistics(branchId, organisationId) {
        const baseWhere = {};
        if (branchId) {
            baseWhere.branchId = branchId;
        }
        else if (organisationId) {
            baseWhere.organisationId = organisationId;
        }
        const getStatsForPeriod = async (periodWhere, startDate, endDate) => {
            const totalMembersPromise = this.count(periodWhere);
            const activeMembersPromise = this.count({
                ...periodWhere,
                status: member_entity_1.MemberStatus.ACTIVE,
            });
            const inactiveMembersPromise = this.count({
                ...periodWhere,
                status: member_entity_1.MemberStatus.INACTIVE,
            });
            const newMembersInPeriodPromise = this.count({
                ...periodWhere,
                membershipDate: {
                    gte: startDate,
                    lte: endDate,
                },
            });
            const visitorsInPeriodPromise = this.count({
                ...periodWhere,
                status: {
                    in: [member_entity_1.MemberStatus.VISITOR],
                },
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            });
            const [totalMembers, activeMembers, inactiveMembers, newMembersInPeriod, visitorsInPeriod,] = await Promise.all([
                totalMembersPromise,
                activeMembersPromise,
                inactiveMembersPromise,
                newMembersInPeriodPromise,
                visitorsInPeriodPromise,
            ]);
            return {
                totalMembers,
                activeMembers,
                inactiveMembers,
                newMembersInPeriod,
                visitorsInPeriod,
            };
        };
        const now = new Date();
        const currentMonthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthStartDate = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
        const prevMonthEndDate = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);
        const currentMonthStatsPromise = getStatsForPeriod(baseWhere, currentMonthStartDate, currentMonthEndDate);
        const lastMonthStatsPromise = getStatsForPeriod(baseWhere, prevMonthStartDate, prevMonthEndDate);
        const [currentMonthStats, lastMonthStats] = await Promise.all([
            currentMonthStatsPromise,
            lastMonthStatsPromise,
        ]);
        return {
            ...currentMonthStats,
            lastMonth: lastMonthStats,
        };
    }
    async getMemberDashboard(memberId) {
        const member = await this.prisma.member.findUnique({
            where: { id: memberId },
            include: {
                groupMemberships: {
                    include: {
                        ministry: true,
                        smallGroup: true,
                    },
                },
                spiritualMilestones: true,
                branch: true,
            },
        });
        if (!member) {
            throw new common_1.NotFoundException(`Member with ID ${memberId} not found`);
        }
        const groupCount = member.groupMemberships.length;
        const totalSessions = await this.prisma.attendanceSession.count({
            where: { branchId: member.branchId },
        });
        const attendanceRecords = await this.prisma.attendanceRecord.count({
            where: { memberId: memberId },
        });
        const attendanceRate = totalSessions > 0 ? (attendanceRecords / totalSessions) * 100 : 0;
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const totalGiving = await this.prisma.contribution.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                memberId: memberId,
                date: { gte: startOfYear },
            },
        });
        const upcomingEvents = await this.prisma.event.findMany({
            where: {
                branchId: member.branchId,
                startDate: { gte: new Date() },
            },
            orderBy: {
                startDate: 'asc',
            },
            take: 5,
        });
        return {
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            profileImageUrl: member.profileImageUrl ?? undefined,
            membershipStatus: member.status,
            membershipDate: member.membershipDate ?? undefined,
            stats: {
                groups: groupCount,
                attendance: attendanceRate,
                giving: `GHS${totalGiving._sum.amount?.toFixed(2) || '0.00'}`,
            },
            upcomingEvents: upcomingEvents.map((e) => ({
                id: e.id,
                name: e.title,
                date: e.startDate,
                location: e.location || 'TBD',
            })),
            groups: member.groupMemberships.map((gm) => ({
                id: gm.id,
                name: gm.ministry?.name || gm.smallGroup?.name || 'Unknown Group',
                role: gm.role,
            })),
            milestones: {
                baptismDate: member.baptismDate ?? undefined,
                confirmationDate: member.confirmationDate ?? undefined,
            },
        };
    }
};
exports.MembersService = MembersService;
exports.MembersService = MembersService = MembersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        services_1.AuditLogService])
], MembersService);
//# sourceMappingURL=members.service.js.map