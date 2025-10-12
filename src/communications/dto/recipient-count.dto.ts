import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';

@InputType()
export class GetRecipientCountInput {
  @Field(() => [String], { nullable: true })
  memberIds?: string[];

  @Field(() => [String], { nullable: true })
  groupIds?: string[];

  @Field(() => [String], { nullable: true })
  filters?: string[];

  @Field({ nullable: true })
  birthdayRange?: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field({ nullable: true })
  organisationId?: string;
}

@ObjectType()
export class RecipientBreakdown {
  @Field()
  source: string; // "group", "filter", "birthday", "individual"

  @Field()
  name: string; // Group name, filter name, etc.

  @Field(() => Int)
  count: number;

  @Field({ nullable: true })
  id?: string;
}

@ObjectType()
export class RecipientCountResponse {
  @Field(() => Int)
  totalMembers: number;

  @Field(() => Int)
  uniqueMembers: number;

  @Field(() => Int)
  duplicateCount: number;

  @Field(() => [RecipientBreakdown])
  breakdown: RecipientBreakdown[];

  @Field({ nullable: true })
  message?: string;
}
