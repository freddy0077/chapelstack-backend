import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Ministry } from './ministry.entity';
import { SmallGroup } from './small-group.entity';
import { Member } from '../../members/entities/member.entity'; // <-- Import Member

@ObjectType()
export class GroupMember {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  role: string;

  @Field(() => Date)
  joinDate: Date;

  @Field(() => Date, { nullable: true })
  leaveDate?: Date | null;

  @Field(() => String, { nullable: true })
  leaveReason?: string | null;

  @Field(() => String)
  status: string;

  @Field(() => String)
  memberId: string;

  @Field(() => String, { nullable: true })
  ministryId: string | null;

  @Field(() => String, { nullable: true })
  smallGroupId: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Ministry, { nullable: true })
  ministry?: Ministry | null;

  @Field(() => SmallGroup, { nullable: true })
  smallGroup?: SmallGroup | null;

  @Field(() => Member, { nullable: true })
  member?: Member | null; // Data will be populated by the service's include
}
