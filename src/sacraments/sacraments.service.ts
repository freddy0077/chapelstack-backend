import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSacramentalRecordInput } from './dto/create-sacramental-record.input';
import { UpdateSacramentalRecordInput } from './dto/update-sacramental-record.input';
import { PrismaService } from '../prisma/prisma.service';
import { SacramentalRecord } from './entities/sacramental-record.entity';
import { SacramentalRecordFilterInput } from './dto/sacramental-record-filter.input';
import { Prisma } from '@prisma/client';

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
    const allTypes = ['BAPTISM', 'COMMUNION', 'CONFIRMATION', 'MARRIAGE'];
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

    // Use type assertion with parentheses for proper precedence
    const prismaResult = await this.prisma.sacramentalRecord.create({
      data: createSacramentalRecordInput,
    });
    const record = prismaResult as unknown as SacramentalRecord;
    return this.mapPrismaRecordToEntity(record);
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
}
