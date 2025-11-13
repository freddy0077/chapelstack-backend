import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Announcement } from './announcement.entity';

@ObjectType()
export class AnnouncementRead {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  announcementId: string;

  @Field(() => Announcement, { nullable: true })
  announcement?: Announcement;

  @Field(() => String)
  userId: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Date)
  readAt: Date;
}
