import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Branch } from '../../branches/entities/branch.entity';

@ObjectType()
export class Setting {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  key: string;

  @Field(() => String)
  value: string; // Can be simple string or JSON stringified

  @Field(() => ID, { nullable: true })
  branchId?: string | null;

  @Field(() => Branch, { nullable: true })
  branch?: Branch | null; // For GraphQL relation

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
