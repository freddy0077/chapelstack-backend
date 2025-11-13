import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class AnnouncementCreator {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  firstName: string | null;

  @Field(() => String, { nullable: true })
  lastName: string | null;

  @Field(() => String)
  email: string;
}

@ObjectType()
export class AnnouncementCounts {
  @Field(() => Int)
  reads: number;

  @Field(() => Int)
  deliveries: number;
}

@ObjectType()
export class Announcement {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;

  @Field(() => String)
  category: string;

  @Field(() => String)
  priority: string;

  @Field(() => Date, { nullable: true })
  publishedAt: Date | null;

  @Field(() => Date, { nullable: true })
  scheduledFor: Date | null;

  @Field(() => Date, { nullable: true })
  expiresAt: Date | null;

  @Field(() => String)
  targetAudience: string;

  @Field(() => [String])
  targetGroupIds: string[];

  @Field(() => String, { nullable: true })
  imageUrl: string | null;

  @Field(() => String, { nullable: true })
  attachmentUrl: string | null;

  @Field(() => Boolean)
  sendEmail: boolean;

  @Field(() => Boolean)
  sendPush: boolean;

  @Field(() => Boolean)
  displayOnBoard: boolean;

  @Field(() => Boolean)
  displayOnDashboard: boolean;

  @Field(() => String)
  status: string;

  @Field(() => String)
  createdBy: string;

  @Field(() => AnnouncementCreator)
  creator: AnnouncementCreator;

  @Field(() => String)
  branchId: string;

  @Field(() => Branch, { nullable: true })
  branch?: Branch;

  @Field(() => AnnouncementCounts, { nullable: true })
  _count?: AnnouncementCounts;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class AnnouncementsResponse {
  @Field(() => [Announcement])
  announcements: Announcement[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  offset: number;
}
