import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Permission } from './permission.entity';
import { User } from './user.entity';
import { UserBranch } from './user-branch.entity';

@ObjectType()
export class Role {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => [Permission], { nullable: 'itemsAndList' })
  permissions?: Permission[];

  @Field(() => [User], { nullable: 'itemsAndList' })
  users?: User[];

  @Field(() => [UserBranch], { nullable: 'itemsAndList' })
  userBranches?: UserBranch[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
