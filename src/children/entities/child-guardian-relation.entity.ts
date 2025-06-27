import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Child } from './child.entity';
import { Guardian } from './guardian.entity';

@ObjectType()
export class ChildGuardianRelation {
  @Field(() => ID)
  id: string;

  @Field()
  childId: string;

  @Field()
  guardianId: string;

  @Field()
  relationship: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  // Relations - can be exposed via resolvers when needed
  child?: Child;
  guardian?: Guardian;
}
