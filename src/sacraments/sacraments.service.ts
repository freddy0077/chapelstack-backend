import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSacramentalRecordInput } from './dto/create-sacramental-record.input';
import { UpdateSacramentalRecordInput } from './dto/update-sacramental-record.input';
import { PrismaService } from '../prisma/prisma.service';
import { SacramentalRecord } from './entities/sacramental-record.entity';
import { SacramentalRecordFilterInput } from './dto/sacramental-record-filter.input';
import { Prisma } from '@prisma/client';
import {
  MarriageAnalytics,
  MemberMarriageHistory,
  MonthlyMarriageData,
  OfficiantStats,
} from './dto/marriage-analytics.output';
import {
  MarriageAnalyticsInput,
  MemberMarriageHistoryInput,
} from './dto/marriage-analytics.input';

// Type guard to ensure Prisma record is properly typed
function isPrismaSacramentalRecord(
  record: unknown,
): record is SacramentalRecord {
  return Boolean(record && typeof record === 'object' && 'id' in record);
}

@Injectable()
export class SacramentsService {
  async getSacramentStats(period?: string, branchId?: string) {
    // Real DB aggregation logic for sacrament statistics
    const where: any = {};
    if (branchId) where.branchId = branchId;

    // Determine period range
    let dateFrom: Date | undefined = undefined;
    let dateTo: Date | undefined = undefined;
    const today = new Date();
    if (period === 'last12months') {
      dateTo = today;
      dateFrom = new Date(today);
      dateFrom.setFullYear(today.getFullYear() - 1);
    }
    if (dateFrom && dateTo) {
      where.dateOfSacrament = { gte: dateFrom, lte: dateTo };
    }

    // Fetch all sacramental records for the branch and period
    const records = await this.prisma.sacramentalRecord.findMany({ where });

    // Group by sacramentType
    const statsMap: Record<string, { count: number }> = {};
    for (const record of records) {
      statsMap[record.sacramentType] = statsMap[record.sacramentType] || {
        count: 0,
      };
      statsMap[record.sacramentType].count++;
    }

    // Build output for each sacrament type
    const allTypes = [
      'BAPTISM',
      'EUCHARIST_FIRST_COMMUNION',
      'CONFIRMATION',
      'MATRIMONY',
    ];
    const result = allTypes.map((type) => {
      const count = statsMap[type]?.count || 0;
      // Trend/percentage logic placeholder (real logic would compare with previous period)
      return {
        sacramentType: type,
        count,
        trend: 'neutral' as const,
        percentage: 0,
        period: period === 'last12months' ? 'Last 12 months' : '',
      };
    });
    return result;
  }

  async getUpcomingAnniversaries(limit?: number, branchId?: string) {
    // Real DB logic for upcoming anniversaries
    // 1. Find all sacramental records for the branch
    // 2. Calculate upcoming anniversaries for each record
    // 3. Sort by next anniversary date
    // 4. Return up to `limit` results

    const today = new Date();
    const where: any = {};
    if (branchId) where.branchId = branchId;

    // Fetch all sacramental records for the branch
    const records = await this.prisma.sacramentalRecord.findMany({
      where,
      orderBy: { dateOfSacrament: 'asc' },
      include: { member: true },
    });

    // Calculate upcoming anniversaries (within next 60 days)
    const anniversaries = records
      .map((record) => {
        // Calculate years since sacrament
        const sacramentDate = new Date(record.dateOfSacrament);
        const thisYear = today.getFullYear();
        const nextAnniversary = new Date(sacramentDate);
        nextAnniversary.setFullYear(thisYear);
        if (nextAnniversary < today) {
          nextAnniversary.setFullYear(thisYear + 1);
        }
        const diffDays = Math.ceil(
          (nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays > 60 || diffDays < 0) return undefined;
        const years =
          nextAnniversary.getFullYear() - sacramentDate.getFullYear();
        const anniversaryType = `${years}${years === 1 ? 'st' : years === 2 ? 'nd' : years === 3 ? 'rd' : 'th'} ${record.sacramentType.charAt(0) + record.sacramentType.slice(1).toLowerCase()}`;
        return {
          name:
            `${record.member?.firstName ?? ''}${record.member?.middleName ? ' ' + record.member.middleName : ''}${record.member?.lastName ? ' ' + record.member.lastName : ''}`.trim() ||
            'N/A',
          sacramentType: record.sacramentType,
          anniversaryType,
          date: nextAnniversary,
          isSpecial: years % 5 === 0,
          timeUntil: diffDays === 0 ? 'Today' : `In ${diffDays} days`,
        };
      })
      .filter((a): a is NonNullable<typeof a> => !!a)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return limit ? anniversaries.slice(0, limit) : anniversaries;
  }

  constructor(private prisma: PrismaService) {}

  // Helper method to convert Prisma SacramentalRecord to GraphQL SacramentalRecord entity
  private mapPrismaRecordToEntity(
    record: SacramentalRecord,
  ): SacramentalRecord {
    // Ensure record is properly typed using type guard
    if (!isPrismaSacramentalRecord(record)) {
      throw new Error('Invalid sacramental record data');
    }

    // Explicitly map each field to ensure type safety
    return {
      id: record.id,
      memberId: record.memberId,
      sacramentType: record.sacramentType,
      dateOfSacrament: record.dateOfSacrament,
      locationOfSacrament: record.locationOfSacrament,
      officiantName: record.officiantName,
      officiantId: record.officiantId,
      // NEW: Marriage-specific member relationship fields
      groomMemberId: record.groomMemberId,
      brideMemberId: record.brideMemberId,
      // NEW: Witness member relationship fields
      witness1MemberId: record.witness1MemberId,
      witness2MemberId: record.witness2MemberId,
      godparent1Name: record.godparent1Name,
      godparent2Name: record.godparent2Name,
      sponsorName: record.sponsorName,
      witness1Name: record.witness1Name,
      witness2Name: record.witness2Name,
      groomName: record.groomName,
      brideName: record.brideName,
      certificateNumber: record.certificateNumber,
      certificateUrl: record.certificateUrl,
      notes: record.notes,
      branchId: record.branchId,
      organisationId: record.organisationId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async create(
    createSacramentalRecordInput: CreateSacramentalRecordInput,
  ): Promise<SacramentalRecord> {
    // Check if member exists
    const member = await this.prisma.member.findUnique({
      where: { id: createSacramentalRecordInput.memberId },
    });

    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createSacramentalRecordInput.memberId} not found`,
      );
    }

    // Check if branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: createSacramentalRecordInput.branchId },
    });

    if (!branch) {
      throw new NotFoundException(
        `Branch with ID ${createSacramentalRecordInput.branchId} not found`,
      );
    }

    // Enhanced validation for marriage records
    if (createSacramentalRecordInput.sacramentType === 'MATRIMONY') {
      await this.validateMarriageRecord(createSacramentalRecordInput);
    }

    // Validate member relationships if provided
    await this.validateMemberRelationships(createSacramentalRecordInput);

    // Use type assertion with separate variable for clarity
    const prismaResult = await this.prisma.sacramentalRecord.create({
      data: createSacramentalRecordInput,
    });
    const record = prismaResult as unknown as SacramentalRecord;
    return this.mapPrismaRecordToEntity(record);
  }

  // NEW: Enhanced validation for marriage records
  private async validateMarriageRecord(
    input: CreateSacramentalRecordInput,
  ): Promise<void> {
    // Ensure both groom and bride information is provided
    if (!input.groomName && !input.groomMemberId) {
      throw new BadRequestException(
        'Groom information is required for marriage records',
      );
    }

    if (!input.brideName && !input.brideMemberId) {
      throw new BadRequestException(
        'Bride information is required for marriage records',
      );
    }

    // Check for duplicate marriage records (business rule)
    if (input.groomMemberId && input.brideMemberId) {
      const existingMarriage = await this.prisma.sacramentalRecord.findFirst({
        where: {
          sacramentType: 'MATRIMONY',
          OR: [
            {
              AND: [
                { groomMemberId: input.groomMemberId },
                { brideMemberId: input.brideMemberId },
              ],
            },
            {
              AND: [
                { groomMemberId: input.brideMemberId },
                { brideMemberId: input.groomMemberId },
              ],
            },
          ],
        },
      });

      if (existingMarriage) {
        throw new BadRequestException(
          'A marriage record already exists for these members',
        );
      }
    }
  }

  // NEW: Validate member relationships
  private async validateMemberRelationships(
    input: CreateSacramentalRecordInput,
  ): Promise<void> {
    const memberIds = [
      input.groomMemberId,
      input.brideMemberId,
      input.officiantId,
      input.witness1MemberId,
      input.witness2MemberId,
    ].filter((id): id is string => Boolean(id));

    if (memberIds.length > 0) {
      const members = await this.prisma.member.findMany({
        where: { id: { in: memberIds } },
        select: { id: true },
      });

      const foundMemberIds = members.map((m) => m.id);
      const missingMemberIds = memberIds.filter(
        (id) => !foundMemberIds.includes(id),
      );

      if (missingMemberIds.length > 0) {
        throw new NotFoundException(
          `Members not found: ${missingMemberIds.join(', ')}`,
        );
      }
    }
  }

  async findAll(
    filter?: SacramentalRecordFilterInput,
  ): Promise<SacramentalRecord[]> {
    const where: Prisma.SacramentalRecordFindManyArgs['where'] = {};

    if (filter) {
      if (filter.memberId) {
        where.memberId = filter.memberId;
      }
      if (filter.sacramentType) {
        where.sacramentType = filter.sacramentType;
      }

      if (filter.branchId) {
        where.branchId = filter.branchId;
      }

      if (filter.organisationId) {
        where.organisationId = filter.organisationId;
      }

      if (filter.certificateNumber) {
        where.certificateNumber = {
          contains: filter.certificateNumber,
          mode: 'insensitive',
        };
      }

      if (filter.officiantName) {
        where.officiantName = {
          contains: filter.officiantName,
          mode: 'insensitive',
        };
      }

      if (filter.locationOfSacrament) {
        where.locationOfSacrament = {
          contains: filter.locationOfSacrament,
          mode: 'insensitive',
        };
      }

      if (filter.dateFrom || filter.dateTo) {
        where.dateOfSacrament = {};

        if (filter.dateFrom) {
          where.dateOfSacrament.gte = filter.dateFrom;
        }

        if (filter.dateTo) {
          where.dateOfSacrament.lte = filter.dateTo;
        }
      }
    }

    // Use type assertion with separate variable for clarity
    const prismaResults = await this.prisma.sacramentalRecord.findMany({
      where,
      orderBy: { dateOfSacrament: 'desc' },
    });
    const records = prismaResults as unknown as SacramentalRecord[];
    return records.map((record) => this.mapPrismaRecordToEntity(record));
  }

  async findOne(id: string): Promise<SacramentalRecord> {
    // Use type assertion with separate variable for clarity
    const prismaResult = await this.prisma.sacramentalRecord.findUnique({
      where: { id },
    });
    const record = (prismaResult as unknown as SacramentalRecord) ?? null;

    if (!record) {
      throw new NotFoundException(`Sacramental record with ID ${id} not found`);
    }

    return this.mapPrismaRecordToEntity(record);
  }

  async findByMember(memberId: string): Promise<SacramentalRecord[]> {
    // Check if member exists
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Use type assertion with separate variable for clarity
    const prismaResults = await this.prisma.sacramentalRecord.findMany({
      where: { memberId },
      orderBy: { dateOfSacrament: 'desc' },
    });
    const records = prismaResults as unknown as SacramentalRecord[];
    return records.map((record) => this.mapPrismaRecordToEntity(record));
  }

  async update(
    id: string,
    updateSacramentalRecordInput: UpdateSacramentalRecordInput,
  ): Promise<SacramentalRecord> {
    // Check if record exists
    await this.findOne(id);

    // Check if member exists if memberId is provided
    if (updateSacramentalRecordInput.memberId) {
      const member = await this.prisma.member.findUnique({
        where: { id: updateSacramentalRecordInput.memberId },
      });

      if (!member) {
        throw new NotFoundException(
          `Member with ID ${updateSacramentalRecordInput.memberId} not found`,
        );
      }
    }

    // Check if branch exists if branchId is provided
    if (updateSacramentalRecordInput.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: updateSacramentalRecordInput.branchId },
      });

      if (!branch) {
        throw new NotFoundException(
          `Branch with ID ${updateSacramentalRecordInput.branchId} not found`,
        );
      }
    }

    // Use type assertion with separate variable for clarity
    const prismaResult = await this.prisma.sacramentalRecord.update({
      where: { id },
      data: updateSacramentalRecordInput,
    });
    const record = prismaResult as unknown as SacramentalRecord;
    return this.mapPrismaRecordToEntity(record);
  }

  async remove(id: string): Promise<SacramentalRecord> {
    // Check if record exists
    const existingRecord = await this.findOne(id);

    if (!existingRecord) {
      throw new NotFoundException(`Sacramental record with ID ${id} not found`);
    }

    // Delete the record and return the deleted entity
    const deleted = await this.prisma.sacramentalRecord.delete({
      where: { id },
    });
    return this.mapPrismaRecordToEntity(
      deleted as unknown as SacramentalRecord,
    );
  }

  async uploadCertificate(
    recordId: string,
    certificateUrl: string,
  ): Promise<SacramentalRecord> {
    // Check if record exists
    const existingRecord = await this.findOne(recordId);

    if (!existingRecord) {
      throw new NotFoundException(
        `Sacramental record with ID ${recordId} not found`,
      );
    }

    // Update the record with the certificate URL
    const updatedRecord = await this.prisma.sacramentalRecord.update({
      where: { id: recordId },
      data: { certificateUrl },
    });

    const result = updatedRecord as unknown as SacramentalRecord;

    return this.mapPrismaRecordToEntity(result);
  }

  async updateCertificateUrl(
    id: string,
    certificateUrl: string,
  ): Promise<SacramentalRecord> {
    // Check if record exists
    await this.findOne(id);

    // Use type assertion with separate variable for clarity
    const prismaResult = await this.prisma.sacramentalRecord.update({
      where: { id },
      data: { certificateUrl },
    });
    const record = prismaResult as unknown as SacramentalRecord;
    return this.mapPrismaRecordToEntity(record);
  }

  async getMarriageAnalytics(
    input: MarriageAnalyticsInput,
  ): Promise<MarriageAnalytics> {
    const { branchId, startDate, endDate, organisationId } = input;

    // Build date range filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Build base where clause
    const where: any = {
      sacramentType: 'MATRIMONY',
      branchId,
    };
    if (organisationId) where.organisationId = organisationId;
    if (Object.keys(dateFilter).length > 0) where.dateOfSacrament = dateFilter;

    // Get all marriage records
    const marriages = await this.prisma.sacramentalRecord.findMany({
      where,
      include: {
        groomMember: true,
        brideMember: true,
        officiant: true,
      },
    });

    // Calculate statistics
    const totalMarriages = marriages.length;
    const memberMarriages = marriages.filter(
      (m) => m.groomMemberId && m.brideMemberId,
    ).length;
    const mixedMarriages = marriages.filter(
      (m) =>
        (m.groomMemberId && !m.brideMemberId) ||
        (!m.groomMemberId && m.brideMemberId),
    ).length;
    const externalMarriages = marriages.filter(
      (m) => !m.groomMemberId && !m.brideMemberId,
    ).length;

    // Calculate year-over-year growth
    const currentYear = new Date().getFullYear();
    const thisYearMarriages = marriages.filter(
      (m) => m.dateOfSacrament.getFullYear() === currentYear,
    ).length;

    const lastYearMarriages = marriages.filter(
      (m) => m.dateOfSacrament.getFullYear() === currentYear - 1,
    ).length;

    const growthPercentage =
      lastYearMarriages > 0
        ? ((thisYearMarriages - lastYearMarriages) / lastYearMarriages) * 100
        : 0;

    // Get monthly trends
    const monthlyTrends = await this.getMonthlyMarriageData(input);

    // Get top officiants
    const topOfficiants = await this.getOfficiantStats(input);

    // Calculate average age (for members only)
    const memberAges: number[] = [];
    for (const marriage of marriages) {
      if (marriage.groomMember?.dateOfBirth) {
        const age = this.calculateAge(
          marriage.groomMember.dateOfBirth,
          marriage.dateOfSacrament,
        );
        memberAges.push(age);
      }
      if (marriage.brideMember?.dateOfBirth) {
        const age = this.calculateAge(
          marriage.brideMember.dateOfBirth,
          marriage.dateOfSacrament,
        );
        memberAges.push(age);
      }
    }
    const averageAge =
      memberAges.length > 0
        ? memberAges.reduce((sum, age) => sum + age, 0) / memberAges.length
        : 0;

    // Calculate upcoming anniversaries (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingAnniversaries = marriages.filter((m) => {
      const nextAnniversary = new Date(m.dateOfSacrament);
      nextAnniversary.setFullYear(new Date().getFullYear());
      return (
        nextAnniversary >= new Date() && nextAnniversary <= thirtyDaysFromNow
      );
    }).length;

    return {
      totalMarriages,
      memberMarriages,
      mixedMarriages,
      externalMarriages,
      thisYearMarriages,
      lastYearMarriages,
      growthPercentage,
      monthlyTrends,
      topOfficiants,
      averageAge: Math.round(averageAge * 10) / 10, // Round to 1 decimal
      upcomingAnniversaries,
    };
  }

  async getMemberMarriageHistory(
    input: MemberMarriageHistoryInput,
  ): Promise<MemberMarriageHistory | null> {
    const { memberId, branchId } = input;

    // Find marriage record where member is either groom or bride
    const marriage = await this.prisma.sacramentalRecord.findFirst({
      where: {
        sacramentType: 'MATRIMONY',
        OR: [
          { groomMemberId: memberId },
          { brideMemberId: memberId },
          { memberId }, // Primary member
        ],
        ...(branchId && { branchId }),
      },
      include: {
        member: true,
        groomMember: true,
        brideMember: true,
      },
    });

    if (!marriage) return null;

    // Determine spouse information
    let spouseName: string;
    let spouseMemberId: string | undefined;

    if (marriage.groomMemberId === memberId) {
      // Member is groom, spouse is bride
      spouseName = marriage.brideName || '';
      spouseMemberId = marriage.brideMemberId || undefined;
    } else if (marriage.brideMemberId === memberId) {
      // Member is bride, spouse is groom
      spouseName = marriage.groomName || '';
      spouseMemberId = marriage.groomMemberId || undefined;
    } else {
      // Member is primary member, determine from names
      const memberName = `${marriage.member.firstName} ${marriage.member.lastName}`;
      if (marriage.groomName === memberName) {
        spouseName = marriage.brideName || '';
        spouseMemberId = marriage.brideMemberId || undefined;
      } else {
        spouseName = marriage.groomName || '';
        spouseMemberId = marriage.groomMemberId || undefined;
      }
    }

    // Calculate years married and next anniversary
    const yearsMarried = this.calculateYearsMarried(marriage.dateOfSacrament);
    const nextAnniversary = this.calculateNextAnniversary(
      marriage.dateOfSacrament,
    );

    return {
      memberId,
      memberName: `${marriage.member.firstName} ${marriage.member.lastName}`,
      spouseName,
      spouseMemberId,
      marriageDate: marriage.dateOfSacrament,
      marriageLocation: marriage.locationOfSacrament,
      officiantName: marriage.officiantName,
      yearsMarried,
      nextAnniversary,
      certificateUrl: marriage.certificateUrl || undefined,
    };
  }

  async getMonthlyMarriageData(
    input: MarriageAnalyticsInput,
  ): Promise<MonthlyMarriageData[]> {
    const { branchId, startDate, endDate, organisationId } = input;

    // Default to last 12 months if no date range provided
    const defaultEndDate = endDate ? new Date(endDate) : new Date();
    const defaultStartDate = startDate
      ? new Date(startDate)
      : new Date(
          defaultEndDate.getFullYear() - 1,
          defaultEndDate.getMonth(),
          1,
        );

    const where: any = {
      sacramentType: 'MATRIMONY',
      branchId,
      dateOfSacrament: {
        gte: defaultStartDate,
        lte: defaultEndDate,
      },
    };
    if (organisationId) where.organisationId = organisationId;

    const marriages = await this.prisma.sacramentalRecord.findMany({
      where,
    });

    // Group by month
    const monthlyData: { [key: string]: MonthlyMarriageData } = {};

    marriages.forEach((marriage) => {
      const monthKey = `${marriage.dateOfSacrament.getFullYear()}-${String(marriage.dateOfSacrament.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          count: 0,
          memberMarriages: 0,
          mixedMarriages: 0,
          externalMarriages: 0,
        };
      }

      monthlyData[monthKey].count++;

      if (marriage.groomMemberId && marriage.brideMemberId) {
        monthlyData[monthKey].memberMarriages++;
      } else if (marriage.groomMemberId || marriage.brideMemberId) {
        monthlyData[monthKey].mixedMarriages++;
      } else {
        monthlyData[monthKey].externalMarriages++;
      }
    });

    return Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month),
    );
  }

  async getOfficiantStats(
    input: MarriageAnalyticsInput,
  ): Promise<OfficiantStats[]> {
    const { branchId, startDate, endDate, organisationId } = input;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const where: any = {
      sacramentType: 'MATRIMONY',
      branchId,
    };
    if (organisationId) where.organisationId = organisationId;
    if (Object.keys(dateFilter).length > 0) where.dateOfSacrament = dateFilter;

    const marriages = await this.prisma.sacramentalRecord.findMany({
      where,
      include: {
        officiant: true,
      },
    });

    // Group by officiant
    const officiantStats: { [key: string]: OfficiantStats } = {};

    marriages.forEach((marriage) => {
      const officiantKey = marriage.officiantId || marriage.officiantName;

      if (!officiantStats[officiantKey]) {
        officiantStats[officiantKey] = {
          officiantId: marriage.officiantId || '',
          officiantName: marriage.officiantName,
          marriageCount: 0,
          memberOfficiant: !!marriage.officiant,
        };
      }

      officiantStats[officiantKey].marriageCount++;
    });

    return Object.values(officiantStats)
      .sort((a, b) => b.marriageCount - a.marriageCount)
      .slice(0, 10); // Top 10 officiants
  }

  // Helper methods
  private calculateAge(birthDate: Date, referenceDate: Date): number {
    const age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())
    ) {
      return age - 1;
    }

    return age;
  }

  private calculateYearsMarried(marriageDate: Date): number {
    const now = new Date();
    const years = now.getFullYear() - marriageDate.getFullYear();
    const monthDiff = now.getMonth() - marriageDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && now.getDate() < marriageDate.getDate())
    ) {
      return years - 1;
    }

    return years;
  }

  private calculateNextAnniversary(marriageDate: Date): Date {
    const now = new Date();
    const currentYear = now.getFullYear();
    const anniversary = new Date(
      currentYear,
      marriageDate.getMonth(),
      marriageDate.getDate(),
    );

    // If anniversary has passed this year, return next year's anniversary
    if (anniversary < now) {
      anniversary.setFullYear(currentYear + 1);
    }

    return anniversary;
  }
}
