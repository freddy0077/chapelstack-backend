import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Series')
export class SeriesEntity {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  startDate: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field()
  isActive: boolean;

  @Field()
  branchId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
