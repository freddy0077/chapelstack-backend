import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { User } from '../../auth/entities/user.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class AuditLog {
  @Field(() => ID)
  id: string;

  @Field()
  action: string;

  @Field()
  entityType: string;

  @Field({ nullable: true })
  entityId?: string;

  @Field()
  description: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => ID, { nullable: true })
  branchId?: string;

  @Field(() => Branch, { nullable: true })
  branch?: Branch;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}
