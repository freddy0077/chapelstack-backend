import { ObjectType, Field, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class PaymentSettingsEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => Boolean)
  autoReceipt: boolean;

  @Field({ nullable: true })
  feeBearer?: string;

  // Note: Gateway credentials are sanitized before returning
  @Field(() => GraphQLJSON, { nullable: true })
  gateways?: any;

  @Field(() => [String], { nullable: true })
  enabledMethods?: string[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
