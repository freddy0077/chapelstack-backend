import { Field, ID, ObjectType } from '@nestjs/graphql';
import { NotificationType } from '@prisma/client';

@ObjectType()
export class NotificationDto {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field()
  isRead: boolean;

  @Field(() => Date, { nullable: true })
  readAt: Date | null;

  @Field(() => String, { nullable: true })
  link: string | null;

  @Field(() => String)
  type: NotificationType;

  @Field(() => String, { nullable: true })
  memberId: string | null;

  @Field(() => String, { nullable: true })
  organisationId?: string | null;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
