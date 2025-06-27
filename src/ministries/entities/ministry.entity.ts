import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GroupMember } from './group-member.entity';
import { SmallGroup } from './small-group.entity';

@ObjectType()
export class Ministry {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field()
  type: string;

  @Field()
  status: string;

  @Field(() => ID, { nullable: true })
  branchId: string | null;

  @Field(() => ID, { nullable: true })
  organisationId: string | null;

  @Field(() => ID, { nullable: true })
  parentId: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [GroupMember], { nullable: true })
  members?: GroupMember[] | null;

  @Field(() => [SmallGroup], { nullable: true })
  smallGroups?: SmallGroup[] | null;

  @Field(() => [Ministry], { nullable: true })
  subMinistries?: Ministry[] | null;

  @Field(() => Ministry, { nullable: true })
  parent?: Ministry | null;
}
