import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class RecipientGroup {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field({ nullable: true })
  type?: string; // e.g. 'MINISTRY', 'SMALL_GROUP', 'COMMITTEE', etc.
}
