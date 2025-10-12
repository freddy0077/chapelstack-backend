import {
  ObjectType,
  Field,
  ID,
  registerEnumType,
} from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { AuditAction } from '@prisma/client';

// Register AuditAction enum for GraphQL
registerEnumType(AuditAction, {
  name: 'AuditAction',
  description: 'Type of audit action performed on transaction',
});

@ObjectType()
export class TransactionAuditLog {
  @Field(() => ID)
  id: string;

  @Field()
  transactionId: string;

  @Field(() => AuditAction)
  action: AuditAction;

  @Field()
  performedBy: string;

  @Field()
  performedAt: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  previousValues?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  newValues?: any;

  @Field({ nullable: true })
  reason?: string;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;
}
