import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Member } from '../../members/entities/member.entity';
import { Ministry } from './ministry.entity';
import { SmallGroup } from './small-group.entity';

@ObjectType()
export class GroupExecutive {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  role: string;

  @Field(() => Date)
  appointedAt: Date;

  @Field(() => Date, { nullable: true })
  removedAt: Date | null;

  @Field(() => String)
  status: string;

  @Field(() => ID)
  memberId: string;

  @Field(() => ID, { nullable: true })
  ministryId: string | null;

  @Field(() => ID, { nullable: true })
  smallGroupId: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Member, { nullable: true })
  member?: Member | null;

  @Field(() => Ministry, { nullable: true })
  ministry?: Ministry | null;

  @Field(() => SmallGroup, { nullable: true })
  smallGroup?: SmallGroup | null;
}
