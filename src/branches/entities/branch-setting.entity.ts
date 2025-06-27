import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class BranchSetting {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { description: 'ID of the branch these settings belong to' })
  branchId: string;

  // Explicitly not exposing the full Branch object here to avoid circular dependencies in simple cases
  // If needed, a separate resolver can fetch the Branch for a BranchSetting.
  // @Field(() => Branch, { description: 'The branch these settings belong to' })
  // branch: Branch;

  @Field()
  key: string;

  @Field()
  value: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
