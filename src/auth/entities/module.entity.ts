import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Role } from './role.entity';

/**
 * Module GraphQL Entity
 * Represents a module in the centralized role management system
 */
@ObjectType()
export class Module {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  displayName: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field(() => String)
  path: string;

  @Field({ nullable: true })
  category?: string;

  @Field(() => Boolean)
  isSystem: boolean;

  @Field(() => [Role], { nullable: 'itemsAndList' })
  roles?: Role[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
