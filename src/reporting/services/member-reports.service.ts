import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportFilterInput, DateRangeInput } from '../dto/report-filter.input';
import {
  MemberDemographicsData,
  MembershipStatusDistribution,
} from '../entities/member-demographics-data.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class MemberReportsService {
  constructor(private prisma: PrismaService) {}

  async getMemberListReport(
    filter: ReportFilterInput,
  ): Promise<{ totalCount: number; members: any[]; filters: any }> {
    const { branchId, organisationId, dateRange, searchTerm } = filter;

    // Build the where clause based on filters
    const where: Prisma.MemberWhereInput = {};

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

    // Query the database
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

  async getMemberDemographicsReport(
    branchId?: string,
    organisationId?: string,
    dateRange?: DateRangeInput,
  ): Promise<MemberDemographicsData> {
    // Build the where clause based on filters
    const where: Prisma.MemberWhereInput = {};

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

    // Get branch name
    const branch = branchId
      ? await this.prisma.branch.findUnique({
          where: { id: branchId },
          select: { name: true },
        })
      : null;

    // Get total members
    const totalMembers = await this.prisma.member.count({ where });

    // Get new members in period
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

    // Calculate age distribution
    const members = await this.prisma.member.findMany({
      where,
      select: {
        dateOfBirth: true,
        gender: true,
        membershipStatus: true,
      },
    });

    // Process age distribution
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

    const statusCounts: Record<string, number> = {};

    const currentYear = new Date().getFullYear();

    members.forEach((member) => {
      // Process age
      if (member.dateOfBirth) {
        const age = currentYear - member.dateOfBirth.getFullYear();
        if (age < 18) ageGroups['Under 18']++;
        else if (age < 25) ageGroups['18-24']++;
        else if (age < 35) ageGroups['25-34']++;
        else if (age < 45) ageGroups['35-44']++;
        else if (age < 55) ageGroups['45-54']++;
        else if (age < 65) ageGroups['55-64']++;
        else ageGroups['65+']++;
      } else {
        ageGroups['Unknown']++;
      }

      // Process gender
      if (member.gender === 'MALE') genderCounts.male++;
      else if (member.gender === 'FEMALE') genderCounts.female++;
      else genderCounts.other++;

      // Process membership status
      const status = member.membershipStatus || 'UNKNOWN';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Convert to arrays with percentages
    const ageDistribution = Object.entries(ageGroups).map(
      ([ageGroup, count]) => ({
        ageGroup,
        count,
        percentage: totalMembers > 0 ? (count / totalMembers) * 100 : 0,
      }),
    );

    const genderDistribution = {
      maleCount: genderCounts.male,
      femaleCount: genderCounts.female,
      otherCount: genderCounts.other,
      malePercentage:
        totalMembers > 0 ? (genderCounts.male / totalMembers) * 100 : 0,
      femalePercentage:
        totalMembers > 0 ? (genderCounts.female / totalMembers) * 100 : 0,
      otherPercentage:
        totalMembers > 0 ? (genderCounts.other / totalMembers) * 100 : 0,
    };

    const membershipStatusDistribution: MembershipStatusDistribution[] =
      Object.entries(statusCounts).map(([status, count]) => ({
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
}
