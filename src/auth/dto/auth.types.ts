import { ObjectType, Field, ID } from '@nestjs/graphql';
import { EmailScalar } from '../../base/graphql/EmailScalar';
import { RoleType } from './role.type';
import { UserBranchType } from './user-branch.type';

@ObjectType('MemberProfile')
export class MemberType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String, { nullable: true })
  profileImageUrl?: string;

  @Field(() => String, { nullable: true })
  status?: string;
}

@ObjectType('UserProfile') // Changed name to avoid duplicate type names
export class UserType {
  @Field(() => ID)
  id: string;

  @Field(() => EmailScalar)
  email: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Boolean)
  isEmailVerified: boolean;

  @Field(() => Date, { nullable: true })
  lastLoginAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [RoleType], { nullable: true })
  roles?: RoleType[];

  @Field(() => [UserBranchType], { nullable: true })
  userBranches?: UserBranchType[];

  @Field(() => String, { nullable: true })
  organisationId?: string;

  @Field(() => MemberType, { nullable: true })
  member?: MemberType;
}

@ObjectType('AuthPayload') // Explicitly naming the GraphQL type
export class AuthPayload {
  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  refreshToken: string;

  @Field(() => UserType)
  user: UserType;
}
