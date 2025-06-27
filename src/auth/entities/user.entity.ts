import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Role } from './role.entity';
import { UserBranch } from './user-branch.entity';

@ObjectType('AuthUser')
export class User {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  firstName: string | null;

  @Field(() => String, { nullable: true })
  lastName: string | null;

  @Field(() => String, { nullable: true })
  phoneNumber: string | null;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Boolean)
  isEmailVerified: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastLoginAt: Date | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => [Role], { nullable: 'itemsAndList' })
  roles?: Role[];

  @Field(() => [UserBranch], { nullable: 'itemsAndList' })
  userBranches?: UserBranch[];
}
