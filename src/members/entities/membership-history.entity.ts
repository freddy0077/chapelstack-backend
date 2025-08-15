import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { MembershipStatus } from './member.entity';

@ObjectType()
export class MembershipHistory {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  memberId: string;

  @Field(() => MembershipStatus, { nullable: true })
  fromStatus?: MembershipStatus;

  @Field(() => MembershipStatus)
  toStatus: MembershipStatus;

  @Field(() => String, { nullable: true })
  changeReason?: string;

  @Field(() => String, { nullable: true })
  fromBranchId?: string;

  @Field(() => String, { nullable: true })
  toBranchId?: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  approvedBy?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  // Note: We'll add the Member and Branch relations in the resolver using @ResolveField
  // to avoid circular references
}
