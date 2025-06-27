import { Field, ID, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { DashboardType } from './dashboard-data.entity';

@ObjectType()
export class UserDashboardPreference {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => DashboardType)
  dashboardType: DashboardType;

  @Field(() => GraphQLJSON)
  layoutConfig: Record<string, any>;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class WidgetConfig {
  @Field(() => String)
  widgetId: string;

  @Field(() => String)
  widgetType: string;

  @Field(() => Boolean)
  visible: boolean;

  @Field(() => Number)
  order: number;

  @Field(() => String, { nullable: true })
  size?: string; // 'full', 'half', 'third', etc.
}
