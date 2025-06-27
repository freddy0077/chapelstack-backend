import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { Family, FamilyRelationship } from './family.entity';
import { Branch } from '../../branches/entities/branch.entity';

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  VISITOR = 'VISITOR',
  DECEASED = 'DECEASED',
  TRANSFERRED = 'TRANSFERRED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
  SEPARATED = 'SEPARATED',
  OTHER = 'OTHER',
}

registerEnumType(MemberStatus, {
  name: 'MemberStatus',
  description: 'Status of a church member',
});

registerEnumType(Gender, {
  name: 'Gender',
  description: 'Gender options',
});

registerEnumType(MaritalStatus, {
  name: 'MaritalStatus',
  description: 'Marital status options',
});

@ObjectType()
export class Member {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String, { nullable: true })
  middleName?: string | null;

  @Field(() => String)
  lastName: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  phoneNumber?: string | null;

  @Field(() => String, { nullable: true })
  address?: string | null;

  @Field(() => String, { nullable: true })
  city?: string | null;

  @Field(() => String, { nullable: true })
  state?: string | null;

  @Field(() => String, { nullable: true })
  postalCode?: string | null;

  @Field(() => String, { nullable: true })
  country?: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  dateOfBirth?: Date | null;

  @Field(() => Gender, { nullable: true })
  gender?: string | null;

  @Field(() => MaritalStatus, { nullable: true })
  maritalStatus?: string | null;

  @Field(() => String, { nullable: true })
  occupation?: string | null;

  @Field(() => String, { nullable: true })
  employerName?: string | null;

  @Field(() => MemberStatus)
  status: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  membershipDate?: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  baptismDate?: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  confirmationDate?: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  statusChangeDate?: Date | null;

  @Field(() => String, { nullable: true })
  statusChangeReason?: string | null;

  @Field(() => String, { nullable: true })
  profileImageUrl?: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  customFields?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  privacySettings?: any;

  @Field(() => String, { nullable: true })
  notes?: string | null;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field(() => String, { nullable: true })
  spouseId?: string | null;

  @Field(() => [Member], { nullable: true })
  children?: Member[];

  @Field(() => String, { nullable: true })
  parentId?: string | null;

  @Field(() => String, { nullable: true })
  rfidCardId?: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => [GraphQLJSON], { nullable: true })
  groupMemberships?: any[];

  @Field(() => [GraphQLJSON], { nullable: true })
  attendanceRecords?: any[];

  @Field(() => [GraphQLJSON], { nullable: true })
  sacramentalRecords?: any[];

  @Field(() => GraphQLJSON, { nullable: true })
  guardianProfile?: any;

  @Field(() => [GraphQLJSON], { nullable: true })
  notifications?: any[];

  @Field(() => [GraphQLJSON], { nullable: true })
  prayerRequests?: any[];

  @Field(() => [GraphQLJSON], { nullable: true })
  contributions?: any[];

  @Field(() => [FamilyRelationship], { nullable: true })
  familyRelationships?: FamilyRelationship[];

  @Field(() => [Family], { nullable: true })
  families?: Family[];

  @Field(() => String, { nullable: true })
  organisationId: string | null;

  @Field(() => Branch, { nullable: true })
  branch?: Branch | null;

  @Field(() => Member, { nullable: true })
  spouse?: Member | null;

  @Field(() => Member, { nullable: true })
  parent?: Member | null;
}
