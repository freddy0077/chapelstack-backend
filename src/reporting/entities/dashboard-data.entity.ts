import {
  Field,
  ObjectType,
  registerEnumType,
  createUnionType,
  ID,
} from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

export enum DashboardType {
  PASTORAL = 'PASTORAL',
  ADMIN = 'ADMIN',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  FINANCE = 'FINANCE',
  MINISTRY = 'MINISTRY',
  MEMBER = 'MEMBER', // Added for regular church members
  BRANCH_ADMIN = 'BRANCH_ADMIN', // Added for branch admin dashboard
}

registerEnumType(DashboardType, {
  name: 'DashboardType',
  description: 'Types of dashboards available in the system',
});

export enum WidgetType {
  KPI_CARD = 'KPI_CARD',
  CHART = 'CHART',
  UPCOMING_EVENTS = 'UPCOMING_EVENTS',
  ATTENDANCE_SNAPSHOT = 'ATTENDANCE_SNAPSHOT',
  GIVING_SUMMARY = 'GIVING_SUMMARY',
  TASKS = 'TASKS',
  PRAYER_REQUESTS = 'PRAYER_REQUESTS',
  NEW_MEMBERS = 'NEW_MEMBERS',
  MY_GROUPS = 'MY_GROUPS',
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  QUICK_LINKS = 'QUICK_LINKS',
  BIRTHDAYS = 'BIRTHDAYS',
  NOTIFICATIONS = 'NOTIFICATIONS',
  MINISTRY_INVOLVEMENT = 'MINISTRY_INVOLVEMENT',
  RECENT_SACRAMENTS = 'RECENT_SACRAMENTS',
  PRAYER_REQUEST_SUMMARY = 'PRAYER_REQUEST_SUMMARY',
}

registerEnumType(WidgetType, {
  name: 'WidgetType',
  description: 'Types of widgets available for dashboards',
});

@ObjectType()
export class KpiCard {
  @Field(() => String)
  title: string;

  @Field(() => String)
  value: string;

  @Field(() => Number, { nullable: true })
  percentChange?: number;

  @Field(() => String, { nullable: true })
  icon?: string;

  @Field(() => WidgetType)
  widgetType: WidgetType = WidgetType.KPI_CARD;
}

@ObjectType()
export class ChartData {
  @Field(() => String)
  chartType: string;

  @Field(() => String)
  title: string;

  @Field(() => GraphQLJSON)
  data: Record<string, any>;

  @Field(() => WidgetType)
  widgetType: WidgetType = WidgetType.CHART;
}

@ObjectType()
export class EventItem {
  @Field(() => String)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => String, { nullable: true })
  description?: string;
}

@ObjectType()
export class UpcomingEventsWidget {
  @Field(() => String)
  title: string = 'Upcoming Events';

  @Field(() => [EventItem])
  events: EventItem[];

  @Field(() => WidgetType)
  widgetType: WidgetType = WidgetType.UPCOMING_EVENTS;
}

@ObjectType()
export class TaskItem {
  @Field(() => String)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => Date, { nullable: true })
  dueDate?: Date;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  priority?: string;
}

@ObjectType()
export class TasksWidget {
  @Field(() => String)
  title: string = 'My Tasks';

  @Field(() => [TaskItem])
  tasks: TaskItem[];

  @Field(() => WidgetType)
  widgetType: WidgetType = WidgetType.TASKS;
}

@ObjectType()
export class GroupItem {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  type?: string;

  @Field(() => String, { nullable: true })
  role?: string; // Member, Leader, etc.

  @Field(() => Date, { nullable: true })
  nextMeeting?: Date;

  @Field(() => String, { nullable: true })
  meetingDay?: string;

  @Field(() => String, { nullable: true })
  meetingTime?: string;
}

@ObjectType()
export class MyGroupsWidget {
  @Field(() => String)
  title: string = 'My Groups';

  @Field(() => [GroupItem])
  groups: GroupItem[];

  @Field(() => WidgetType)
  widgetType: WidgetType = WidgetType.MY_GROUPS;
}

@ObjectType()
export class AnnouncementItem {
  @Field(() => String)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;

  @Field(() => Date)
  date: Date;

  @Field(() => String, { nullable: true })
  author?: string;

  @Field(() => String, { nullable: true })
  priority?: string;
}

@ObjectType()
export class AnnouncementsWidget {
  @Field(() => String)
  title: string = 'Announcements';

  @Field(() => [AnnouncementItem])
  announcements: AnnouncementItem[];

  @Field(() => WidgetType)
  widgetType: WidgetType = WidgetType.ANNOUNCEMENTS;
}

@ObjectType()
export class QuickLinkItem {
  @Field(() => String)
  title: string;

  @Field(() => String)
  url: string;

  @Field(() => String, { nullable: true })
  icon?: string;
}

@ObjectType()
export class QuickLinksWidget {
  @Field(() => String)
  title: string = 'Quick Links';

  @Field(() => [QuickLinkItem])
  links: QuickLinkItem[];

  @Field(() => WidgetType)
  widgetType: WidgetType = WidgetType.QUICK_LINKS;
}

@ObjectType()
export class NotificationItem {
  @Field(() => String)
  id: string;

  @Field(() => String)
  message: string;

  @Field(() => Date)
  date: Date;

  @Field(() => String)
  type: string; // INFO, WARNING, SUCCESS, ERROR

  @Field(() => Boolean)
  read: boolean;
}

@ObjectType()
export class NotificationsWidget {
  @Field(() => String)
  title: string = 'Notifications';

  @Field(() => [NotificationItem])
  notifications: NotificationItem[];

  @Field(() => WidgetType)
  widgetType: WidgetType = WidgetType.NOTIFICATIONS;
}

@ObjectType()
export class MinistryInvolvementItem {
  @Field(() => String)
  ministryName: string;

  @Field(() => Number)
  memberCount: number;
}

@ObjectType()
export class MinistryInvolvementWidget {
  @Field(() => String)
  title: string = 'Ministry Involvement';

  @Field(() => [MinistryInvolvementItem])
  ministries: MinistryInvolvementItem[];

  @Field(() => WidgetType)
  widgetType: WidgetType = WidgetType.MINISTRY_INVOLVEMENT;
}

@ObjectType()
export class SacramentItem {
  @Field(() => String)
  id: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  recipientName: string;

  @Field(() => Date)
  date: Date;
}

@ObjectType()
export class RecentSacramentsWidget {
  @Field(() => String)
  title: string = 'Recent Sacraments';

  @Field(() => [SacramentItem])
  sacraments: SacramentItem[];

  @Field(() => WidgetType)
  widgetType: WidgetType = WidgetType.RECENT_SACRAMENTS;
}

@ObjectType()
export class PrayerRequestSummaryData {
  @Field(() => String)
  status: string;

  @Field(() => Number)
  count: number;
}

@ObjectType()
export class PrayerRequestSummaryWidget {
  @Field(() => String)
  title: string = 'Prayer Requests';

  @Field(() => [PrayerRequestSummaryData])
  summary: PrayerRequestSummaryData[];

  @Field(() => WidgetType)
  widgetType: WidgetType = WidgetType.PRAYER_REQUEST_SUMMARY;
}

export const DashboardWidgetUnion = createUnionType({
  name: 'DashboardWidgetUnion',
  types: () =>
    [
      KpiCard,
      ChartData,
      UpcomingEventsWidget,
      TasksWidget,
      MyGroupsWidget,
      AnnouncementsWidget,
      QuickLinksWidget,
      NotificationsWidget,
      MinistryInvolvementWidget,
      RecentSacramentsWidget,
      PrayerRequestSummaryWidget,
    ] as const,
  resolveType(value) {
    switch (value.widgetType) {
      case WidgetType.KPI_CARD:
        return KpiCard;
      case WidgetType.CHART:
        return ChartData;
      case WidgetType.UPCOMING_EVENTS:
        return UpcomingEventsWidget;
      case WidgetType.TASKS:
        return TasksWidget;
      case WidgetType.MY_GROUPS:
        return MyGroupsWidget;
      case WidgetType.ANNOUNCEMENTS:
        return AnnouncementsWidget;
      case WidgetType.QUICK_LINKS:
        return QuickLinksWidget;
      case WidgetType.NOTIFICATIONS:
        return NotificationsWidget;
      case WidgetType.MINISTRY_INVOLVEMENT:
        return MinistryInvolvementWidget;
      case WidgetType.RECENT_SACRAMENTS:
        return RecentSacramentsWidget;
      case WidgetType.PRAYER_REQUEST_SUMMARY:
        return PrayerRequestSummaryWidget;
      default:
        return undefined;
    }
  },
});

@ObjectType()
export class DashboardData {
  @Field(() => ID, { nullable: true })
  organisationId?: string;

  @Field(() => ID, { nullable: true })
  branchId?: string;

  @Field(() => String, { nullable: true })
  branchName?: string;

  @Field(() => DashboardType)
  dashboardType: DashboardType;

  @Field(() => Date)
  generatedAt: Date;

  @Field(() => [DashboardWidgetUnion])
  widgets: Array<typeof DashboardWidgetUnion>;

  @Field(() => GraphQLJSON, { nullable: true })
  layout?: Record<string, any>;
}

@ObjectType()
export class MemberDemographicsData {
  // ... (no changes)
}
