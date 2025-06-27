import {
  ObjectType,
  Field,
  ID,
  GraphQLISODateTime,
  registerEnumType,
} from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

export enum LicenseStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
}

export enum LicenseType {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

registerEnumType(LicenseStatus, {
  name: 'LicenseStatus',
  description: 'Status of a license',
});

registerEnumType(LicenseType, {
  name: 'LicenseType',
  description: 'Type of license',
});

@ObjectType()
export class License {
  @Field(() => ID)
  id: string;

  @Field()
  key: string;

  @Field(() => LicenseType)
  type: LicenseType;

  @Field(() => LicenseStatus)
  status: LicenseStatus;

  @Field(() => GraphQLISODateTime)
  startDate: Date;

  @Field(() => GraphQLISODateTime)
  expiryDate: Date;

  @Field({ nullable: true })
  organizationName?: string;

  @Field({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  contactPhone?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  features?: Record<string, any>;

  @Field({ nullable: true })
  maxUsers?: number;

  @Field({ nullable: true })
  maxBranches?: number;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
