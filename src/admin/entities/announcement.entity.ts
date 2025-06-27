import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class Announcement {
  @Field(() => ID)
  id: string;

  @Field()
  key: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => GraphQLISODateTime)
  startDate: Date;

  @Field(() => GraphQLISODateTime)
  endDate: Date;

  @Field(() => [ID], { nullable: true })
  targetRoleIds?: string[];

  @Field(() => [ID], { nullable: true })
  targetBranchIds?: string[];

  @Field()
  isActive: boolean;
}
