import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AddMemberToSmallGroupInput {
  @Field()
  memberId: string;

  @Field()
  smallGroupId: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  status?: string;
}
