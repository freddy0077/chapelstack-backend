import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Branch } from '../../branches/entities/branch.entity';
import { Member } from '../../members/entities/member.entity';
import { Organisation } from '../../organisation/dto/organisation.model';
import { User } from '../../users/entities/user.entity';
import { NotificationType } from '../enums/notification-type.enum';

@ObjectType()
export class Notification {
  @Field(() => ID)
  id: string;

  @Field(() => User)
  user: User;

  @Field()
  userId: string;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field()
  isRead: boolean;

  @Field({ nullable: true })
  readAt?: Date;

  @Field({ nullable: true })
  link?: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field(() => Branch, { nullable: true })
  branch?: Branch;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field(() => Member, { nullable: true })
  member?: Member;

  @Field(() => String, { nullable: true })
  memberId?: string | null;

  @Field(() => Organisation, { nullable: true })
  organisation?: Organisation;

  @Field(() => String, { nullable: true })
  organisationId?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
