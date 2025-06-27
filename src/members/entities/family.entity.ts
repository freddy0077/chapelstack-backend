import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Member } from './member.entity';
import { GraphQLJSON } from 'graphql-type-json';

export enum FamilyRelationshipType {
  SPOUSE = 'SPOUSE',
  PARENT = 'PARENT',
  CHILD = 'CHILD',
  SIBLING = 'SIBLING',
  GRANDPARENT = 'GRANDPARENT',
  GRANDCHILD = 'GRANDCHILD',
  OTHER = 'OTHER',
}

registerEnumType(FamilyRelationshipType, {
  name: 'FamilyRelationshipType',
  description: 'Type of family relationship',
});

@ObjectType()
export class Family {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  city?: string;

  @Field(() => String, { nullable: true })
  state?: string;

  @Field(() => String, { nullable: true })
  postalCode?: string;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @Field(() => [Member], { nullable: true })
  members?: Member[];

  @Field(() => GraphQLJSON, { nullable: true })
  customFields?: any;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

@ObjectType()
export class FamilyRelationship {
  @Field(() => ID)
  id: string;

  @Field(() => Member, { nullable: true })
  member?: Member;

  @Field(() => ID)
  memberId: string;

  @Field(() => Member)
  relatedMember: Member;

  @Field(() => ID)
  relatedMemberId: string;

  @Field(() => FamilyRelationshipType)
  relationshipType: FamilyRelationshipType;

  @Field(() => Family, { nullable: true })
  family?: Family;

  @Field(() => ID, { nullable: true })
  familyId?: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
