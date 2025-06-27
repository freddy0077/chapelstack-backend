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
  FINANCE = 'FINANCE',
  MINISTRY = 'MINISTRY',
  MEMBER = 'MEMBER', // Added for regular church members
  BRANCH_ADMIN = 'BRANCH_ADMIN', // Added for branch admin dashboard
  SUPER_ADMIN = 'SUPER_ADMIN', // Added for super admin dashboard
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
    ] as const,
  resolveType: (value) => {
    if ('percentChange' in value) return KpiCard; // KpiCard has percentChange
    if ('chartType' in value) return ChartData; // ChartData has chartType
    if ('events' in value) return UpcomingEventsWidget;
    if ('tasks' in value) return TasksWidget;
    if ('groups' in value) return MyGroupsWidget;
    if ('announcements' in value) return AnnouncementsWidget;
    if ('links' in value) return QuickLinksWidget;
    if ('notifications' in value && !('widgets' in value))
      return NotificationsWidget; // Differentiate from DashboardData
    return undefined;
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

  @Field(() => [KpiCard])
  kpiCards: KpiCard[];

  @Field(() => [ChartData])
  charts: ChartData[];

  @Field(() => UpcomingEventsWidget, { nullable: true })
  upcomingEvents?: UpcomingEventsWidget;

  @Field(() => TasksWidget, { nullable: true })
  tasks?: TasksWidget;

  @Field(() => MyGroupsWidget, { nullable: true })
  myGroups?: MyGroupsWidget;

  @Field(() => AnnouncementsWidget, { nullable: true })
  announcements?: AnnouncementsWidget;

  @Field(() => QuickLinksWidget, { nullable: true })
  quickLinks?: QuickLinksWidget;

  @Field(() => NotificationsWidget, { nullable: true })
  notifications?: NotificationsWidget;

  @Field(() => [GraphQLJSON])
  widgets: Record<string, any>[];

  @Field(() => GraphQLJSON, { nullable: true })
  layout?: Record<string, any>;
}

@ObjectType()
export class MemberDemographicsData {
  // ... (no changes)
}
