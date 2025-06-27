import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GroupMember } from './group-member.entity';
import { Ministry } from './ministry.entity';

@ObjectType()
export class SmallGroup {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field()
  type: string;

  @Field(() => String, { nullable: true })
  meetingSchedule: string | null;

  @Field(() => String, { nullable: true })
  location: string | null;

  @Field(() => Int, { nullable: true })
  maximumCapacity: number | null;

  @Field()
  status: string;

  @Field(() => String, { nullable: true })
  branchId: string | null;

  @Field(() => String, { nullable: true })
  organisationId: string | null;

  @Field(() => String, { nullable: true })
  ministryId: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [GroupMember], { nullable: true })
  members?: GroupMember[] | null;

  @Field(() => Ministry, { nullable: true })
  ministry?: Ministry | null;
}
