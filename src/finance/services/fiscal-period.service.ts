import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FiscalPeriod, FiscalPeriodStatus, Prisma } from '@prisma/client';

/**
 * FiscalPeriodService
 * Manages fiscal periods and year-end closing
 * Branch-level service
 */
@Injectable()
export class FiscalPeriodService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get fiscal period
   */
  async getFiscalPeriod(
    fiscalYear: number,
    periodNumber: number,
    organisationId: string,
    branchId: string,
  ): Promise<FiscalPeriod> {
    const period = await this.prisma.fiscalPeriod.findFirst({
      where: {
        fiscalYear,
        periodNumber,
        organisationId,
        branchId,
      },
    });

    if (!period) {
      throw new NotFoundException(
        `Fiscal period ${periodNumber}/${fiscalYear} not found`,
      );
    }

    return period;
  }

  /**
   * List fiscal periods
   */
  async listFiscalPeriods(
    organisationId: string,
    branchId: string,
    fiscalYear?: number,
  ): Promise<FiscalPeriod[]> {
    const where: Prisma.FiscalPeriodWhereInput = {
      organisationId,
      branchId,
    };

    if (fiscalYear) {
      where.fiscalYear = fiscalYear;
    }

    return this.prisma.fiscalPeriod.findMany({
      where,
      orderBy: [{ fiscalYear: 'desc' }, { periodNumber: 'asc' }],
    });
  }

  /**
   * Get current fiscal period
   */
  async getCurrentFiscalPeriod(
    organisationId: string,
    branchId: string,
  ): Promise<FiscalPeriod> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    return this.getFiscalPeriod(year, month, organisationId, branchId);
  }

  /**
   * Close fiscal period
   */
  async closeFiscalPeriod(
    fiscalYear: number,
    periodNumber: number,
    organisationId: string,
    branchId: string,
    closedBy: string,
  ): Promise<FiscalPeriod> {
    // ===== VALIDATION 1: Basic Input Validation =====
    if (!organisationId || !branchId) {
      throw new BadRequestException('Organization and branch are required');
    }

    if (!closedBy) {
      throw new BadRequestException('Closed by user ID is required');
    }

    if (!fiscalYear || !periodNumber) {
      throw new BadRequestException('Fiscal year and period number are required');
    }

    // ===== VALIDATION 2: Fiscal Period Validation =====
    if (periodNumber < 1 || periodNumber > 12) {
      throw new BadRequestException('Period number must be between 1 and 12');
    }

    const currentYear = new Date().getFullYear();
    if (fiscalYear < currentYear - 10 || fiscalYear > currentYear + 1) {
      throw new BadRequestException(
        `Fiscal year must be between ${currentYear - 10} and ${currentYear + 1}`
      );
    }

    const period = await this.getFiscalPeriod(
      fiscalYear,
      periodNumber,
      organisationId,
      branchId,
    );

    // ===== VALIDATION 3: Status Validation =====
    if (period.status === 'CLOSED') {
      throw new BadRequestException('Period already closed');
    }

    if (period.status === 'LOCKED') {
      throw new BadRequestException('Cannot close locked period');
    }

    // ===== VALIDATION 4: Draft Entries Check =====
    const draftEntries = await this.prisma.journalEntry.count({
      where: {
        fiscalYear,
        fiscalPeriod: periodNumber,
        organisationId,
        branchId,
        status: 'DRAFT',
      },
    });

    if (draftEntries > 0) {
      throw new BadRequestException(
        `Cannot close period with ${draftEntries} draft journal entries. Please post or delete them first.`,
      );
    }

    // ===== VALIDATION 5: Sequential Closing Check =====
    // Ensure previous periods are closed before closing this one
    if (periodNumber > 1) {
      const previousPeriod = await this.prisma.fiscalPeriod.findFirst({
        where: {
          fiscalYear,
          periodNumber: periodNumber - 1,
          organisationId,
          branchId,
        },
      });

      if (previousPeriod && previousPeriod.status === 'OPEN') {
        throw new BadRequestException(
          `Cannot close period ${periodNumber} before closing period ${periodNumber - 1}`
        );
      }
    }

    return this.prisma.fiscalPeriod.update({
      where: { id: period.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy,
      },
    });
  }

  /**
   * Reopen fiscal period
   */
  async reopenFiscalPeriod(
    fiscalYear: number,
    periodNumber: number,
    organisationId: string,
    branchId: string,
  ): Promise<FiscalPeriod> {
    const period = await this.getFiscalPeriod(
      fiscalYear,
      periodNumber,
      organisationId,
      branchId,
    );

    if (period.status === 'LOCKED') {
      throw new BadRequestException('Cannot reopen locked period');
    }

    if (period.status === 'OPEN') {
      throw new BadRequestException('Period already open');
    }

    return this.prisma.fiscalPeriod.update({
      where: { id: period.id },
      data: {
        status: 'OPEN',
        closedAt: null,
        closedBy: null,
      },
    });
  }

  /**
   * Lock fiscal period
   * Prevents any changes (permanent)
   */
  async lockFiscalPeriod(
    fiscalYear: number,
    periodNumber: number,
    organisationId: string,
    branchId: string,
    closedBy: string,
  ): Promise<FiscalPeriod> {
    const period = await this.getFiscalPeriod(
      fiscalYear,
      periodNumber,
      organisationId,
      branchId,
    );

    if (period.status === 'LOCKED') {
      throw new BadRequestException('Period already locked');
    }

    if (period.status === 'OPEN') {
      throw new BadRequestException('Must close period before locking');
    }

    return this.prisma.fiscalPeriod.update({
      where: { id: period.id },
      data: {
        status: 'LOCKED',
        closedBy,
      },
    });
  }

  /**
   * Create fiscal periods for a year
   */
  async createFiscalYear(
    fiscalYear: number,
    organisationId: string,
    branchId: string,
  ): Promise<FiscalPeriod[]> {
    // ===== VALIDATION 1: Basic Input Validation =====
    if (!organisationId || !branchId) {
      throw new BadRequestException('Organization and branch are required');
    }

    if (!fiscalYear) {
      throw new BadRequestException('Fiscal year is required');
    }

    // ===== VALIDATION 2: Fiscal Year Validation =====
    const currentYear = new Date().getFullYear();
    if (fiscalYear < currentYear - 5 || fiscalYear > currentYear + 5) {
      throw new BadRequestException(
        `Fiscal year must be between ${currentYear - 5} and ${currentYear + 5}`
      );
    }

    // ===== VALIDATION 3: Check if Fiscal Year Already Exists =====
    const existingPeriods = await this.prisma.fiscalPeriod.count({
      where: {
        fiscalYear,
        organisationId,
        branchId,
      },
    });

    if (existingPeriods > 0) {
      throw new BadRequestException(
        `Fiscal year ${fiscalYear} already exists. Found ${existingPeriods} periods.`
      );
    }

    const periods: FiscalPeriod[] = [];

    for (let month = 1; month <= 12; month++) {
      // Check if period already exists
      const existing = await this.prisma.fiscalPeriod.findFirst({
        where: {
          fiscalYear,
          periodNumber: month,
          organisationId,
          branchId,
        },
      });

      if (!existing) {
        const startDate = new Date(fiscalYear, month - 1, 1);
        const endDate = new Date(fiscalYear, month, 0);
        const monthName = startDate.toLocaleString('default', { month: 'long' });

        const period = await this.prisma.fiscalPeriod.create({
          data: {
            fiscalYear,
            periodNumber: month,
            periodName: `${monthName} ${fiscalYear}`,
            startDate,
            endDate,
            status: 'OPEN',
            isAdjustmentPeriod: false,
            organisationId,
            branchId,
          },
        });

        periods.push(period);
      }
    }

    return periods;
  }
}
