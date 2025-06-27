import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Fund {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  goal?: number;

  @Field(() => Date, { nullable: true })
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => String)
  status: string;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => String, { nullable: true })
  organisationId?: string;
}
