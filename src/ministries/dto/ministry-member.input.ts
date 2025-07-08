import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class AddMemberToMinistryInput {
  @Field(() => ID)
  ministryId: string;

  @Field(() => ID)
  memberId: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  joinDate?: string;
}
