import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateDeathRegisterInput,
  UpdateDeathRegisterInput,
  DeathRegisterFilterInput,
  UploadDeathDocumentInput,
} from '../dto/death-register.input';
import {
  DeathRegister,
  DeathRegisterStats,
  MemorialDate,
} from '../entities/death-register.entity';

@Injectable()
export class DeathRegisterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDeathRegisterInput: CreateDeathRegisterInput,
    userId: string,
  ): Promise<DeathRegister> {
    console.log('Received death register input:', JSON.stringify(createDeathRegisterInput, null, 2));

    // Check if member exists
    const member = await this.prisma.member.findUnique({
      where: { id: createDeathRegisterInput.memberId },
    });

    if (!member) {
      throw new NotFoundException(
        `Member with ID ${createDeathRegisterInput.memberId} not found`,
      );
    }

    // Check if death register already exists for this member
    const existingRecord = await this.prisma.deathRegister.findUnique({
      where: { memberId: createDeathRegisterInput.memberId },
    });

    if (existingRecord) {
      throw new ConflictException(
        `Death register already exists for member ${createDeathRegisterInput.memberId}`,
      );
    }

    // Let Prisma handle the date conversion automatically
    const deathRegister = await this.prisma.deathRegister.create({
      data: {
        ...createDeathRegisterInput,
        recordedBy: userId,
        photoUrls: createDeathRegisterInput.photoUrls || [],
        additionalDocuments: createDeathRegisterInput.additionalDocuments || [],
      },
      include: {
        member: true,
        branch: true,
        organisation: true,
        funeralEvent: true,
      },
    });

    return deathRegister as DeathRegister;
  }

  async findAll(filter?: DeathRegisterFilterInput): Promise<DeathRegister[]> {
    const where: Prisma.DeathRegisterWhereInput = {};

    if (filter) {
      if (filter.organisationId) {
        where.organisationId = filter.organisationId;
      }
      if (filter.branchId) {
        where.branchId = filter.branchId;
      }
      if (filter.dateFrom || filter.dateTo) {
        where.dateOfDeath = {};
        if (filter.dateFrom) {
          where.dateOfDeath.gte = filter.dateFrom;
        }
        if (filter.dateTo) {
          where.dateOfDeath.lte = filter.dateTo;
        }
      }
      if (filter.searchTerm) {
        where.OR = [
          {
            member: {
              OR: [
                {
                  firstName: {
                    contains: filter.searchTerm,
                    mode: 'insensitive',
                  },
                },
                {
                  lastName: {
                    contains: filter.searchTerm,
                    mode: 'insensitive',
                  },
                },
                {
                  middleName: {
                    contains: filter.searchTerm,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
          {
            placeOfDeath: { contains: filter.searchTerm, mode: 'insensitive' },
          },
          {
            causeOfDeath: { contains: filter.searchTerm, mode: 'insensitive' },
          },
          { nextOfKin: { contains: filter.searchTerm, mode: 'insensitive' } },
        ];
      }
      if (filter.burialType !== undefined) {
        where.burialCremation = filter.burialType;
      }
      if (filter.familyNotified !== undefined) {
        where.familyNotified = filter.familyNotified;
      }
      if (filter.hasFuneralEvent !== undefined) {
        if (filter.hasFuneralEvent) {
          where.funeralEventId = { not: null };
        } else {
          where.funeralEventId = null;
        }
      }
      if (filter.recordedBy) {
        where.recordedBy = filter.recordedBy;
      }
    }

    const orderBy: Prisma.DeathRegisterOrderByWithRelationInput = {};
    if (filter?.sortBy) {
      const sortOrder = filter.sortOrder === 'desc' ? 'desc' : 'asc';
      switch (filter.sortBy) {
        case 'dateOfDeath':
          orderBy.dateOfDeath = sortOrder;
          break;
        case 'memberName':
          orderBy.member = { lastName: sortOrder };
          break;
        case 'recordedDate':
          orderBy.recordedDate = sortOrder;
          break;
        default:
          orderBy.dateOfDeath = 'desc';
      }
    } else {
      orderBy.dateOfDeath = 'desc';
    }

    const deathRegisters = await this.prisma.deathRegister.findMany({
      where,
      include: {
        member: true,
        branch: true,
        organisation: true,
        funeralEvent: true,
      },
      orderBy,
      skip: filter?.skip,
      take: filter?.take,
    });

    return deathRegisters as DeathRegister[];
  }

  async findOne(id: string): Promise<DeathRegister> {
    const deathRegister = await this.prisma.deathRegister.findUnique({
      where: { id },
      include: {
        member: true,
        branch: true,
        organisation: true,
        funeralEvent: true,
      },
    });

    if (!deathRegister) {
      throw new NotFoundException(`Death register with ID ${id} not found`);
    }

    return deathRegister as DeathRegister;
  }

  async findByMember(memberId: string): Promise<DeathRegister | null> {
    const deathRegister = await this.prisma.deathRegister.findUnique({
      where: { memberId },
      include: {
        member: true,
        branch: true,
        organisation: true,
        funeralEvent: true,
      },
    });

    return deathRegister as DeathRegister | null;
  }

  async update(
    id: string,
    updateDeathRegisterInput: UpdateDeathRegisterInput,
    userId: string,
  ): Promise<DeathRegister> {
    const existingRecord = await this.findOne(id);

    console.log('Updating death register with input:', JSON.stringify(updateDeathRegisterInput, null, 2));

    // Let Prisma handle the date conversion automatically
    const deathRegister = await this.prisma.deathRegister.update({
      where: { id },
      data: {
        ...updateDeathRegisterInput,
        lastUpdatedBy: userId,
      },
      include: {
        member: true,
        branch: true,
        organisation: true,
        funeralEvent: true,
      },
    });

    return deathRegister as DeathRegister;
  }

  async remove(id: string): Promise<boolean> {
    const existingRecord = await this.findOne(id);

    await this.prisma.deathRegister.delete({
      where: { id },
    });

    return true;
  }

  async markFamilyNotified(id: string, userId: string): Promise<DeathRegister> {
    const deathRegister = await this.prisma.deathRegister.update({
      where: { id },
      data: {
        familyNotified: true,
        notificationDate: new Date(),
        lastUpdatedBy: userId,
      },
      include: {
        member: true,
        branch: true,
        organisation: true,
        funeralEvent: true,
      },
    });

    return deathRegister as DeathRegister;
  }

  async uploadDocument(
    uploadDocumentInput: UploadDeathDocumentInput,
    userId: string,
  ): Promise<DeathRegister> {
    const existingRecord = await this.findOne(
      uploadDocumentInput.deathRegisterId,
    );

    const updateData: any = {
      lastUpdatedBy: userId,
    };

    switch (uploadDocumentInput.documentType) {
      case 'DEATH_CERTIFICATE':
        updateData.deathCertificateUrl = uploadDocumentInput.documentUrl;
        break;
      case 'OBITUARY':
        updateData.obituaryUrl = uploadDocumentInput.documentUrl;
        break;
      case 'PHOTO':
        updateData.photoUrls = {
          push: uploadDocumentInput.documentUrl,
        };
        break;
      case 'OTHER':
        updateData.additionalDocuments = {
          push: uploadDocumentInput.documentUrl,
        };
        break;
    }

    const deathRegister = await this.prisma.deathRegister.update({
      where: { id: uploadDocumentInput.deathRegisterId },
      data: updateData,
      include: {
        member: true,
        branch: true,
        organisation: true,
        funeralEvent: true,
      },
    });

    return deathRegister as DeathRegister;
  }

  async getStatistics(
    organisationId?: string,
    branchId?: string,
  ): Promise<DeathRegisterStats> {
    const where: Prisma.DeathRegisterWhereInput = {};

    if (organisationId) {
      where.organisationId = organisationId;
    }
    if (branchId) {
      where.branchId = branchId;
    }

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total deaths
    const total = await this.prisma.deathRegister.count({ where });

    // Deaths this year
    const thisYear = await this.prisma.deathRegister.count({
      where: {
        ...where,
        dateOfDeath: { gte: startOfYear },
      },
    });

    // Deaths this month
    const thisMonth = await this.prisma.deathRegister.count({
      where: {
        ...where,
        dateOfDeath: { gte: startOfMonth },
      },
    });

    // Burial vs Cremation counts
    const burialCount = await this.prisma.deathRegister.count({
      where: { ...where, burialCremation: 'BURIAL' },
    });

    const cremationCount = await this.prisma.deathRegister.count({
      where: { ...where, burialCremation: 'CREMATION' },
    });

    // Family notified count
    const familyNotifiedCount = await this.prisma.deathRegister.count({
      where: { ...where, familyNotified: true },
    });

    // Funeral services held (records with funeral events)
    const funeralServicesHeld = await this.prisma.deathRegister.count({
      where: { ...where, funeralEventId: { not: null } },
    });

    // Calculate average age at death
    const deathsWithAges = await this.prisma.deathRegister.findMany({
      where,
      include: { member: { select: { dateOfBirth: true } } },
    });

    let totalAge = 0;
    let countWithAges = 0;

    deathsWithAges.forEach((death) => {
      if (death.member.dateOfBirth) {
        const age = Math.floor(
          (death.dateOfDeath.getTime() - death.member.dateOfBirth.getTime()) /
            (365.25 * 24 * 60 * 60 * 1000),
        );
        totalAge += age;
        countWithAges++;
      }
    });

    const averageAge =
      countWithAges > 0 ? Math.round(totalAge / countWithAges) : 0;

    return {
      total,
      thisYear,
      thisMonth,
      burialCount,
      cremationCount,
      averageAge,
      familyNotifiedCount,
      funeralServicesHeld,
    };
  }

  async getMemorialCalendar(
    year: number,
    organisationId?: string,
    branchId?: string,
  ): Promise<MemorialDate[]> {
    const where: Prisma.DeathRegisterWhereInput = {};

    if (organisationId) {
      where.organisationId = organisationId;
    }
    if (branchId) {
      where.branchId = branchId;
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Get all deaths for any year but filter by month/day matching the target year
    const deathRegisters = await this.prisma.deathRegister.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: { dateOfDeath: 'asc' },
    });

    const memorialDates = deathRegisters
      .map((death) => {
        const deathDate = new Date(death.dateOfDeath);
        const currentYearDate = new Date(
          year,
          deathDate.getMonth(),
          deathDate.getDate(),
        );

        // Only include if the memorial date falls within the target year
        if (currentYearDate >= startDate && currentYearDate <= endDate) {
          const yearsAgo = year - deathDate.getFullYear();

          return {
            memberId: death.member.id,
            memberName: `${death.member.firstName} ${death.member.lastName}`,
            dateOfDeath: death.dateOfDeath,
            yearsAgo,
            photoUrl: death.member.profileImageUrl || undefined,
          } as MemorialDate;
        }
        return null;
      })
      .filter((item): item is MemorialDate => item !== null);

    return memorialDates;
  }
}
