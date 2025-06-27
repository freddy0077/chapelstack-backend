import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Role } from './role.entity';

@ObjectType()
export class Permission {
  @Field(() => ID)
  id: string;

  @Field()
  action: string;

  @Field()
  subject: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [Role], { nullable: 'itemsAndList' })
  roles?: Role[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
