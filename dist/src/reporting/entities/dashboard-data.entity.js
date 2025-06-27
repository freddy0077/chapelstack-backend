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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberDemographicsData = exports.DashboardData = exports.DashboardWidgetUnion = exports.NotificationsWidget = exports.NotificationItem = exports.QuickLinksWidget = exports.QuickLinkItem = exports.AnnouncementsWidget = exports.AnnouncementItem = exports.MyGroupsWidget = exports.GroupItem = exports.TasksWidget = exports.TaskItem = exports.UpcomingEventsWidget = exports.EventItem = exports.ChartData = exports.KpiCard = exports.WidgetType = exports.DashboardType = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
var DashboardType;
(function (DashboardType) {
    DashboardType["PASTORAL"] = "PASTORAL";
    DashboardType["ADMIN"] = "ADMIN";
    DashboardType["FINANCE"] = "FINANCE";
    DashboardType["MINISTRY"] = "MINISTRY";
    DashboardType["MEMBER"] = "MEMBER";
    DashboardType["BRANCH_ADMIN"] = "BRANCH_ADMIN";
    DashboardType["SUPER_ADMIN"] = "SUPER_ADMIN";
})(DashboardType || (exports.DashboardType = DashboardType = {}));
(0, graphql_1.registerEnumType)(DashboardType, {
    name: 'DashboardType',
    description: 'Types of dashboards available in the system',
});
var WidgetType;
(function (WidgetType) {
    WidgetType["KPI_CARD"] = "KPI_CARD";
    WidgetType["CHART"] = "CHART";
    WidgetType["UPCOMING_EVENTS"] = "UPCOMING_EVENTS";
    WidgetType["ATTENDANCE_SNAPSHOT"] = "ATTENDANCE_SNAPSHOT";
    WidgetType["GIVING_SUMMARY"] = "GIVING_SUMMARY";
    WidgetType["TASKS"] = "TASKS";
    WidgetType["PRAYER_REQUESTS"] = "PRAYER_REQUESTS";
    WidgetType["NEW_MEMBERS"] = "NEW_MEMBERS";
    WidgetType["MY_GROUPS"] = "MY_GROUPS";
    WidgetType["ANNOUNCEMENTS"] = "ANNOUNCEMENTS";
    WidgetType["QUICK_LINKS"] = "QUICK_LINKS";
    WidgetType["BIRTHDAYS"] = "BIRTHDAYS";
    WidgetType["NOTIFICATIONS"] = "NOTIFICATIONS";
})(WidgetType || (exports.WidgetType = WidgetType = {}));
(0, graphql_1.registerEnumType)(WidgetType, {
    name: 'WidgetType',
    description: 'Types of widgets available for dashboards',
});
let KpiCard = class KpiCard {
    title;
    value;
    percentChange;
    icon;
    widgetType = WidgetType.KPI_CARD;
};
exports.KpiCard = KpiCard;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], KpiCard.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], KpiCard.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], KpiCard.prototype, "percentChange", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], KpiCard.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)(() => WidgetType),
    __metadata("design:type", String)
], KpiCard.prototype, "widgetType", void 0);
exports.KpiCard = KpiCard = __decorate([
    (0, graphql_1.ObjectType)()
], KpiCard);
let ChartData = class ChartData {
    chartType;
    title;
    data;
    widgetType = WidgetType.CHART;
};
exports.ChartData = ChartData;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], ChartData.prototype, "chartType", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], ChartData.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default),
    __metadata("design:type", Object)
], ChartData.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => WidgetType),
    __metadata("design:type", String)
], ChartData.prototype, "widgetType", void 0);
exports.ChartData = ChartData = __decorate([
    (0, graphql_1.ObjectType)()
], ChartData);
let EventItem = class EventItem {
    id;
    title;
    startDate;
    endDate;
    location;
    description;
};
exports.EventItem = EventItem;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], EventItem.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], EventItem.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], EventItem.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], EventItem.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], EventItem.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], EventItem.prototype, "description", void 0);
exports.EventItem = EventItem = __decorate([
    (0, graphql_1.ObjectType)()
], EventItem);
let UpcomingEventsWidget = class UpcomingEventsWidget {
    title = 'Upcoming Events';
    events;
    widgetType = WidgetType.UPCOMING_EVENTS;
};
exports.UpcomingEventsWidget = UpcomingEventsWidget;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], UpcomingEventsWidget.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => [EventItem]),
    __metadata("design:type", Array)
], UpcomingEventsWidget.prototype, "events", void 0);
__decorate([
    (0, graphql_1.Field)(() => WidgetType),
    __metadata("design:type", String)
], UpcomingEventsWidget.prototype, "widgetType", void 0);
exports.UpcomingEventsWidget = UpcomingEventsWidget = __decorate([
    (0, graphql_1.ObjectType)()
], UpcomingEventsWidget);
let TaskItem = class TaskItem {
    id;
    title;
    dueDate;
    status;
    priority;
};
exports.TaskItem = TaskItem;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], TaskItem.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], TaskItem.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], TaskItem.prototype, "dueDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], TaskItem.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], TaskItem.prototype, "priority", void 0);
exports.TaskItem = TaskItem = __decorate([
    (0, graphql_1.ObjectType)()
], TaskItem);
let TasksWidget = class TasksWidget {
    title = 'My Tasks';
    tasks;
    widgetType = WidgetType.TASKS;
};
exports.TasksWidget = TasksWidget;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], TasksWidget.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TaskItem]),
    __metadata("design:type", Array)
], TasksWidget.prototype, "tasks", void 0);
__decorate([
    (0, graphql_1.Field)(() => WidgetType),
    __metadata("design:type", String)
], TasksWidget.prototype, "widgetType", void 0);
exports.TasksWidget = TasksWidget = __decorate([
    (0, graphql_1.ObjectType)()
], TasksWidget);
let GroupItem = class GroupItem {
    id;
    name;
    type;
    role;
    nextMeeting;
    meetingDay;
    meetingTime;
};
exports.GroupItem = GroupItem;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], GroupItem.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], GroupItem.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], GroupItem.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], GroupItem.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], GroupItem.prototype, "nextMeeting", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], GroupItem.prototype, "meetingDay", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], GroupItem.prototype, "meetingTime", void 0);
exports.GroupItem = GroupItem = __decorate([
    (0, graphql_1.ObjectType)()
], GroupItem);
let MyGroupsWidget = class MyGroupsWidget {
    title = 'My Groups';
    groups;
    widgetType = WidgetType.MY_GROUPS;
};
exports.MyGroupsWidget = MyGroupsWidget;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MyGroupsWidget.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => [GroupItem]),
    __metadata("design:type", Array)
], MyGroupsWidget.prototype, "groups", void 0);
__decorate([
    (0, graphql_1.Field)(() => WidgetType),
    __metadata("design:type", String)
], MyGroupsWidget.prototype, "widgetType", void 0);
exports.MyGroupsWidget = MyGroupsWidget = __decorate([
    (0, graphql_1.ObjectType)()
], MyGroupsWidget);
let AnnouncementItem = class AnnouncementItem {
    id;
    title;
    content;
    date;
    author;
    priority;
};
exports.AnnouncementItem = AnnouncementItem;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AnnouncementItem.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AnnouncementItem.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AnnouncementItem.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], AnnouncementItem.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], AnnouncementItem.prototype, "author", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], AnnouncementItem.prototype, "priority", void 0);
exports.AnnouncementItem = AnnouncementItem = __decorate([
    (0, graphql_1.ObjectType)()
], AnnouncementItem);
let AnnouncementsWidget = class AnnouncementsWidget {
    title = 'Announcements';
    announcements;
    widgetType = WidgetType.ANNOUNCEMENTS;
};
exports.AnnouncementsWidget = AnnouncementsWidget;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AnnouncementsWidget.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AnnouncementItem]),
    __metadata("design:type", Array)
], AnnouncementsWidget.prototype, "announcements", void 0);
__decorate([
    (0, graphql_1.Field)(() => WidgetType),
    __metadata("design:type", String)
], AnnouncementsWidget.prototype, "widgetType", void 0);
exports.AnnouncementsWidget = AnnouncementsWidget = __decorate([
    (0, graphql_1.ObjectType)()
], AnnouncementsWidget);
let QuickLinkItem = class QuickLinkItem {
    title;
    url;
    icon;
};
exports.QuickLinkItem = QuickLinkItem;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], QuickLinkItem.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], QuickLinkItem.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], QuickLinkItem.prototype, "icon", void 0);
exports.QuickLinkItem = QuickLinkItem = __decorate([
    (0, graphql_1.ObjectType)()
], QuickLinkItem);
let QuickLinksWidget = class QuickLinksWidget {
    title = 'Quick Links';
    links;
    widgetType = WidgetType.QUICK_LINKS;
};
exports.QuickLinksWidget = QuickLinksWidget;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], QuickLinksWidget.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => [QuickLinkItem]),
    __metadata("design:type", Array)
], QuickLinksWidget.prototype, "links", void 0);
__decorate([
    (0, graphql_1.Field)(() => WidgetType),
    __metadata("design:type", String)
], QuickLinksWidget.prototype, "widgetType", void 0);
exports.QuickLinksWidget = QuickLinksWidget = __decorate([
    (0, graphql_1.ObjectType)()
], QuickLinksWidget);
let NotificationItem = class NotificationItem {
    id;
    message;
    date;
    type;
    read;
};
exports.NotificationItem = NotificationItem;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], NotificationItem.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], NotificationItem.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], NotificationItem.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], NotificationItem.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], NotificationItem.prototype, "read", void 0);
exports.NotificationItem = NotificationItem = __decorate([
    (0, graphql_1.ObjectType)()
], NotificationItem);
let NotificationsWidget = class NotificationsWidget {
    title = 'Notifications';
    notifications;
    widgetType = WidgetType.NOTIFICATIONS;
};
exports.NotificationsWidget = NotificationsWidget;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], NotificationsWidget.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => [NotificationItem]),
    __metadata("design:type", Array)
], NotificationsWidget.prototype, "notifications", void 0);
__decorate([
    (0, graphql_1.Field)(() => WidgetType),
    __metadata("design:type", String)
], NotificationsWidget.prototype, "widgetType", void 0);
exports.NotificationsWidget = NotificationsWidget = __decorate([
    (0, graphql_1.ObjectType)()
], NotificationsWidget);
exports.DashboardWidgetUnion = (0, graphql_1.createUnionType)({
    name: 'DashboardWidgetUnion',
    types: () => [
        KpiCard,
        ChartData,
        UpcomingEventsWidget,
        TasksWidget,
        MyGroupsWidget,
        AnnouncementsWidget,
        QuickLinksWidget,
        NotificationsWidget,
    ],
    resolveType: (value) => {
        if ('percentChange' in value)
            return KpiCard;
        if ('chartType' in value)
            return ChartData;
        if ('events' in value)
            return UpcomingEventsWidget;
        if ('tasks' in value)
            return TasksWidget;
        if ('groups' in value)
            return MyGroupsWidget;
        if ('announcements' in value)
            return AnnouncementsWidget;
        if ('links' in value)
            return QuickLinksWidget;
        if ('notifications' in value && !('widgets' in value))
            return NotificationsWidget;
        return undefined;
    },
});
let DashboardData = class DashboardData {
    organisationId;
    branchId;
    branchName;
    dashboardType;
    generatedAt;
    kpiCards;
    charts;
    upcomingEvents;
    tasks;
    myGroups;
    announcements;
    quickLinks;
    notifications;
    widgets;
    layout;
};
exports.DashboardData = DashboardData;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], DashboardData.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], DashboardData.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], DashboardData.prototype, "branchName", void 0);
__decorate([
    (0, graphql_1.Field)(() => DashboardType),
    __metadata("design:type", String)
], DashboardData.prototype, "dashboardType", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], DashboardData.prototype, "generatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [KpiCard]),
    __metadata("design:type", Array)
], DashboardData.prototype, "kpiCards", void 0);
__decorate([
    (0, graphql_1.Field)(() => [ChartData]),
    __metadata("design:type", Array)
], DashboardData.prototype, "charts", void 0);
__decorate([
    (0, graphql_1.Field)(() => UpcomingEventsWidget, { nullable: true }),
    __metadata("design:type", UpcomingEventsWidget)
], DashboardData.prototype, "upcomingEvents", void 0);
__decorate([
    (0, graphql_1.Field)(() => TasksWidget, { nullable: true }),
    __metadata("design:type", TasksWidget)
], DashboardData.prototype, "tasks", void 0);
__decorate([
    (0, graphql_1.Field)(() => MyGroupsWidget, { nullable: true }),
    __metadata("design:type", MyGroupsWidget)
], DashboardData.prototype, "myGroups", void 0);
__decorate([
    (0, graphql_1.Field)(() => AnnouncementsWidget, { nullable: true }),
    __metadata("design:type", AnnouncementsWidget)
], DashboardData.prototype, "announcements", void 0);
__decorate([
    (0, graphql_1.Field)(() => QuickLinksWidget, { nullable: true }),
    __metadata("design:type", QuickLinksWidget)
], DashboardData.prototype, "quickLinks", void 0);
__decorate([
    (0, graphql_1.Field)(() => NotificationsWidget, { nullable: true }),
    __metadata("design:type", NotificationsWidget)
], DashboardData.prototype, "notifications", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_type_json_1.default]),
    __metadata("design:type", Array)
], DashboardData.prototype, "widgets", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], DashboardData.prototype, "layout", void 0);
exports.DashboardData = DashboardData = __decorate([
    (0, graphql_1.ObjectType)()
], DashboardData);
let MemberDemographicsData = class MemberDemographicsData {
};
exports.MemberDemographicsData = MemberDemographicsData;
exports.MemberDemographicsData = MemberDemographicsData = __decorate([
    (0, graphql_1.ObjectType)()
], MemberDemographicsData);
//# sourceMappingURL=dashboard-data.entity.js.map