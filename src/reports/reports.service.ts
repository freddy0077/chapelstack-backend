import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReportTemplateInput,
  UpdateReportTemplateInput,
  ExecuteReportInput,
  CreateScheduledReportInput,
  ReportCategory,
  ExportFormat,
} from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== Report Templates ====================

  async createTemplate(input: CreateReportTemplateInput, userId: string) {
    return this.prisma.reportTemplate.create({
      data: {
        name: input.name,
        description: input.description,
        category: input.category,
        filters: input.filters,
        metrics: input.metrics,
        columns: input.columns,
        createdBy: userId,
        organisationId: input.organisationId,
        branchId: input.branchId,
        isPublic: input.isPublic || false,
      },
    });
  }

  async getTemplates(
    organisationId: string,
    branchId?: string,
    category?: ReportCategory,
  ) {
    return this.prisma.reportTemplate.findMany({
      where: {
        organisationId,
        ...(branchId && { branchId }),
        ...(category && { category }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTemplateById(id: string) {
    const template = await this.prisma.reportTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Report template with ID ${id} not found`);
    }

    return template;
  }

  async updateTemplate(id: string, input: UpdateReportTemplateInput) {
    const template = await this.prisma.reportTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Report template with ID ${id} not found`);
    }

    return this.prisma.reportTemplate.update({
      where: { id },
      data: input,
    });
  }

  async deleteTemplate(id: string) {
    const template = await this.prisma.reportTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Report template with ID ${id} not found`);
    }

    return this.prisma.reportTemplate.delete({ where: { id } });
  }

  // ==================== Report Execution ====================

  async executeReport(input: any, userId: string) {
    // Extract filters from input (already parsed by resolver)
    const filters = input.filters || {};

    // Execute report based on category
    let results: any;
    let summary: any;

    switch (input.category) {
      case ReportCategory.ATTENDANCE:
        ({ results, summary } = await this.executeAttendanceReport({ ...input, filters }));
        break;
      case ReportCategory.MEMBERSHIP:
        ({ results, summary } = await this.executeMembershipReport({ ...input, filters }));
        break;
      case ReportCategory.FINANCE:
        ({ results, summary } = await this.executeFinanceReport({ ...input, filters }));
        break;
      case ReportCategory.BIRTH_REGISTER:
        ({ results, summary } = await this.executeBirthRegisterReport({ ...input, filters }));
        break;
      case ReportCategory.DEATH_REGISTER:
        ({ results, summary } = await this.executeDeathRegisterReport({ ...input, filters }));
        break;
      case ReportCategory.SACRAMENTS:
        ({ results, summary } = await this.executeSacramentsReport({ ...input, filters }));
        break;
      case ReportCategory.ZONES:
        ({ results, summary } = await this.executeZonesReport({ ...input, filters }));
        break;
      case ReportCategory.EVENTS:
        ({ results, summary } = await this.executeEventsReport({ ...input, filters }));
        break;
      case ReportCategory.GROUPS:
        ({ results, summary } = await this.executeGroupsReport({ ...input, filters }));
        break;
      default:
        throw new Error(`Unsupported report category: ${input.category}`);
    }

    // Save execution record
    const execution = await this.prisma.reportExecution.create({
      data: {
        templateId: input.templateId,
        category: input.category,
        filters,
        results,
        summary,
        executedBy: userId,
        organisationId: input.organisationId,
        branchId: input.branchId,
      },
    });

    return {
      summary: {
        totalRecords: results.length,
        metrics: summary,
      },
      data: results,
      execution: {
        id: execution.id,
        category: execution.category as any,
        filters: execution.filters,
        executedAt: execution.executedAt,
        executedBy: execution.executedBy,
        organisationId: execution.organisationId,
        branchId: execution.branchId,
        templateId: execution.templateId,
        results: execution.results,
        summary: execution.summary,
      },
    };
  }

  async getReportHistory(
    organisationId: string,
    branchId?: string,
    category?: ReportCategory,
  ) {
    return this.prisma.reportExecution.findMany({
      where: {
        organisationId,
        ...(branchId && { branchId }),
        ...(category && { category }),
      },
      orderBy: { executedAt: 'desc' },
      take: 50,
    });
  }

  async getReportExecutionById(id: string) {
    const execution = await this.prisma.reportExecution.findUnique({
      where: { id },
    });

    if (!execution) {
      throw new NotFoundException(`Report execution with ID ${id} not found`);
    }

    return execution;
  }

  // ==================== Report Generation Methods ====================

  private async executeAttendanceReport(input: any) {
    const { organisationId, branchId } = input;
    const filters = input.filters || {};

    // Build where clause based on filters
    const where: any = {
      organisationId,
      ...(branchId && { branchId }),
    };

    // Apply date range filter with proper date boundaries
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      where.checkInTime = {
        gte: startDate,
        lte: endDate,
      };
    } else if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      where.checkInTime = { gte: startDate };
    } else if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      where.checkInTime = { lte: endDate };
    }

    // Apply time range filter
    if (filters.startTime && filters.endTime) {
      // If both start and end time are provided, we need to filter by time of day
      // This will be done in post-processing since Prisma doesn't support time-only filters
    }

    // Apply attendance status filter
    if (filters.attendanceStatus && filters.attendanceStatus !== 'ALL') {
      where.status = filters.attendanceStatus;
    }

    // Build member filter
    const memberWhere: any = {};
    
    if (filters.gender && filters.gender !== 'ALL') {
      memberWhere.gender = filters.gender;
    }

    if (filters.membershipType && filters.membershipType !== 'ALL') {
      memberWhere.membershipType = filters.membershipType;
    }

    if (filters.membershipStatus && filters.membershipStatus !== 'ALL') {
      memberWhere.membershipStatus = filters.membershipStatus;
    }

    if (filters.zoneId && filters.zoneId !== 'ALL') {
      memberWhere.zoneId = filters.zoneId;
    }

    if (filters.ageGroup && filters.ageGroup !== 'ALL') {
      // Calculate age range based on age group
      const now = new Date();
      let minAge = 0;
      let maxAge = 150;
      
      switch (filters.ageGroup) {
        case 'CHILDREN':
          minAge = 0;
          maxAge = 12;
          break;
        case 'YOUTH':
          minAge = 13;
          maxAge = 24;
          break;
        case 'ADULTS':
          minAge = 25;
          maxAge = 59;
          break;
        case 'SENIORS':
          minAge = 60;
          maxAge = 150;
          break;
      }
      
      const maxBirthDate = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
      const minBirthDate = new Date(now.getFullYear() - maxAge - 1, now.getMonth(), now.getDate());
      
      memberWhere.dateOfBirth = {
        gte: minBirthDate,
        lte: maxBirthDate,
      };
    }

    // Add member filter to where clause if any member filters exist
    if (Object.keys(memberWhere).length > 0) {
      where.member = memberWhere;
    }

    // Fetch attendance records
    let attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            gender: true,
            dateOfBirth: true,
            membershipType: true,
            membershipStatus: true,
            zoneId: true,
            zone: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        session: {
          select: {
            id: true,
            name: true,
            date: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
          },
        },
      },
      orderBy: {
        checkInTime: 'desc',
      },
    });

    // Post-process for time range filter
    if (filters.startTime && filters.endTime) {
      attendanceRecords = attendanceRecords.filter((record) => {
        if (!record.checkInTime) return false;
        
        const checkInTime = new Date(record.checkInTime);
        const hours = checkInTime.getHours();
        const minutes = checkInTime.getMinutes();
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        return timeString >= filters.startTime && timeString <= filters.endTime;
      });
    } else if (filters.startTime) {
      attendanceRecords = attendanceRecords.filter((record) => {
        if (!record.checkInTime) return false;
        
        const checkInTime = new Date(record.checkInTime);
        const hours = checkInTime.getHours();
        const minutes = checkInTime.getMinutes();
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        return timeString >= filters.startTime;
      });
    } else if (filters.endTime) {
      attendanceRecords = attendanceRecords.filter((record) => {
        if (!record.checkInTime) return false;
        
        const checkInTime = new Date(record.checkInTime);
        const hours = checkInTime.getHours();
        const minutes = checkInTime.getMinutes();
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        return timeString <= filters.endTime;
      });
    }

    // Calculate metrics
    const totalRecords = attendanceRecords.length;
    const uniqueMembers = new Set(attendanceRecords.map((r) => r.memberId))
      .size;

    const events = new Set(
      attendanceRecords.filter((r) => r.eventId).map((r) => r.eventId),
    ).size;

    const maleCount = attendanceRecords.filter(
      (r: any) => r.member?.gender === 'MALE',
    ).length;
    const femaleCount = attendanceRecords.filter(
      (r: any) => r.member?.gender === 'FEMALE',
    ).length;

    // Group by zone
    const byZone = attendanceRecords.reduce(
      (acc, record: any) => {
        const zoneName = record.member?.zone?.name || 'Unassigned';
        acc[zoneName] = (acc[zoneName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const summary = {
      totalRecords,
      totalSessions: 0,
      totalEvents: events,
      uniqueMembers,
      averageSessionAttendance: 0,
      averageEventAttendance: events > 0 ? totalRecords / events : 0,
      maleCount,
      femaleCount,
      byZone,
    };

    return {
      results: attendanceRecords,
      summary,
    };
  }

  private async executeMembershipReport(input: any) {
    const { organisationId, branchId } = input;
    const filters = input.filters || {};

    const where: any = {
      organisationId,
      ...(branchId && { branchId }),
    };

    // Apply filters
    if (filters.membershipType && filters.membershipType !== 'ALL') {
      where.membershipType = filters.membershipType;
    }

    if (filters.membershipStatus && filters.membershipStatus !== 'ALL') {
      where.membershipStatus = filters.membershipStatus;
    }

    if (filters.gender && filters.gender !== 'ALL') {
      where.gender = filters.gender;
    }

    if (filters.zoneId && filters.zoneId !== 'ALL') {
      where.zoneId = filters.zoneId;
    }

    const members = await this.prisma.member.findMany({
      where,
      include: {
        zone: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate metrics
    const totalRecords = members.length;
    const uniqueMembers = new Set(members.map((m) => m.id)).size;

    const maleCount = members.filter((m) => m.gender === 'MALE').length;
    const femaleCount = members.filter((m) => m.gender === 'FEMALE').length;

    const byZone = members.reduce(
      (acc, member) => {
        const zoneName = member.zone?.name || 'Unassigned';
        acc[zoneName] = (acc[zoneName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byType = members.reduce(
      (acc, member) => {
        const type = member.membershipType || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byStatus = members.reduce(
      (acc, member) => {
        const status = member.membershipStatus || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalMembers = members.length;
    const activeMembers = members.filter(
      (m) => m.membershipStatus === 'ACTIVE_MEMBER',
    ).length;

    const summary = {
      totalMembers,
      activeMembers,
      maleCount,
      femaleCount,
      byZone,
      byType,
      byStatus,
    };

    return {
      results: members,
      summary,
    };
  }

  private async executeFinanceReport(input: any) {
    const { organisationId, branchId } = input;
    const filters = input.filters || {};

    const where: any = {
      organisationId,
      ...(branchId && { branchId }),
    };

    if (filters.startDate || filters.endDate) {
      where.transactionDate = {};
      if (filters.startDate)
        where.transactionDate.gte = new Date(filters.startDate);
      if (filters.endDate)
        where.transactionDate.lte = new Date(filters.endDate);
    }

    if (filters.transactionType && filters.transactionType !== 'ALL') {
      where.transactionType = filters.transactionType;
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        fund: true,
      },
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'CONTRIBUTION')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'TRANSFER' || t.type === 'FUND_ALLOCATION')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const summary = {
      totalTransactions: transactions.length,
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
    };

    return {
      results: transactions,
      summary,
    };
  }

  private async executeBirthRegisterReport(input: any) {
    const { organisationId, branchId } = input;
    const filters = input.filters || {};

    const where: any = {
      organisationId,
      ...(branchId && { branchId }),
    };

    if (filters.startDate || filters.endDate) {
      where.birthDate = {};
      if (filters.startDate) where.birthDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.birthDate.lte = new Date(filters.endDate);
    }

    if (filters.gender && filters.gender !== 'ALL') {
      where.gender = filters.gender;
    }

    const births = await this.prisma.birthRegistry.findMany({
      where,
    });

    const maleCount = births.filter((b) => b.childGender === 'MALE').length;
    const femaleCount = births.filter((b) => b.childGender === 'FEMALE').length;

    const summary = {
      totalBirths: births.length,
      maleCount,
      femaleCount,
    };

    return {
      results: births,
      summary,
    };
  }

  private async executeDeathRegisterReport(input: any) {
    const { organisationId, branchId } = input;
    const filters = input.filters || {};

    const where: any = {
      organisationId,
      ...(branchId && { branchId }),
    };

    if (filters.startDate || filters.endDate) {
      where.deathDate = {};
      if (filters.startDate) where.deathDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.deathDate.lte = new Date(filters.endDate);
    }

    if (filters.gender && filters.gender !== 'ALL') {
      where.gender = filters.gender;
    }

    const deaths = await this.prisma.deathRegister.findMany({
      where,
      include: {
        member: {
          select: {
            gender: true,
          },
        },
      },
    });

    const maleCount = deaths.filter((d) => d.member?.gender === 'MALE').length;
    const femaleCount = deaths.filter(
      (d) => d.member?.gender === 'FEMALE',
    ).length;

    const summary = {
      totalDeaths: deaths.length,
      maleCount,
      femaleCount,
    };

    return {
      results: deaths,
      summary,
    };
  }

  private async executeSacramentsReport(input: any) {
    const { organisationId, branchId } = input;
    const filters = input.filters || {};

    const where: any = {
      organisationId,
      ...(branchId && { branchId }),
    };

    if (filters.startDate || filters.endDate) {
      where.sacramentDate = {};
      if (filters.startDate)
        where.sacramentDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.sacramentDate.lte = new Date(filters.endDate);
    }

    if (filters.sacramentType && filters.sacramentType !== 'ALL') {
      where.sacramentType = filters.sacramentType;
    }

    const sacraments = await this.prisma.sacramentalRecord.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            gender: true,
          },
        },
      },
    });

    const withCertificate = sacraments.filter(
      (s) => s.certificateNumber !== null,
    ).length;
    const withoutCertificate = sacraments.filter(
      (s) => s.certificateNumber === null,
    ).length;

    const summary = {
      totalSacraments: sacraments.length,
      withCertificate,
      withoutCertificate,
    };

    return {
      results: sacraments,
      summary,
    };
  }

  private async executeZonesReport(input: any) {
    const { organisationId, branchId } = input;
    const filters = input.filters || {};

    // Base where clause
    const where: any = {
      organisationId,
      ...(branchId && { branchId }),
    };

    // Apply simple filters
    if (filters.zoneId && filters.zoneId !== 'ALL') {
      where.id = filters.zoneId;
    }
    if (filters.zoneStatus && filters.zoneStatus !== 'ALL') {
      where.status = filters.zoneStatus;
    }
    if (filters.location) {
      where.location = { contains: String(filters.location), mode: 'insensitive' };
    }

    // Fetch zones with members count
    const zones = await this.prisma.zone.findMany({
      where,
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Filter by member count range, if provided
    let filteredZones = zones;
    if (filters.minMembers || filters.maxMembers) {
      filteredZones = zones.filter((z: any) => {
        const count = z._count.members || 0;
        if (filters.minMembers && count < parseInt(filters.minMembers)) return false;
        if (filters.maxMembers && count > parseInt(filters.maxMembers)) return false;
        return true;
      });
    }

    // Compute summary metrics
    const totalZones = filteredZones.length;
    const totalMembers = filteredZones.reduce((sum: number, z: any) => sum + (z._count.members || 0), 0);
    const averageZoneSize = totalZones > 0 ? Math.round(totalMembers / totalZones) : 0;
    const activeZones = filteredZones.filter((z: any) => z.status === 'ACTIVE').length;
    const inactiveZones = filteredZones.filter((z: any) => z.status === 'INACTIVE').length;
    const largestZone = filteredZones.length > 0 ? Math.max(...filteredZones.map((z: any) => z._count.members || 0)) : 0;

    const summary = {
      totalZones,
      totalMembers,
      averageZoneSize,
      activeZones,
      inactiveZones,
      largestZone,
    };

    // Format results to align with frontend columns
    const results = filteredZones.map((z: any) => ({
      id: z.id,
      name: z.name,
      location: z.location,
      memberCount: z._count.members || 0,
      leaderName: z.leaderName || null,
      leaderPhone: z.leaderPhone || null,
      status: z.status,
      description: z.description,
    }));

    return {
      results,
      summary,
    };
  }

  // ==================== Helper Methods ====================

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  private isInAgeGroup(age: number, ageGroup: string): boolean {
    switch (ageGroup) {
      case 'CHILDREN':
        return age < 13;
      case 'YOUTH':
        return age >= 13 && age < 25;
      case 'ADULTS':
        return age >= 25 && age < 60;
      case 'SENIORS':
        return age >= 60;
      default:
        return true;
    }
  }

  private async executeEventsReport(input: any) {
    const { organisationId, branchId } = input;
    const filters = input.filters || {};
    // Debug: verify filters reaching here
    try { console.debug('executeEventsReport filters keys:', Object.keys(filters)); } catch {}

    const where: any = {
      organisationId,
      ...(branchId && { branchId }),
    };

    // Apply date range filter (inclusive day boundaries)
    if (filters.startDate || filters.endDate) {
      where.startDate = {};
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        where.startDate.gte = start;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.startDate.lte = end;
      }
    }

    // Apply event type filter
    if (filters.eventType && filters.eventType !== 'ALL') {
      where.eventType = filters.eventType;
    }

    // Apply event status filter
    if (filters.eventStatus && filters.eventStatus !== 'ALL') {
      where.status = filters.eventStatus;
    }

    const events = await this.prisma.event.findMany({
      where,
      include: {
        _count: {
          select: { 
            attendanceRecords: true,
            eventRegistrations: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    // Apply statusRange (time-based status) if provided
    // - UPCOMING: startDate > now and not CANCELLED
    // - ONGOING: startDate <= now and (endDate >= now if provided) and not CANCELLED
    // - COMPLETED: status === 'COMPLETED' OR (startDate < now and not CANCELLED)
    let filteredEvents = events;
    if (filters.statusRange) {
      const now = new Date();
      filteredEvents = events.filter((e: any) => {
        const start = e.startDate ? new Date(e.startDate) : null;
        const end = e.endDate ? new Date(e.endDate) : null;
        const notCancelled = e.status !== 'CANCELLED';

        switch (filters.statusRange) {
          case 'UPCOMING':
            return !!start && start > now && notCancelled;
          case 'ONGOING':
            if (!start) return false;
            // If end date exists, ensure now is between start and end; otherwise assume same-day ongoing when start is today
            if (end) return start <= now && end >= now && notCancelled;
            // Fallback: treat events starting today as ongoing if not cancelled
            const sameDay = start.toDateString() === now.toDateString();
            return start <= now && sameDay && notCancelled;
          case 'COMPLETED':
            return e.status === 'COMPLETED' || (!!start && start < now && notCancelled);
          default:
            return true;
        }
      });
    }

    // Filter by attendance range if specified
    if (filters.minAttendance || filters.maxAttendance) {
      filteredEvents = filteredEvents.filter((event) => {
        const count = event._count.attendanceRecords + event._count.eventRegistrations;
        if (filters.minAttendance && count < parseInt(filters.minAttendance)) return false;
        if (filters.maxAttendance && count > parseInt(filters.maxAttendance)) return false;
        return true;
      });
    }

    // Calculate summary statistics
    const totalEvents = filteredEvents.length;
    const totalAttendance = filteredEvents.reduce(
      (sum, event) => sum + event._count.attendanceRecords + event._count.eventRegistrations, 
      0
    );
    const averageAttendance = totalEvents > 0 ? Math.round(totalAttendance / totalEvents) : 0;

    const now = new Date();
    const upcomingEvents = filteredEvents.filter(
      (e) => e.startDate > now && e.status !== 'CANCELLED'
    ).length;
    const completedEvents = filteredEvents.filter(
      (e) => e.status === 'COMPLETED' || (e.startDate < now && e.status !== 'CANCELLED')
    ).length;
    const cancelledEvents = filteredEvents.filter((e) => e.status === 'CANCELLED').length;

    const summary = {
      totalEvents,
      totalAttendance,
      averageAttendance,
      upcomingEvents,
      completedEvents,
      cancelledEvents,
    };

    // Format results
    const results = filteredEvents.map((event) => ({
      id: event.id,
      name: event.title,
      eventType: event.eventType,
      eventDate: event.startDate,
      location: event.location,
      attendanceCount: event._count.attendanceRecords + event._count.eventRegistrations,
      status: event.status,
      description: event.description,
    }));

    return {
      results,
      summary,
    };
  }

  private async executeGroupsReport(input: any) {
    const { organisationId, branchId } = input;
    const filters = input.filters || {};

    const where: any = {
      organisationId,
      ...(branchId && { branchId }),
    };

    // Apply group type filter
    if (filters.groupType && filters.groupType !== 'ALL') {
      where.type = filters.groupType;
    }

    // Apply group status filter
    if (filters.groupStatus && filters.groupStatus !== 'ALL') {
      where.status = filters.groupStatus;
    }

    const groups = await this.prisma.smallGroup.findMany({
      where,
      include: {
        _count: {
          select: { members: true },
        },
        members: {
          where: { role: 'LEADER' },
          take: 1,
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Filter by member count range if specified
    let filteredGroups = groups;
    if (filters.minMembers || filters.maxMembers) {
      filteredGroups = groups.filter((group) => {
        const count = group._count.members;
        if (filters.minMembers && count < parseInt(filters.minMembers)) return false;
        if (filters.maxMembers && count > parseInt(filters.maxMembers)) return false;
        return true;
      });
    }

    // Calculate summary statistics
    const totalGroups = filteredGroups.length;
    const totalMembers = filteredGroups.reduce((sum, group) => sum + group._count.members, 0);
    const averageGroupSize = totalGroups > 0 ? Math.round(totalMembers / totalGroups) : 0;
    const activeGroups = filteredGroups.filter((g) => g.status === 'ACTIVE').length;
    const inactiveGroups = filteredGroups.filter((g) => g.status === 'INACTIVE').length;
    const largestGroup = filteredGroups.length > 0 
      ? Math.max(...filteredGroups.map((g) => g._count.members)) 
      : 0;

    const summary = {
      totalGroups,
      totalMembers,
      averageGroupSize,
      activeGroups,
      inactiveGroups,
      largestGroup,
    };

    // Format results
    const results = filteredGroups.map((group) => ({
      id: group.id,
      name: group.name,
      groupType: group.type,
      memberCount: group._count.members,
      leader: group.members[0]?.member 
        ? `${group.members[0].member.firstName} ${group.members[0].member.lastName}` 
        : 'No Leader',
      meetingFrequency: group.meetingSchedule || 'Not Set',
      status: group.status,
      description: group.description,
    }));

    return {
      results,
      summary,
    };
  }

  // ==================== Scheduled Reports ====================

  async createScheduledReport(
    input: CreateScheduledReportInput,
    userId: string,
  ) {
    const nextRunDate = this.calculateNextRunDate(input.frequency);

    const scheduled = await this.prisma.scheduledReport.create({
      data: {
        name: input.name,
        description: input.description,
        templateId: input.templateId,
        category: input.category,
        filters: input.filters,
        reportType: input.category, // For legacy compatibility
        frequency: input.frequency,
        recipientEmails: input.recipients,
        nextRunAt: nextRunDate,
        outputFormat: 'PDF',
        organisationId: input.organisationId,
        branchId: input.branchId,
        createdById: userId,
      },
    });

    // Map to DTO format
    return {
      ...scheduled,
      recipients: scheduled.recipientEmails || [],
      nextRunDate: scheduled.nextRunAt,
      lastRunDate: scheduled.lastRunAt,
      createdBy: scheduled.createdById,
    };
  }

  async getScheduledReports(organisationId: string, branchId?: string) {
    const scheduled = await this.prisma.scheduledReport.findMany({
      where: {
        organisationId,
        ...(branchId && { branchId }),
      },
      orderBy: { nextRunAt: 'asc' },
    });

    // Map to DTO format
    return scheduled.map((s) => ({
      ...s,
      recipients: s.recipientEmails || [],
      nextRunDate: s.nextRunAt,
      lastRunDate: s.lastRunAt,
      createdBy: s.createdById,
    }));
  }

  private calculateNextRunDate(frequency: string): Date {
    const now = new Date();
    switch (frequency) {
      case 'DAILY':
        return new Date(now.setDate(now.getDate() + 1));
      case 'WEEKLY':
        return new Date(now.setDate(now.getDate() + 7));
      case 'MONTHLY':
        return new Date(now.setMonth(now.getMonth() + 1));
      case 'QUARTERLY':
        return new Date(now.setMonth(now.getMonth() + 3));
      case 'YEARLY':
        return new Date(now.setFullYear(now.getFullYear() + 1));
      default:
        return new Date(now.setDate(now.getDate() + 1));
    }
  }
}
