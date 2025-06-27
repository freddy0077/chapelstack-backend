import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { Branch } from '../../branches/entities/branch.entity';
import { Organisation } from '../../organisation/dto/organisation.model';

@ObjectType()
@InputType('EmailTemplateInput')
export class EmailTemplate {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  subject: string;

  @Field()
  bodyHtml: string;

  @Field({ nullable: true })
  bodyText?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Branch, { nullable: true })
  branch?: Branch;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field(() => Organisation, { nullable: true })
  organisation?: Organisation;

  @Field(() => String, { nullable: true })
  organisationId?: string | null;
}
