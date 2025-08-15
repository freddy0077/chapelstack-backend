import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class MemberSearchIndex {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  memberId: string;

  @Field(() => String)
  fullName: string;

  @Field(() => String)
  searchName: string;

  @Field(() => [String])
  phoneNumbers: string[];

  @Field(() => [String])
  emails: string[];

  @Field(() => [String])
  addresses: string[];

  @Field(() => [String])
  tags: string[];

  @Field(() => Number, { defaultValue: 1.0 })
  searchRank: number;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => GraphQLISODateTime)
  lastUpdated: Date;

  // Note: We'll add the Member relation in the resolver using @ResolveField
  // to avoid circular references
}
