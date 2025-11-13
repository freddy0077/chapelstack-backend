import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AnnouncementItem,
  AnnouncementsWidget,
  DashboardData,
  DashboardType,
  EventItem,
  KpiCard,
  ChartData,
  NotificationItem,
  NotificationsWidget,
  QuickLinkItem,
  QuickLinksWidget,
  UpcomingEventsWidget,
  WidgetType,
  MinistryInvolvementWidget,
  RecentSacramentsWidget,
  PrayerRequestSummaryWidget,
} from '../entities/dashboard-data.entity';
import { UserDashboardPreference } from '../entities/user-dashboard-preference.entity';
import { MemberReportsService } from './member-reports.service';
import { AttendanceReportsService } from './attendance-reports.service';
import { FinancialReportsService } from './financial-reports.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly memberReportsService: MemberReportsService,
    private readonly attendanceReportsService: AttendanceReportsService,
    private readonly financialReportsService: FinancialReportsService,
  ) {}

  async getDashboardData(
    userId: string,
    dashboardType: DashboardType,
    branchId?: string,
    organisationId?: string,
  ): Promise<DashboardData> {
    const preference = await this.getUserDashboardPreference(
      userId,
      dashboardType,
      branchId,
      organisationId,
    );

    const resolvedBranchId = branchId || preference?.branchId;
    if (!resolvedBranchId && !organisationId) {
      throw new Error(
        'Either Branch ID or Organisation ID is required to fetch dashboard data.',
      );
    }

    const resolvedDashboardType =
      dashboardType || preference?.dashboardType || DashboardType.MEMBER;

    const dashboardData: DashboardData = {
      ...(resolvedBranchId
        ? { branchId: resolvedBranchId, branchName: 'Main Branch' }
        : {}),
      organisationId,
      dashboardType: resolvedDashboardType,
      generatedAt: new Date(),
      widgets: [],
      layout: preference?.layoutConfig || { lg: [] },
    };

    // Populate widgets based on dashboard type
    if (
      resolvedDashboardType === DashboardType.ADMIN ||
      resolvedDashboardType === DashboardType.SYSTEM_ADMIN
    ) {
      const adminWidgets = await Promise.all([
        this.getMemberDemographicsWidget(resolvedBranchId, organisationId),
        this.getMinistryInvolvementWidget(resolvedBranchId, organisationId),
        this.getRecentSacramentsWidget(resolvedBranchId, organisationId),
        this.getPrayerRequestSummaryWidget(resolvedBranchId, organisationId),
        this.getContributionsWidget(resolvedBranchId, organisationId),
        this.getBudgetVsActualWidget(resolvedBranchId, organisationId),
        await this.getFinancialSummaryWidget(resolvedBranchId, organisationId),
        // --- SUPER ADMIN: Add new transaction-based widgets ---
        ...(resolvedDashboardType === DashboardType.ADMIN
          ? [
              await this.getTransactionSummaryWidget(undefined, organisationId),
              await this.getTopGivingBranchesWidget(organisationId),
            ]
          : []),
      ]);
      dashboardData.widgets?.push(...adminWidgets);
    } else if (resolvedDashboardType === DashboardType.PASTORAL) {
      const pastoralWidgets = await Promise.all([
        this.getTotalMembersWidget(resolvedBranchId, organisationId),
        this.getAttendanceTrendWidget(resolvedBranchId, organisationId),
      ]);
      dashboardData.widgets?.push(...pastoralWidgets);
    } else if (resolvedDashboardType === DashboardType.FINANCE) {
      const financeWidgets = await Promise.all([
        this.getContributionsWidget(resolvedBranchId, organisationId),
        this.getBudgetVsActualWidget(resolvedBranchId, organisationId),
        await this.getFinancialSummaryWidget(resolvedBranchId, organisationId),
      ]);
      dashboardData.widgets?.push(...financeWidgets);
    } else if (resolvedDashboardType === DashboardType.MINISTRY) {
      dashboardData.widgets?.push(await this.getGroupAttendanceWidget());
    } else if (resolvedDashboardType === DashboardType.MEMBER) {
      const memberWidgets = await Promise.all([
        this.getMyGivingWidget(),
        this.getAnnouncementsWidget(),
        this.getQuickLinksWidget(),
        this.getUpcomingEventsWidget(),
        this.getNotificationsWidget(),
      ]);
      dashboardData.widgets?.push(...memberWidgets);
    }

    if (!preference && dashboardData.widgets.length > 0) {
      const newLayout = this.generateDefaultLayout(dashboardData.widgets);
      dashboardData.layout = newLayout;

      // Save the new preference for the user
      if (resolvedBranchId) {
        await this.createOrUpdateUserDashboardPreference(
          userId,
          resolvedDashboardType,
          newLayout,
          resolvedBranchId,
          organisationId,
        );
      }
    }

    return dashboardData;
  }

  private async getAnnouncementsWidget(): Promise<AnnouncementsWidget> {
    // Since there's no dedicated Announcement model in the schema,
    // we'll use Events with a recent date as announcements
    const events = await this.prisma.event.findMany({
      where: {
        startDate: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Events from the last 30 days
        },
      },
      orderBy: { startDate: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      title: 'Announcements',
      widgetType: WidgetType.ANNOUNCEMENTS,
      announcements: events.map((event) => ({
        id: event.id,
        title: event.title || 'Upcoming Event',
        content: event.description || 'No description available',
        date: event.startDate,
        author: event.creator
          ? `${event.creator.firstName || ''} ${event.creator.lastName || ''}`.trim() ||
            'Church Admin'
          : 'Church Admin',
      })),
    };
  }

  private async getQuickLinksWidget(): Promise<QuickLinksWidget> {
    // Fetch quick links from settings or a dedicated table
    const quickLinks = await this.prisma.setting.findMany({
      where: {
        key: { startsWith: 'quickLink.' },
      },
      orderBy: { key: 'asc' },
      take: 5,
    });

    // If no quick links are configured, provide some default ones
    const defaultLinks = [
      {
        title: 'Sermon Notes',
        url: '/sermons',
        icon: 'book-outline',
      },
      {
        title: 'Give Online',
        url: '/giving',
        icon: 'cash-outline',
      },
      {
        title: 'Events Calendar',
        url: '/events',
        icon: 'calendar-outline',
      },
    ];

    const links: QuickLinkItem[] =
      quickLinks.length > 0
        ? quickLinks.map((setting) => {
            try {
              const linkData = JSON.parse(setting.value);
              return {
                title: linkData.title || 'Link',
                url: linkData.url || '#',
                icon: linkData.icon || 'link-outline',
              };
            } catch (e) {
              return {
                title: 'Link',
                url: '#',
                icon: 'link-outline',
              };
            }
          })
        : defaultLinks;

    return {
      title: 'Quick Links',
      widgetType: WidgetType.QUICK_LINKS,
      links,
    };
  }

  async getGroupAttendanceWidget(): Promise<ChartData> {
    // Get real group attendance data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const groups = await this.prisma.smallGroup.findMany({
      select: {
        id: true,
        name: true,
      },
      take: 5, // Limit to 5 groups for the chart
      orderBy: {
        name: 'asc',
      },
    });

    const groupAttendance = await Promise.all(
      groups.map(async (group) => {
        const groupMembers = await this.prisma.groupMember.findMany({
          where: { smallGroupId: group.id, status: 'ACTIVE' },
          select: { memberId: true },
        });
        const memberIds = groupMembers.map((gm) => gm.memberId);

        if (memberIds.length === 0) {
          return {
            name: group.name,
            attendanceCount: 0,
          };
        }

        const attendanceCount = await this.prisma.attendanceRecord.count({
          where: {
            memberId: { in: memberIds },
            checkInTime: { gte: thirtyDaysAgo },
          },
        });

        return {
          name: group.name,
          attendanceCount,
        };
      }),
    );

    const labels = groupAttendance.map((group) => group.name);
    const data = groupAttendance.map((group) => group.attendanceCount);

    return {
      widgetType: WidgetType.CHART,
      chartType: 'pie',
      title: 'Group Attendance (Last 30 Days)',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
          },
        ],
      },
    };
  }

  private async getUpcomingEventsWidget(): Promise<UpcomingEventsWidget> {
    // Fetch real upcoming events from the database
    const now = new Date();
    const events = await this.prisma.event.findMany({
      where: {
        startDate: {
          gte: now,
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      take: 5,
      select: {
        id: true,
        title: true,
        startDate: true,
        location: true,
      },
    });

    return {
      title: 'Upcoming Events',
      widgetType: WidgetType.UPCOMING_EVENTS,
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        location: event.location || 'Main Campus',
      })),
    };
  }

  private async getNotificationsWidget(): Promise<NotificationsWidget> {
    // Fetch real notifications from the database
    const notifications = await this.prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        message: true,
        createdAt: true,
        type: true,
        isRead: true,
      },
    });

    return {
      title: 'Notifications',
      widgetType: WidgetType.NOTIFICATIONS,
      notifications: notifications.map((notification) => ({
        id: notification.id,
        message: notification.message,
        date: notification.createdAt,
        type: notification.type,
        read: notification.isRead,
      })),
    };
  }

  private async getMyGivingWidget(): Promise<ChartData> {
    // Mock data for My Giving widget
    return {
      widgetType: WidgetType.CHART,
      chartType: 'doughnut',
      title: 'My Giving',
      data: {
        labels: ['Tithes', 'Offerings', 'Building Fund'],
        datasets: [
          {
            data: [300, 50, 100],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
            ],
          },
        ],
      },
    };
  }

  private async getMinistryInvolvementWidget(
    branchId?: string,
    organisationId?: string,
  ): Promise<MinistryInvolvementWidget> {
    const where: { branchId?: string; organisationId?: string } = {};
    if (organisationId) {
      where.organisationId = organisationId;
    }
    if (branchId) {
      where.branchId = branchId;
    }
    const ministries = await this.prisma.ministry.findMany({
      where,
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: 10, // Limit to 10 ministries
    });

    return {
      title: 'Ministry Involvement',
      widgetType: WidgetType.MINISTRY_INVOLVEMENT,
      ministries: ministries.map((m) => ({
        ministryName: m.name,
        memberCount: m._count.members,
      })),
    };
  }

  private async getRecentSacramentsWidget(
    branchId?: string,
    organisationId?: string,
  ): Promise<RecentSacramentsWidget> {
    const where: { branchId?: string; organisationId?: string } = {};
    if (organisationId) {
      where.organisationId = organisationId;
    }
    if (branchId) {
      where.branchId = branchId;
    }
    const sacraments = await this.prisma.sacramentalRecord.findMany({
      where,
      orderBy: { dateOfSacrament: 'desc' },
      take: 5,
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      title: 'Recent Sacraments',
      widgetType: WidgetType.RECENT_SACRAMENTS,
      sacraments: sacraments.map((s) => ({
        id: s.id,
        type: s.sacramentType,
        date: s.dateOfSacrament,
        recipientName: `${s.member.firstName} ${s.member.lastName}`.trim(),
      })),
    };
  }

  private async getPrayerRequestSummaryWidget(
    branchId?: string,
    organisationId?: string,
  ): Promise<PrayerRequestSummaryWidget> {
    const where: { branchId?: string; organisationId?: string } = {};
    if (organisationId) {
      where.organisationId = organisationId;
    }
    if (branchId) {
      where.branchId = branchId;
    }
    const prayerRequests = await this.prisma.prayerRequest.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true,
      },
    });

    return {
      title: 'Prayer Requests',
      widgetType: WidgetType.PRAYER_REQUEST_SUMMARY,
      summary: prayerRequests.map((p) => ({
        status: p.status,
        count: p._count?.id || 0,
      })),
    };
  }

  private async getFinancialSummaryWidget(
    branchId?: string,
    organisationId?: string,
  ): Promise<KpiCard> {
    const dateRange = {
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(),
    };

    const contributionsData =
      await this.financialReportsService.getContributionsReport({
        branchId,
        organisationId,
        dateRange,
      });

    const budgetData =
      await this.financialReportsService.getBudgetVsActualReport({
        branchId,
        organisationId,
        dateRange,
      });

    const totalContributions = contributionsData.total;
    const totalExpenses = budgetData.totals.actual;

    const formattedValue = `${new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(totalContributions)} / ${new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(totalExpenses)}`;

    return {
      widgetType: WidgetType.KPI_CARD,
      title: 'Financial Summary (Income / Expense)',
      value: formattedValue,
      percentChange: 0, // Placeholder for future implementation
      icon: 'wallet-outline',
    };
  }

  private async getMemberDemographicsWidget(
    branchId?: string,
    organisationId?: string,
  ): Promise<ChartData> {
    const memberDemographics =
      await this.memberReportsService.getMemberDemographicsReport(
        branchId,
        organisationId,
      );
    return {
      widgetType: WidgetType.CHART,
      chartType: 'doughnut',
      title: 'Member Demographics',
      data: memberDemographics,
    };
  }

  private async getAttendanceTrendWidget(
    branchId?: string,
    organisationId?: string,
  ): Promise<ChartData> {
    const attendanceTrend =
      await this.attendanceReportsService.getAttendanceTrendReport(
        branchId,
        organisationId,
      );
    return {
      widgetType: WidgetType.CHART,
      chartType: 'line',
      title: 'Attendance Trend',
      data: attendanceTrend,
    };
  }

  private async getBudgetVsActualWidget(
    branchId?: string,
    organisationId?: string,
  ): Promise<KpiCard> {
    const fiscalYearStartDate = new Date(new Date().getFullYear(), 0, 1);
    const fiscalYearEndDate = new Date(new Date().getFullYear(), 11, 31);

    const budgetReport =
      await this.financialReportsService.getBudgetVsActualReport({
        branchId,
        organisationId,
        dateRange: {
          startDate: fiscalYearStartDate,
          endDate: fiscalYearEndDate,
        },
      });

    const formattedValue = `${new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budgetReport.totals.actual)} / ${new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budgetReport.totals.budgeted)}`;

    const percentChange = budgetReport.totals.budgeted
      ? (budgetReport.totals.actual / budgetReport.totals.budgeted) * 100
      : 0;

    return {
      widgetType: WidgetType.KPI_CARD,
      title: 'Budget vs. Actual',
      value: formattedValue,
      percentChange,
      icon: 'wallet-outline',
    };
  }

  private async getContributionsWidget(
    branchId?: string,
    organisationId?: string,
  ): Promise<ChartData> {
    const startDate = new Date(new Date().getFullYear(), 0, 1);
    const endDate = new Date(new Date().getFullYear(), 11, 31);
    const report = await this.financialReportsService.getContributionsReport({
      branchId,
      organisationId,
      dateRange: {
        startDate,
        endDate,
      },
    });

    return {
      title: 'Contributions Report',
      widgetType: WidgetType.CHART,
      chartType: 'bar',
      data: report,
    };
  }

  async getUserDashboardPreference(
    userId: string,
    dashboardType: DashboardType,
    branchId?: string,
    organisationId?: string,
  ): Promise<UserDashboardPreference | null> {
    if (!branchId) return null; // branchId is required for unique key
    const where: any = {
      userId_branchId_dashboardType: {
        userId,
        branchId,
        dashboardType,
      },
      ...(organisationId ? { organisationId } : {}),
    };
    const preference = await this.prisma.userDashboardPreference.findUnique({
      where,
    });
    return preference as UserDashboardPreference | null;
  }

  async saveUserDashboardPreference(
    userId: string,
    dashboardType: DashboardType,
    layoutConfig: any, // JSON
    branchId?: string,
    organisationId?: string,
  ): Promise<UserDashboardPreference> {
    if (!branchId) throw new Error('branchId is required');
    const where: any = {
      userId_branchId_dashboardType: {
        userId,
        branchId,
        dashboardType,
      },
    };
    await this.prisma.userDashboardPreference.upsert({
      where,
      create: {
        userId,
        branchId,
        dashboardType,
        layoutConfig,
        ...(organisationId ? { organisationId } : {}),
      },
      update: {
        layoutConfig,
        ...(organisationId ? { organisationId } : {}),
      },
    });
    // Always return a valid UserDashboardPreference (never null)
    const pref = await this.getUserDashboardPreference(
      userId,
      dashboardType,
      branchId,
      organisationId,
    );
    if (!pref) {
      throw new Error('Failed to save or retrieve dashboard preference');
    }
    return pref;
  }

  private async getTotalMembersWidget(
    branchId?: string,
    organisationId?: string,
  ): Promise<KpiCard> {
    const where: { branchId?: string; organisationId?: string } = {};
    if (organisationId) {
      where.organisationId = organisationId;
    }
    if (branchId) {
      where.branchId = branchId;
    }
    const totalMembers = await this.prisma.member.count({
      where,
    });
    return {
      title: 'Total Members',
      widgetType: WidgetType.KPI_CARD,
      value: totalMembers.toString(),
      icon: 'people-outline',
    };
  }

  private async getTransactionSummaryWidget(
    branchId?: string,
    organisationId?: string,
  ) {
    // Use this for Super Admin dashboard
    const dateRange = {
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(),
    };
    const summary = await this.financialReportsService.getTransactionSummary({
      branchId,
      organisationId,
      dateRange,
    });
    return {
      widgetType: WidgetType.KPI_CARD,
      title: 'Transaction Summary (Income / Expense)',
      value: `${new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(summary.totalContributions)} / ${new Intl.NumberFormat(
        'en-GH',
        {
          style: 'currency',
          currency: 'GHS',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        },
      ).format(summary.totalExpenses)}`,
      percentChange: 0,
      icon: 'wallet-outline',
    };
  }

  private async getTopGivingBranchesWidget(organisationId?: string) {
    const dateRange = {
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(),
    };
    const branches = await this.financialReportsService.getTopGivingBranches(
      { organisationId, dateRange },
      5,
    );
    return {
      widgetType: WidgetType.CHART,
      chartType: 'bar',
      title: 'Top 5 Giving Branches',
      data: {
        labels: branches.map((b) => b.branchName),
        datasets: [
          {
            data: branches.map((b) => b.totalGiven),
            backgroundColor: [
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 99, 132, 0.6)',
            ],
          },
        ],
      },
    };
  }

  private generateDefaultLayout(widgets: any[]): { lg: any[] } {
    const layout: { i: string; x: number; y: number; w: number; h: number }[] =
      [];
    let x = 0;
    let y = 0;
    let rowMaxH = 0;

    widgets.forEach((widget) => {
      // Default dimensions
      let w = 6;
      let h = 2;

      // Customize dimensions for certain widget types
      if (widget.widgetType === WidgetType.CHART) {
        w = 12; // Full width for charts
        h = 4;
      } else if (widget.widgetType === WidgetType.MINISTRY_INVOLVEMENT) {
        h = 3;
      } else if (widget.widgetType === WidgetType.RECENT_SACRAMENTS) {
        h = 3;
      }

      // If widget doesn't fit in the current row, move to the next
      if (x + w > 12) {
        x = 0;
        y += rowMaxH;
        rowMaxH = 0;
      }

      layout.push({ i: widget.title, x, y, w, h });

      x += w;
      rowMaxH = Math.max(rowMaxH, h);
    });

    return { lg: layout };
  }

  private async createOrUpdateUserDashboardPreference(
    userId: string,
    dashboardType: DashboardType,
    layout: any,
    branchId: string,
    organisationId?: string,
  ) {
    const data = {
      userId,
      dashboardType,
      branchId,
      organisationId,
      layoutConfig: layout,
    };

    return this.prisma.userDashboardPreference.upsert({
      where: {
        userId_branchId_dashboardType: {
          userId,
          branchId,
          dashboardType,
        },
      },
      create: data,
      update: { layoutConfig: layout },
    });
  }
}
