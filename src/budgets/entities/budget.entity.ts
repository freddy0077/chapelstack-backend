import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Budget {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int)
  fiscalYear: number;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Float)
  totalSpent: number;

  @Field(() => String)
  status: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String)
  fundId: string;

  @Field(() => String, { nullable: true })
  ministryId?: string;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => String, { nullable: true })
  organisationId?: string;
}
