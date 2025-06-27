import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AnnouncementItem,
  AnnouncementsWidget,
  DashboardData,
  DashboardType,
  EventItem,
  GroupItem,
  KpiCard,
  ChartData,
  MyGroupsWidget,
  NotificationItem,
  NotificationsWidget,
  QuickLinkItem,
  QuickLinksWidget,
  TaskItem,
  TasksWidget,
  UpcomingEventsWidget,
  WidgetType,
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
    branchId: string,
    dashboardType: DashboardType,
    organisationId?: string,
  ): Promise<DashboardData> {
    const preference = await this.getUserDashboardPreference(
      userId,
      branchId,
      dashboardType,
      organisationId,
    );

    const dashboardData: DashboardData = {
      branchId,
      organisationId,
      dashboardType,
      branchName: 'Main Branch', // This should be fetched dynamically
      generatedAt: new Date(),
      widgets: [],
      layout: preference?.layoutConfig || { lg: [] },
      kpiCards: [],
      charts: [],
    };

    // Populate widgets based on dashboard type
    if (dashboardType === DashboardType.ADMIN) {
      dashboardData.widgets?.push(
        await this.getMemberDemographicsWidget(branchId, organisationId),
        await this.getAttendanceTrendWidget(branchId, organisationId),
        await this.getBudgetVsActualWidget(branchId, organisationId),
      );
    } else if (dashboardType === DashboardType.FINANCE) {
      dashboardData.widgets?.push(
        await this.getFinancialSummaryWidget(branchId, organisationId),
        await this.getBudgetVsActualWidget(branchId, organisationId),
      );
    } else if (dashboardType === DashboardType.MINISTRY) {
      dashboardData.widgets?.push(
        await this.getGroupAttendanceWidget(branchId, organisationId),
      );
    } else if (dashboardType === DashboardType.MEMBER) {
      dashboardData.widgets?.push(
        await this.getMyGivingWidget(userId),
        this.getAnnouncementsWidget(),
        this.getQuickLinksWidget(),
        this.getUpcomingEventsWidget(),
        this.getNotificationsWidget(),
      );
    }

    return dashboardData;
  }

  private getAnnouncementsWidget(): AnnouncementsWidget {
    return {
      title: 'Announcements',
      widgetType: WidgetType.ANNOUNCEMENTS,
      announcements: this.getSampleAnnouncements(2),
    };
  }

  private getSampleAnnouncements(count: number): AnnouncementItem[] {
    const allAnnouncements: AnnouncementItem[] = [
      {
        id: '1',
        title: 'Annual General Meeting',
        date: new Date(),
        author: 'Church Admin',
        content: 'Join us for a night of worship and praise.',
      },
      {
        id: '2',
        title: 'Community Outreach',
        date: new Date('2023-10-21T09:00:00Z'),
        author: 'Pastor John',
        content: 'We are looking for volunteers for our community outreach program.',
      },
    ];
    return allAnnouncements.slice(0, count);
  }

  private getQuickLinksWidget(): QuickLinksWidget {
    return {
      title: 'Quick Links',
      widgetType: WidgetType.QUICK_LINKS,
      links: this.getSampleQuickLinks(3),
    };
  }

  private getSampleQuickLinks(count: number): QuickLinkItem[] {
    const allLinks: QuickLinkItem[] = [
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
    return allLinks.slice(0, count);
  }

  private getUpcomingEventsWidget(): UpcomingEventsWidget {
    return {
      title: 'Upcoming Events',
      widgetType: WidgetType.UPCOMING_EVENTS,
      events: this.getSampleEvents(2),
    };
  }

  private getSampleEvents(count: number): EventItem[] {
    const allEvents: EventItem[] = [
      {
        id: '1',
        title: 'Youth Camp',
        startDate: new Date('2023-11-15T18:00:00Z'),
        location: 'Mountain Retreat Center',
      },
      {
        id: '2',
        title: 'Worship Night',
        startDate: new Date('2023-11-20T19:00:00Z'),
        location: 'Main Auditorium',
      },
    ];
    return allEvents.slice(0, count);
  }

  private getNotificationsWidget(): NotificationsWidget {
    return {
      title: 'Notifications',
      widgetType: WidgetType.NOTIFICATIONS,
      notifications: this.getSampleNotifications(3),
    };
  }

  private getSampleNotifications(count: number): NotificationItem[] {
    const allNotifications: NotificationItem[] = [
      {
        id: '1',
        message: 'Your giving statement is ready.',
        date: new Date(),
        type: 'FINANCE',
        read: false,
      },
      {
        id: '2',
        message: 'New prayer request from John Doe.',
        date: new Date(),
        type: 'PRAYER',
        read: true,
      },
      {
        id: '3',
        message: 'Small group meeting cancelled.',
        date: new Date(),
        type: 'GROUP',
        read: false,
      },
    ];
    return allNotifications.slice(0, count);
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

    return {
      widgetType: WidgetType.KPI_CARD,
      title: 'Budget vs. Actual',
      value: `${budgetReport.totals.actual} / ${budgetReport.totals.budgeted}`,
      percentChange: budgetReport.totals.percentVariance,
      icon: 'wallet-outline',
    };
  }

  private async getFinancialSummaryWidget(
    branchId?: string,
    organisationId?: string,
  ): Promise<ChartData> {
    // Placeholder for financial summary logic
    return {
      widgetType: WidgetType.CHART,
      chartType: 'bar',
      title: 'Financial Summary',
      data: { labels: [], datasets: [] }, // Placeholder data
    };
  }

  private async getGroupAttendanceWidget(
    branchId?: string,
    organisationId?: string,
  ): Promise<ChartData> {
    // Placeholder for group attendance logic
    return {
      widgetType: WidgetType.CHART,
      chartType: 'pie',
      title: 'Group Attendance',
      data: { labels: [], datasets: [] }, // Placeholder data
    };
  }

  private async getMyGivingWidget(userId: string): Promise<KpiCard> {
    const fiscalYearStartDate = new Date(new Date().getFullYear(), 0, 1);
    const fiscalYearEndDate = new Date(new Date().getFullYear(), 11, 31);

    const givingReport = await this.financialReportsService.getContributionsReport(
      {
        dateRange: {
          startDate: fiscalYearStartDate,
          endDate: fiscalYearEndDate,
        },
      }
    );

    return {
      widgetType: WidgetType.KPI_CARD,
      title: 'My Giving (YTD)',
      value: `$${givingReport.total.toFixed(2)}`,
      icon: 'heart-outline',
    };
  }

  async getUserDashboardPreference(
    userId: string,
    branchId: string,
    dashboardType: DashboardType,
    organisationId?: string,
  ): Promise<UserDashboardPreference | null> {
    const preference = await this.prisma.userDashboardPreference.findUnique({
      where: {
        userId_branchId_dashboardType: {
          userId,
          branchId,
          dashboardType,
        },
      },
    });
    return preference as unknown as UserDashboardPreference | null;
  }

  async saveUserDashboardPreference(
    userId: string,
    branchId: string,
    dashboardType: DashboardType,
    layoutConfig: any, // JSON
    organisationId?: string,
  ): Promise<UserDashboardPreference> {
    const preference = await this.prisma.userDashboardPreference.upsert({
      where: {
        userId_branchId_dashboardType: {
          userId,
          branchId,
          dashboardType,
        },
      },
      update: { layoutConfig, organisationId },
      create: {
        userId,
        branchId,
        organisationId,
        dashboardType,
        layoutConfig,
      },
    });
    return preference as unknown as UserDashboardPreference;
  }
}
