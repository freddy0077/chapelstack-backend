import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
class DashboardStat {
  @Field(() => Int)
  groups: number;

  @Field(() => Float)
  attendance: number;

  @Field(() => String)
  giving: string;
}

@ObjectType()
class DashboardEvent {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  date: Date;

  @Field()
  location: string;
}

@ObjectType()
class DashboardGroup {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  role: string;
}

@ObjectType()
class DashboardMilestone {
  @Field({ nullable: true })
  baptismDate?: Date;

  @Field({ nullable: true })
  confirmationDate?: Date;
}

@ObjectType()
export class MemberDashboard {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  profileImageUrl?: string;

  @Field()
  membershipStatus: string;

  @Field({ nullable: true })
  membershipDate?: Date;

  @Field(() => DashboardStat)
  stats: DashboardStat;

  @Field(() => [DashboardEvent])
  upcomingEvents: DashboardEvent[];

  @Field(() => [DashboardGroup])
  groups: DashboardGroup[];

  @Field(() => DashboardMilestone)
  milestones: DashboardMilestone;
}
