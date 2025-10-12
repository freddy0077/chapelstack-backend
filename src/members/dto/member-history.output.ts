import { ObjectType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class MemberHistoryUser {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;
}

@ObjectType()
export class MemberHistoryEntry {
  @Field(() => String)
  id: string;

  @Field(() => String)
  action: string;

  @Field(() => String)
  entityType: string;

  @Field(() => String, { nullable: true })
  entityId?: string;

  @Field(() => String)
  description: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => MemberHistoryUser, { nullable: true })
  user?: MemberHistoryUser;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => String, { nullable: true })
  ipAddress?: string;

  @Field(() => String, { nullable: true })
  userAgent?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
