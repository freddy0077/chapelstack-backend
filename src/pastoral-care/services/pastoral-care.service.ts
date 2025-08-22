import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PastoralVisitService } from './pastoral-visit.service';
import { CounselingSessionService } from './counseling-session.service';
import { CareRequestService } from './care-request.service';
import { FollowUpReminderService } from './follow-up-reminder.service';

interface PastoralCareStats {
  totalVisits: number;
  completedVisits: number;
  upcomingVisits: number;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  totalCareRequests: number;
  openCareRequests: number;
  resolvedCareRequests: number;
  totalReminders: number;
  pendingReminders: number;
  overdueReminders: number;
}

interface PastoralCareDashboard {
  stats: PastoralCareStats;
  upcomingVisits: any[];
  upcomingSessions: any[];
  urgentCareRequests: any[];
  dueTodayReminders: any[];
  overdueReminders: any[];
}

@Injectable()
export class PastoralCareService {
  constructor(
    private prisma: PrismaService,
    private pastoralVisitService: PastoralVisitService,
    private counselingSessionService: CounselingSessionService,
    private careRequestService: CareRequestService,
    private followUpReminderService: FollowUpReminderService,
  ) {}

  async getPastoralCareStats(
    organisationId: string,
    branchId?: string,
  ): Promise<PastoralCareStats> {
    const where = {
      organisationId,
      ...(branchId && { branchId }),
    };

    const [
      totalVisits,
      completedVisits,
      upcomingVisits,
      totalSessions,
      completedSessions,
      upcomingSessions,
      totalCareRequests,
      openCareRequests,
      resolvedCareRequests,
      totalReminders,
      pendingReminders,
      overdueReminders,
    ] = await Promise.all([
      // Pastoral Visits
      this.prisma.pastoralVisit.count({ where }),
      this.prisma.pastoralVisit.count({
        where: { ...where, status: 'COMPLETED' },
      }),
      this.prisma.pastoralVisit.count({
        where: {
          ...where,
          scheduledDate: { gte: new Date() },
          status: 'SCHEDULED',
        },
      }),

      // Counseling Sessions
      this.prisma.counselingSession.count({ where }),
      this.prisma.counselingSession.count({
        where: { ...where, status: 'COMPLETED' },
      }),
      this.prisma.counselingSession.count({
        where: {
          ...where,
          scheduledDate: { gte: new Date() },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        },
      }),

      // Care Requests
      this.prisma.careRequest.count({ where }),
      this.prisma.careRequest.count({
        where: {
          ...where,
          status: { in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'] },
        },
      }),
      this.prisma.careRequest.count({
        where: { ...where, status: 'COMPLETED' },
      }),

      // Follow-up Reminders
      this.prisma.followUpReminder.count({ where }),
      this.prisma.followUpReminder.count({
        where: { ...where, status: 'PENDING' },
      }),
      this.prisma.followUpReminder.count({
        where: {
          ...where,
          status: 'PENDING',
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    return {
      totalVisits,
      completedVisits,
      upcomingVisits,
      totalSessions,
      completedSessions,
      upcomingSessions,
      totalCareRequests,
      openCareRequests,
      resolvedCareRequests,
      totalReminders,
      pendingReminders,
      overdueReminders,
    };
  }

  async getPastoralCareDashboard(
    organisationId: string,
    branchId?: string,
  ): Promise<PastoralCareDashboard> {
    const [
      stats,
      upcomingVisits,
      upcomingSessions,
      urgentCareRequests,
      dueTodayReminders,
      overdueReminders,
    ] = await Promise.all([
      this.getPastoralCareStats(organisationId, branchId),
      this.pastoralVisitService.getUpcomingVisits(organisationId, branchId, 7),
      this.counselingSessionService.getUpcomingSessions(
        organisationId,
        branchId,
      ),
      this.careRequestService.getCareRequests(
        {
          organisationId,
          branchId,
          priority: 'HIGH',
          status: 'SUBMITTED',
        },
        0,
        10,
      ),
      this.followUpReminderService.getDueTodayReminders(
        organisationId,
        branchId,
      ),
      this.followUpReminderService.getOverdueReminders(
        organisationId,
        branchId,
      ),
    ]);

    return {
      stats,
      upcomingVisits: upcomingVisits.slice(0, 5),
      upcomingSessions: upcomingSessions.slice(0, 5),
      urgentCareRequests: urgentCareRequests.requests.slice(0, 5),
      dueTodayReminders: dueTodayReminders.slice(0, 5),
      overdueReminders: overdueReminders.slice(0, 5),
    };
  }

  async createFollowUpFromVisit(
    visitId: string,
    assignedToId: string,
    dueDate: Date,
    organisationId: string,
    branchId?: string,
    createdBy?: string,
  ): Promise<any> {
    const visit = await this.pastoralVisitService.getPastoralVisitById(
      visitId,
      organisationId,
      branchId,
    );

    // Get member details for the title
    const member = await this.prisma.member.findUnique({
      where: { id: visit.memberId },
      select: { firstName: true, lastName: true },
    });

    return this.followUpReminderService.createFollowUpFromRecord(
      'PASTORAL_VISIT',
      visit.memberId,
      visitId,
      assignedToId,
      `Follow-up for pastoral visit with ${member?.firstName} ${member?.lastName}`,
      dueDate,
      organisationId,
      branchId,
    );
  }

  async createFollowUpFromSession(
    sessionId: string,
    assignedToId: string,
    dueDate: Date,
    organisationId: string,
    branchId?: string,
    createdBy?: string,
  ): Promise<any> {
    const session =
      await this.counselingSessionService.getCounselingSessionById(
        sessionId,
        assignedToId, // Use assignedToId as userId for permission check
        organisationId,
        branchId,
      );

    // Get member details for the title
    const member = await this.prisma.member.findUnique({
      where: { id: session.primaryMemberId },
      select: { firstName: true, lastName: true },
    });

    return this.followUpReminderService.createFollowUpFromRecord(
      'COUNSELING_SESSION',
      session.primaryMemberId,
      sessionId,
      assignedToId,
      `Follow-up for counseling session with ${member?.firstName} ${member?.lastName}`,
      dueDate,
      organisationId,
      branchId,
    );
  }

  async createFollowUpFromCareRequest(
    requestId: string,
    assignedToId: string,
    dueDate: Date,
    organisationId: string,
    branchId?: string,
    createdBy?: string,
  ): Promise<any> {
    const request = await this.careRequestService.getCareRequestById(
      requestId,
      organisationId,
      branchId,
    );

    if (request.requesterId && request.assignedPastorId) {
      return this.followUpReminderService.createFollowUpFromRecord(
        'CARE_REQUEST',
        request.requesterId,
        requestId,
        request.assignedPastorId,
        `Follow-up for care request: ${request.description.substring(0, 50)}...`,
        dueDate,
        organisationId,
        branchId,
      );
    } else {
      return null;
    }
  }

  async getMemberPastoralHistory(
    memberId: string,
    organisationId: string,
    branchId?: string,
    userId?: string,
  ): Promise<{
    visits: any[];
    sessions: any[];
    careRequests: any[];
    reminders: any[];
  }> {
    const [visits, sessions, careRequests, reminders] = await Promise.all([
      this.pastoralVisitService.getPastoralVisits(
        {
          memberId,
          organisationId,
          branchId,
        },
        0,
        50,
      ),
      this.counselingSessionService.getSessionsByMember(
        memberId,
        organisationId,
        branchId,
      ),
      this.careRequestService.getCareRequests(
        {
          memberId,
          organisationId,
          branchId,
        },
        0,
        50,
      ),
      this.followUpReminderService.getFollowUpReminders(
        {
          memberId,
          organisationId,
          branchId,
        },
        0,
        50,
      ),
    ]);

    return {
      visits: visits.visits,
      sessions,
      careRequests: careRequests.requests,
      reminders: reminders.reminders,
    };
  }

  async getPastorWorkload(
    pastorId: string,
    organisationId: string,
    branchId?: string,
  ): Promise<{
    upcomingVisits: any[];
    upcomingSessions: any[];
    assignedCareRequests: any[];
    assignedReminders: any[];
    stats: {
      totalVisits: number;
      totalSessions: number;
      totalCareRequests: number;
      totalReminders: number;
    };
  }> {
    const [
      upcomingVisits,
      upcomingSessions,
      assignedCareRequests,
      assignedReminders,
    ] = await Promise.all([
      this.pastoralVisitService.getPastoralVisits(
        {
          pastorId,
          organisationId,
          branchId,
          status: 'SCHEDULED',
        },
        0,
        20,
      ),
      this.counselingSessionService.getUpcomingSessions(
        organisationId,
        branchId,
      ),
      this.careRequestService.getRequestsByPastor(
        pastorId,
        organisationId,
        branchId,
        'IN_PROGRESS',
      ),
      this.followUpReminderService.getRemindersByAssignee(
        pastorId,
        organisationId,
        branchId,
        'PENDING',
      ),
    ]);

    return {
      upcomingVisits: upcomingVisits.visits,
      upcomingSessions,
      assignedCareRequests,
      assignedReminders,
      stats: {
        totalVisits: upcomingVisits.total,
        totalSessions: upcomingSessions.length,
        totalCareRequests: assignedCareRequests.length,
        totalReminders: assignedReminders.length,
      },
    };
  }

  async getRecentActivity(
    organisationId: string,
    branchId?: string,
    days = 7,
  ): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [recentVisits, recentSessions, recentRequests, recentReminders] =
      await Promise.all([
        this.prisma.pastoralVisit.findMany({
          where: {
            organisationId,
            ...(branchId && { branchId }),
            createdAt: { gte: startDate },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            member: { select: { firstName: true, lastName: true } },
            pastor: { select: { firstName: true, lastName: true } },
          },
        }),
        this.prisma.counselingSession.findMany({
          where: {
            organisationId,
            ...(branchId && { branchId }),
            createdAt: { gte: startDate },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            primaryMember: { select: { firstName: true, lastName: true } },
            counselor: { select: { firstName: true, lastName: true } },
          },
        }),
        this.prisma.careRequest.findMany({
          where: {
            organisationId,
            ...(branchId && { branchId }),
            createdAt: { gte: startDate },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            requester: { select: { firstName: true, lastName: true } },
            assignedPastor: { select: { firstName: true, lastName: true } },
          },
        }),
        this.prisma.followUpReminder.findMany({
          where: {
            organisationId,
            ...(branchId && { branchId }),
            createdAt: { gte: startDate },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            member: { select: { firstName: true, lastName: true } },
            assignedTo: { select: { firstName: true, lastName: true } },
          },
        }),
      ]);

    // Combine and sort all activities by creation date
    const allActivities = [
      ...recentVisits.map((v) => ({ ...v, type: 'PASTORAL_VISIT' })),
      ...recentSessions.map((s) => ({ ...s, type: 'COUNSELING_SESSION' })),
      ...recentRequests.map((r) => ({ ...r, type: 'CARE_REQUEST' })),
      ...recentReminders.map((r) => ({ ...r, type: 'FOLLOW_UP_REMINDER' })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Create follow-ups for counseling sessions
    for (const session of recentSessions) {
      const member = await this.prisma.member.findUnique({
        where: { id: session.primaryMemberId },
      });

      await this.followUpReminderService.createFollowUpFromRecord(
        'COUNSELING_SESSION',
        session.primaryMemberId,
        session.id,
        session.counselorId,
        `Follow-up for counseling session: ${session.title}`,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        organisationId,
        branchId,
      );
    }

    // Create follow-ups for care requests
    for (const request of recentRequests) {
      if (request.requesterId && request.assignedPastorId) {
        await this.followUpReminderService.createFollowUpFromRecord(
          'CARE_REQUEST',
          request.requesterId,
          request.id,
          request.assignedPastorId,
          `Follow-up for care request: ${request.description.substring(0, 50)}...`,
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          organisationId,
          branchId,
        );
      }
    }

    return allActivities.slice(0, 20);
  }
}
