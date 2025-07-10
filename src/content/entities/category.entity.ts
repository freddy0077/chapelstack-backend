import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Category')
export class CategoryEntity {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
