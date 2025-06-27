import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('RoleProfile')
export class RoleType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
