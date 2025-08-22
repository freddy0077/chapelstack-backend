import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UserRoleFilterInput {
  @Field(() => ID)
  organisationId: string;

  @Field(() => ID, { nullable: true })
  branchId?: string;

  @Field({ nullable: true })
  search?: string;

  @Field(() => [String])
  roles: string[];
}
