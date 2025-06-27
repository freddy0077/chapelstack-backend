import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Member } from './member.entity';
import { GraphQLJSON } from 'graphql-type-json';

export enum MilestoneType {
  BAPTISM = 'BAPTISM',
  FIRST_COMMUNION = 'FIRST_COMMUNION',
  CONFIRMATION = 'CONFIRMATION',
  MARRIAGE = 'MARRIAGE',
  DEDICATION = 'DEDICATION',
  ORDINATION = 'ORDINATION',
  OTHER = 'OTHER',
}

registerEnumType(MilestoneType, {
  name: 'MilestoneType',
  description: 'Type of spiritual milestone',
});

@ObjectType()
export class SpiritualMilestone {
  @Field(() => ID)
  id: string;

  @Field(() => MilestoneType)
  type: MilestoneType;

  @Field(() => GraphQLISODateTime)
  date: Date;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => String, { nullable: true })
  performedBy?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  additionalDetails?: any;

  @Field(() => Member)
  member: Member;

  @Field(() => ID)
  memberId: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
