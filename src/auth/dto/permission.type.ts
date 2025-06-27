import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('PermissionProfile')
export class PermissionType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  action: string;

  @Field(() => String)
  subject: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
