import { ObjectType, Field } from '@nestjs/graphql';

/**
 * MemberInfo ObjectType
 * Represents member information for linking during registration
 * Only exposes non-sensitive member data
 */
@ObjectType()
export class MemberInfo {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  status: string;
}

/**
 * MemberLinkingInfo ObjectType
 * Response from checkEmailForMemberLinking query
 * Indicates whether an email exists in the members database and can be linked
 */
@ObjectType()
export class MemberLinkingInfo {
  @Field()
  isMember: boolean;

  @Field()
  canLink: boolean;

  @Field(() => MemberInfo, { nullable: true })
  memberInfo?: MemberInfo;

  @Field({ nullable: true })
  message?: string;
}
