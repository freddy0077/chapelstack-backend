import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { RelationshipType } from './member.entity';

@ObjectType()
export class MemberRelationship {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  primaryMemberId: string;

  @Field(() => ID)
  relatedMemberId: string;

  @Field(() => RelationshipType)
  relationshipType: RelationshipType;

  @Field(() => Boolean, { defaultValue: false })
  isEmergencyContact: boolean;

  @Field(() => Boolean, { defaultValue: false })
  isGuardian: boolean;

  @Field(() => Boolean, { defaultValue: false })
  canPickupChildren: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  relationshipStart?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  relationshipEnd?: Date;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  createdBy?: string;

  @Field(() => String, { nullable: true })
  lastModifiedBy?: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  // Note: We'll add the Member relations in the resolver using @ResolveField
  // to avoid circular references
}
