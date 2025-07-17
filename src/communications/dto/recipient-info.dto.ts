import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RecipientInfoDto {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  fullName?: string;
}
