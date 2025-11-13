import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Role } from './role.entity';

/**
 * Permission GraphQL Entity
 * Represents a permission in the centralized role management system
 */
@ObjectType()
export class Permission {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  action: string;

  @Field(() => String)
  subject: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => String)
  category: string;

  @Field(() => Boolean, { nullable: true })
  isSystem?: boolean;

  @Field(() => [Role], { nullable: 'itemsAndList' })
  roles?: Role[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
