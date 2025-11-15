import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsBoolean, IsEnum, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class UpdatePaymentSettingsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currency?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  autoReceipt?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['CUSTOMER', 'ORGANIZATION', 'SPLIT'])
  feeBearer?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  gateways?: any;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  enabledMethods?: string[];
}

@InputType()
export class UpdateGatewayInput {
  @Field()
  @IsString()
  gateway: string;

  @Field(() => GraphQLJSON)
  config: any;
}

@InputType()
export class ValidateGatewayInput {
  @Field()
  @IsString()
  gateway: string;

  @Field(() => GraphQLJSON)
  credentials: any;
}
