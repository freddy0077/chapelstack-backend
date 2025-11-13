import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class SystemAnnouncement {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  key: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;

  @Field(() => GraphQLISODateTime)
  startDate: Date;

  @Field(() => GraphQLISODateTime)
  endDate: Date;

  @Field(() => [ID], { nullable: true })
  targetRoleIds?: string[];

  @Field(() => [ID], { nullable: true })
  targetBranchIds?: string[];

  @Field(() => Boolean)
  isActive: boolean;
}
