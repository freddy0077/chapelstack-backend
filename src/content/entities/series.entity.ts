import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Series')
export class SeriesEntity {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  startDate?: string;

  @Field({ nullable: true })
  endDate?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  artworkUrl?: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => String)
  branchId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
