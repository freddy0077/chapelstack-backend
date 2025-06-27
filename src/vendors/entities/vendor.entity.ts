import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Vendor {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  contactPerson?: string;

  @Field(() => String, { nullable: true })
  contactEmail?: string;

  @Field(() => String, { nullable: true })
  contactPhone?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => String, { nullable: true })
  organisationId?: string;
}
