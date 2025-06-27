import { Field, InputType, ID } from '@nestjs/graphql';

@InputType()
export class AllMessagesFilterInput {
  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => String, { nullable: true })
  organisationId?: string;

  @Field(() => Date, { nullable: true })
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => [String], { nullable: true })
  types?: string[]; // 'email', 'sms', 'notification'
}
