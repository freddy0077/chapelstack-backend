import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { BranchSetting } from './branch-setting.entity';

@ObjectType()
export class Branch {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  address: string | null;

  @Field(() => String, { nullable: true })
  city: string | null;

  @Field(() => String, { nullable: true })
  state: string | null;

  @Field(() => String, { nullable: true })
  postalCode: string | null;

  @Field(() => String, { nullable: true })
  country: string | null;

  @Field(() => String, { nullable: true })
  phoneNumber: string | null;

  @Field(() => String, { nullable: true })
  email: string | null;

  @Field(() => String, { nullable: true })
  website: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  establishedAt: Date | null;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => [BranchSetting], {
    nullable: 'itemsAndList',
    description: 'Settings associated with this branch',
  })
  settings: BranchSetting[] | null;
  // Note: UserBranch, Member, Event relations will be added as those modules are developed.
}
