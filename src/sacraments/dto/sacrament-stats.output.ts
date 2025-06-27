import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SacramentStatsOutput {
  @Field()
  sacramentType: string;

  @Field()
  count: number;

  @Field({ nullable: true })
  trend?: 'up' | 'down' | 'neutral';

  @Field({ nullable: true })
  percentage?: number;

  @Field({ nullable: true })
  period?: string;
}
