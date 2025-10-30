import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class DashboardStatsEntity {
  @Field(() => Float)
  totalIncome: number;

  @Field(() => Float)
  totalExpenses: number;

  @Field(() => Float)
  netBalance: number;

  @Field(() => Float)
  totalOfferings: number;

  @Field(() => Float, { nullable: true })
  totalTithes?: number;

  @Field(() => Float, { nullable: true })
  totalPledges?: number;
}
