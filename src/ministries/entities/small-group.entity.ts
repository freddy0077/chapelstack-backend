import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GroupMember } from './group-member.entity';
import { GroupExecutive } from './group-executive.entity';
import { Ministry } from './ministry.entity';

@ObjectType()
export class SmallGroup {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String)
  type: string;

  @Field(() => String, { nullable: true })
  meetingSchedule: string | null;

  @Field(() => String, { nullable: true })
  location: string | null;

  @Field(() => Int, { nullable: true })
  maximumCapacity: number | null;

  @Field(() => String)
  status: string;

  @Field(() => String, { nullable: true })
  branchId: string | null;

  @Field(() => String, { nullable: true })
  organisationId: string | null;

  @Field(() => String, { nullable: true })
  ministryId: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [GroupMember], { nullable: true })
  members?: GroupMember[] | null;

  @Field(() => [GroupExecutive], { nullable: true })
  executives?: GroupExecutive[] | null;

  @Field(() => Ministry, { nullable: true })
  ministry?: Ministry | null;
}
