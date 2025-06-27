import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('BranchProfile')
export class BranchType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  address?: string | null;

  @Field(() => String, { nullable: true })
  city?: string | null;

  @Field(() => String, { nullable: true })
  state?: string | null;

  @Field(() => String, { nullable: true })
  postalCode?: string | null;

  @Field(() => String, { nullable: true })
  country?: string | null;

  @Field(() => String, { nullable: true })
  phoneNumber?: string | null;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  website?: string | null;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  establishedAt?: Date | null;
}
