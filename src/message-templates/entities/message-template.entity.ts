import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { TemplateCategory, MessageChannelType } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

// Register enums for GraphQL
registerEnumType(TemplateCategory, {
  name: 'TemplateCategory',
  description: 'Categories for message templates',
});

registerEnumType(MessageChannelType, {
  name: 'MessageChannelType',
  description: 'Communication channels for messages',
});

@ObjectType()
export class TemplateVariable {
  @Field(() => String)
  key: string;

  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  example?: string;

  @Field(() => Boolean, { nullable: true })
  required?: boolean;
}

@ObjectType()
export class MessageTemplate {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => TemplateCategory)
  category: TemplateCategory;

  @Field(() => MessageChannelType)
  type: MessageChannelType;

  @Field(() => String, { nullable: true })
  subject?: string | null;

  @Field(() => String)
  bodyText: string;

  @Field(() => String, { nullable: true })
  bodyHtml?: string | null;

  @Field(() => GraphQLJSON)
  variables: any; // Array of TemplateVariable

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Boolean)
  isSystem: boolean;

  @Field(() => Int)
  usageCount: number;

  @Field(() => String)
  organisationId: string;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field(() => String)
  createdBy: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
