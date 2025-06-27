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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const dashboard_data_entity_1 = require("../entities/dashboard-data.entity");
const member_reports_service_1 = require("./member-reports.service");
const attendance_reports_service_1 = require("./attendance-reports.service");
const financial_reports_service_1 = require("./financial-reports.service");
let DashboardService = class DashboardService {
    prisma;
    memberReportsService;
    attendanceReportsService;
    financialReportsService;
    constructor(prisma, memberReportsService, attendanceReportsService, financialReportsService) {
        this.prisma = prisma;
        this.memberReportsService = memberReportsService;
        this.attendanceReportsService = attendanceReportsService;
        this.financialReportsService = financialReportsService;
    }
    async getDashboardData(userId, branchId, dashboardType, organisationId) {
        const preference = await this.getUserDashboardPreference(userId, branchId, dashboardType, organisationId);
        const dashboardData = {
            branchId,
            organisationId,
            dashboardType,
            branchName: 'Main Branch',
            generatedAt: new Date(),
            widgets: [],
            layout: preference?.layoutConfig || { lg: [] },
            kpiCards: [],
            charts: [],
        };
        if (dashboardType === dashboard_data_entity_1.DashboardType.ADMIN) {
            dashboardData.widgets?.push(await this.getMemberDemographicsWidget(branchId, organisationId), await this.getAttendanceTrendWidget(branchId, organisationId), await this.getBudgetVsActualWidget(branchId, organisationId));
        }
        else if (dashboardType === dashboard_data_entity_1.DashboardType.FINANCE) {
            dashboardData.widgets?.push(await this.getFinancialSummaryWidget(branchId, organisationId), await this.getBudgetVsActualWidget(branchId, organisationId));
        }
        else if (dashboardType === dashboard_data_entity_1.DashboardType.MINISTRY) {
            dashboardData.widgets?.push(await this.getGroupAttendanceWidget(branchId, organisationId));
        }
        else if (dashboardType === dashboard_data_entity_1.DashboardType.MEMBER) {
            dashboardData.widgets?.push(await this.getMyGivingWidget(userId), this.getAnnouncementsWidget(), this.getQuickLinksWidget(), this.getUpcomingEventsWidget(), this.getNotificationsWidget());
        }
        return dashboardData;
    }
    getAnnouncementsWidget() {
        return {
            title: 'Announcements',
            widgetType: dashboard_data_entity_1.WidgetType.ANNOUNCEMENTS,
            announcements: this.getSampleAnnouncements(2),
        };
    }
    getSampleAnnouncements(count) {
        const allAnnouncements = [
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
    getQuickLinksWidget() {
        return {
            title: 'Quick Links',
            widgetType: dashboard_data_entity_1.WidgetType.QUICK_LINKS,
            links: this.getSampleQuickLinks(3),
        };
    }
    getSampleQuickLinks(count) {
        const allLinks = [
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
    getUpcomingEventsWidget() {
        return {
            title: 'Upcoming Events',
            widgetType: dashboard_data_entity_1.WidgetType.UPCOMING_EVENTS,
            events: this.getSampleEvents(2),
        };
    }
    getSampleEvents(count) {
        const allEvents = [
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
    getNotificationsWidget() {
        return {
            title: 'Notifications',
            widgetType: dashboard_data_entity_1.WidgetType.NOTIFICATIONS,
            notifications: this.getSampleNotifications(3),
        };
    }
    getSampleNotifications(count) {
        const allNotifications = [
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
    async getMemberDemographicsWidget(branchId, organisationId) {
        const memberDemographics = await this.memberReportsService.getMemberDemographicsReport(branchId, organisationId);
        return {
            widgetType: dashboard_data_entity_1.WidgetType.CHART,
            chartType: 'doughnut',
            title: 'Member Demographics',
            data: memberDemographics,
        };
    }
    async getAttendanceTrendWidget(branchId, organisationId) {
        const attendanceTrend = await this.attendanceReportsService.getAttendanceTrendReport(branchId, organisationId);
        return {
            widgetType: dashboard_data_entity_1.WidgetType.CHART,
            chartType: 'line',
            title: 'Attendance Trend',
            data: attendanceTrend,
        };
    }
    async getBudgetVsActualWidget(branchId, organisationId) {
        const fiscalYearStartDate = new Date(new Date().getFullYear(), 0, 1);
        const fiscalYearEndDate = new Date(new Date().getFullYear(), 11, 31);
        const budgetReport = await this.financialReportsService.getBudgetVsActualReport({
            branchId,
            organisationId,
            dateRange: {
                startDate: fiscalYearStartDate,
                endDate: fiscalYearEndDate,
            },
        });
        return {
            widgetType: dashboard_data_entity_1.WidgetType.KPI_CARD,
            title: 'Budget vs. Actual',
            value: `${budgetReport.totals.actual} / ${budgetReport.totals.budgeted}`,
            percentChange: budgetReport.totals.percentVariance,
            icon: 'wallet-outline',
        };
    }
    async getFinancialSummaryWidget(branchId, organisationId) {
        return {
            widgetType: dashboard_data_entity_1.WidgetType.CHART,
            chartType: 'bar',
            title: 'Financial Summary',
            data: { labels: [], datasets: [] },
        };
    }
    async getGroupAttendanceWidget(branchId, organisationId) {
        return {
            widgetType: dashboard_data_entity_1.WidgetType.CHART,
            chartType: 'pie',
            title: 'Group Attendance',
            data: { labels: [], datasets: [] },
        };
    }
    async getMyGivingWidget(userId) {
        const fiscalYearStartDate = new Date(new Date().getFullYear(), 0, 1);
        const fiscalYearEndDate = new Date(new Date().getFullYear(), 11, 31);
        const givingReport = await this.financialReportsService.getContributionsReport({
            dateRange: {
                startDate: fiscalYearStartDate,
                endDate: fiscalYearEndDate,
            },
        });
        return {
            widgetType: dashboard_data_entity_1.WidgetType.KPI_CARD,
            title: 'My Giving (YTD)',
            value: `$${givingReport.total.toFixed(2)}`,
            icon: 'heart-outline',
        };
    }
    async getUserDashboardPreference(userId, branchId, dashboardType, organisationId) {
        const preference = await this.prisma.userDashboardPreference.findUnique({
            where: {
                userId_branchId_dashboardType: {
                    userId,
                    branchId,
                    dashboardType,
                },
            },
        });
        return preference;
    }
    async saveUserDashboardPreference(userId, branchId, dashboardType, layoutConfig, organisationId) {
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
        return preference;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        member_reports_service_1.MemberReportsService,
        attendance_reports_service_1.AttendanceReportsService,
        financial_reports_service_1.FinancialReportsService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map