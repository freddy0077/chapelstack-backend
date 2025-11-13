import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Category')
export class CategoryEntity {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;
}
