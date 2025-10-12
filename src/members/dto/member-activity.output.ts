import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';

export enum ActivityType {
  ATTENDANCE = 'ATTENDANCE',
  CONTRIBUTION = 'CONTRIBUTION',
  PRAYER_REQUEST = 'PRAYER_REQUEST',
  COUNSELING = 'COUNSELING',
  PASTORAL_VISIT = 'PASTORAL_VISIT',
  CARE_REQUEST = 'CARE_REQUEST',
  SACRAMENT = 'SACRAMENT',
  GROUP_MEMBERSHIP = 'GROUP_MEMBERSHIP',
}

registerEnumType(ActivityType, {
  name: 'ActivityType',
  description: 'Type of member activity',
});

@ObjectType()
export class MemberActivity {
  @Field(() => ID)
  id: string;

  @Field(() => ActivityType)
  type: ActivityType;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => GraphQLISODateTime)
  date: Date;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => Number, { nullable: true })
  amount?: number;

  @Field(() => String, { nullable: true })
  priority?: string;

  @Field(() => String, { nullable: true })
  relatedEntityId?: string;
}
