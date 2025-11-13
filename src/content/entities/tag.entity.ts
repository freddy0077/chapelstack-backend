import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Tag')
export class TagEntity {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;
}
