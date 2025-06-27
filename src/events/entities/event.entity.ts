import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class Event {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLISODateTime)
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field({ nullable: true })
  organisationId?: string;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  updatedBy?: string;
}
