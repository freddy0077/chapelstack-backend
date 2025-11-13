import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Announcement } from './announcement.entity';

@ObjectType()
export class AnnouncementDeliveryUser {
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
export class AnnouncementDelivery {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  announcementId: string;

  @Field(() => Announcement, { nullable: true })
  announcement?: Announcement;

  @Field(() => String)
  userId: string;

  @Field(() => AnnouncementDeliveryUser, { nullable: true })
  user?: AnnouncementDeliveryUser;

  @Field(() => Boolean)
  emailSent: boolean;

  @Field({ nullable: true })
  emailSentAt?: Date;

  @Field({ nullable: true })
  emailError?: string;

  @Field(() => Boolean)
  emailOpened: boolean;

  @Field({ nullable: true })
  emailOpenedAt?: Date;

  @Field(() => Boolean)
  pushSent: boolean;

  @Field({ nullable: true })
  pushSentAt?: Date;

  @Field({ nullable: true })
  pushError?: string;

  @Field(() => Boolean)
  linkClicked: boolean;

  @Field({ nullable: true })
  linkClickedAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class DeliveryStats {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  emailSent: number;

  @Field(() => Int)
  emailOpened: number;

  @Field(() => Int)
  pushSent: number;

  @Field(() => Int)
  linkClicked: number;

  @Field(() => Int)
  emailErrors: number;

  @Field(() => Int)
  pushErrors: number;
}

@ObjectType()
export class DeliveryStatus {
  @Field(() => [AnnouncementDelivery])
  deliveries: AnnouncementDelivery[];

  @Field(() => DeliveryStats)
  stats: DeliveryStats;
}
