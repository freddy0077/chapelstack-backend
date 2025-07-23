import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { OrganisationStatus } from '@prisma/client';

@ObjectType()
export class OrganizationSubscriptionInfo {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  status: string;

  @Field(() => String)
  planName: string;

  @Field(() => Date)
  currentPeriodStart: Date;

  @Field(() => Date)
  currentPeriodEnd: Date;

  @Field(() => Int)
  amount: number;
}

@ObjectType()
export class OrganizationCounts {
  @Field(() => Int)
  branches: number;

  @Field(() => Int)
  users: number;

  @Field(() => Int)
  members: number;
}

@ObjectType()
export class OrganizationWithSubscription {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String)
  status: OrganisationStatus;

  @Field(() => String, { nullable: true })
  suspensionReason?: string;

  @Field(() => Date, { nullable: true })
  suspendedAt?: Date;

  @Field(() => String, { nullable: true })
  suspendedBy?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => OrganizationSubscriptionInfo, { nullable: true })
  subscription?: OrganizationSubscriptionInfo;

  @Field(() => OrganizationCounts)
  _count: OrganizationCounts;
}

@ObjectType()
export class OrganizationStats {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  active: number;

  @Field(() => Int)
  suspended: number;

  @Field(() => Int)
  trial: number;

  @Field(() => Int)
  cancelled: number;

  @Field(() => Int)
  inactive: number;
}
