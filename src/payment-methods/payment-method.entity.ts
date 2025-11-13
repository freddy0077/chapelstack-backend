import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class PaymentMethod {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => String, { nullable: true })
  organisationId?: string | null;

  @Field(() => String, { nullable: true })
  branchId?: string | null;
}
