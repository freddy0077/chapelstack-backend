import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class AnnouncementTemplateCreator {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  firstName: string | null;

  @Field(() => String, { nullable: true })
  lastName: string | null;

  @Field(() => String)
  email: string;
}

@ObjectType()
export class AnnouncementTemplate {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  category: string;

  @Field(() => String)
  content: string;

  @Field(() => String, { nullable: true })
  branchId: string | null;

  @Field(() => Branch, { nullable: true })
  branch?: Branch;

  @Field(() => Boolean)
  isSystem: boolean;

  @Field(() => String)
  createdBy: string;

  @Field(() => AnnouncementTemplateCreator)
  creator: AnnouncementTemplateCreator;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
