import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Pledge {
  @Field(() => String)
  id: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => String)
  frequency: string;

  @Field(() => String)
  status: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String)
  memberId: string;

  @Field(() => String)
  fundId: string;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => String, { nullable: true })
  organisationId?: string;

  @Field(() => Float)
  amountFulfilled: number;
}
