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
exports.MemberReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MemberReportsService = class MemberReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMemberListReport(filter) {
        const { branchId, organisationId, dateRange, searchTerm } = filter;
        const where = {};
        if (branchId) {
            where.branchId = branchId;
        }
        if (organisationId) {
            where.organisationId = organisationId;
        }
        if (dateRange) {
            where.createdAt = {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            };
        }
        if (searchTerm) {
            where.OR = [
                { firstName: { contains: searchTerm, mode: 'insensitive' } },
                { lastName: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
            ];
        }
        const members = await this.prisma.member.findMany({
            where,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                gender: true,
                dateOfBirth: true,
                membershipStatus: true,
                branch: {
                    select: {
                        name: true,
                    },
                },
                createdAt: true,
            },
            orderBy: {
                lastName: 'asc',
            },
        });
        const totalCount = await this.prisma.member.count({ where });
        return {
            totalCount,
            members,
            filters: { branchId, organisationId, dateRange, searchTerm },
        };
    }
    async getMemberDemographicsReport(branchId, organisationId, dateRange) {
        const where = {};
        if (branchId) {
            where.branchId = branchId;
        }
        if (organisationId) {
            where.organisationId = organisationId;
        }
        if (dateRange) {
            where.createdAt = {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            };
        }
        const branch = branchId
            ? await this.prisma.branch.findUnique({
                where: { id: branchId },
                select: { name: true },
            })
            : null;
        const totalMembers = await this.prisma.member.count({ where });
        const newMembersInPeriod = dateRange
            ? await this.prisma.member.count({
                where: {
                    ...where,
                    createdAt: {
                        gte: dateRange.startDate,
                        lte: dateRange.endDate,
                    },
                },
            })
            : 0;
        const members = await this.prisma.member.findMany({
            where,
            select: {
                dateOfBirth: true,
                gender: true,
                membershipStatus: true,
            },
        });
        const ageGroups = {
            'Under 18': 0,
            '18-24': 0,
            '25-34': 0,
            '35-44': 0,
            '45-54': 0,
            '55-64': 0,
            '65+': 0,
            Unknown: 0,
        };
        const genderCounts = {
            male: 0,
            female: 0,
            other: 0,
        };
        const statusCounts = {};
        const currentYear = new Date().getFullYear();
        members.forEach((member) => {
            if (member.dateOfBirth) {
                const age = currentYear - member.dateOfBirth.getFullYear();
                if (age < 18)
                    ageGroups['Under 18']++;
                else if (age < 25)
                    ageGroups['18-24']++;
                else if (age < 35)
                    ageGroups['25-34']++;
                else if (age < 45)
                    ageGroups['35-44']++;
                else if (age < 55)
                    ageGroups['45-54']++;
                else if (age < 65)
                    ageGroups['55-64']++;
                else
                    ageGroups['65+']++;
            }
            else {
                ageGroups['Unknown']++;
            }
            if (member.gender === 'MALE')
                genderCounts.male++;
            else if (member.gender === 'FEMALE')
                genderCounts.female++;
            else
                genderCounts.other++;
            const status = member.membershipStatus || 'UNKNOWN';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        const ageDistribution = Object.entries(ageGroups).map(([ageGroup, count]) => ({
            ageGroup,
            count,
            percentage: totalMembers > 0 ? (count / totalMembers) * 100 : 0,
        }));
        const genderDistribution = {
            maleCount: genderCounts.male,
            femaleCount: genderCounts.female,
            otherCount: genderCounts.other,
            malePercentage: totalMembers > 0 ? (genderCounts.male / totalMembers) * 100 : 0,
            femalePercentage: totalMembers > 0 ? (genderCounts.female / totalMembers) * 100 : 0,
            otherPercentage: totalMembers > 0 ? (genderCounts.other / totalMembers) * 100 : 0,
        };
        const membershipStatusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count: count,
            percentage: totalMembers > 0 ? (count / totalMembers) * 100 : 0,
        }));
        const branchName = branch ? branch.name : '';
        return {
            branchId,
            organisationId,
            branchName,
            startDate: dateRange?.startDate || new Date(0),
            endDate: dateRange?.endDate || new Date(),
            totalMembers,
            newMembersInPeriod,
            ageDistribution,
            genderDistribution,
            membershipStatusDistribution,
        };
    }
};
exports.MemberReportsService = MemberReportsService;
exports.MemberReportsService = MemberReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MemberReportsService);
//# sourceMappingURL=member-reports.service.js.map