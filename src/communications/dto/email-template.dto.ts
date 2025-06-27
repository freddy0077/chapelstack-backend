import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EmailTemplateDto {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  subject: string;

  @Field()
  bodyHtml: string;

  @Field(() => String, { nullable: true })
  bodyText?: string | null;

  @Field()
  isActive: boolean;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
