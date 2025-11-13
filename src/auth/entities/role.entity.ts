import { ObjectType, Field, ID, Int, GraphQLISODateTime } from '@nestjs/graphql';
import { Permission } from './permission.entity';
import { User } from './user.entity';
import { UserBranch } from './user-branch.entity';
import { Module } from './module.entity';

/**
 * Role GraphQL Entity
 * Represents a role in the centralized role management system
 */
@ObjectType()
export class Role {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  icon?: string;

  @Field(() => String, { nullable: true })
  color?: string;

  @Field(() => Int)
  level: number;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field(() => Role, { nullable: true })
  parent?: Role;

  @Field(() => [Role], { nullable: 'itemsAndList' })
  children?: Role[];

  @Field(() => Boolean, { defaultValue: true })
  isSystem: boolean;

  @Field(() => [Permission], { nullable: 'itemsAndList' })
  permissions?: Permission[];

  @Field(() => [Module], { nullable: 'itemsAndList' })
  modules?: Module[];

  @Field(() => [User], { nullable: 'itemsAndList' })
  users?: User[];

  @Field(() => [UserBranch], { nullable: 'itemsAndList' })
  userBranches?: UserBranch[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
