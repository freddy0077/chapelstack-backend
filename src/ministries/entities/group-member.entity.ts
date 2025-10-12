import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Ministry } from './ministry.entity';
import { SmallGroup } from './small-group.entity';
import { Member } from '../../members/entities/member.entity'; // <-- Import Member

@ObjectType()
export class GroupMember {
  @Field(() => ID)
  id: string;

  @Field()
  role: string;

  @Field()
  joinDate: Date;

  @Field(() => Date, { nullable: true })
  leaveDate?: Date | null;

  @Field(() => String, { nullable: true })
  leaveReason?: string | null;

  @Field()
  status: string;

  @Field()
  memberId: string;

  @Field(() => String, { nullable: true })
  ministryId: string | null;

  @Field(() => String, { nullable: true })
  smallGroupId: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Ministry, { nullable: true })
  ministry?: Ministry | null;

  @Field(() => SmallGroup, { nullable: true })
  smallGroup?: SmallGroup | null;

  @Field(() => Member, { nullable: true })
  member?: Member | null; // Data will be populated by the service's include
}
