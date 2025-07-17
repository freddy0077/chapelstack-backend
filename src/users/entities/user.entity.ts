import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  firstName: string | null;

  @Field(() => String, { nullable: true })
  lastName: string | null;

  @Field(() => String)
  get name(): string {
    return (
      [this.firstName, this.lastName].filter(Boolean).join(' ') || 'Unknown'
    );
  }

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  phoneNumber: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => [String], { nullable: true })
  roles?: string[];
}
