import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { Family, FamilyRelationship } from './family.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { MinistryMember } from '../../ministries/entities/ministry-member.entity';
import { Gender } from '../../common/enums/gender.enum';

// Enhanced Enums
export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
  SEPARATED = 'SEPARATED',
  ENGAGED = 'ENGAGED',
  UNKNOWN = 'UNKNOWN',
}

export enum MembershipStatus {
  VISITOR = 'VISITOR',
  REGULAR_ATTENDEE = 'REGULAR_ATTENDEE',
  MEMBER = 'MEMBER',
  ACTIVE_MEMBER = 'ACTIVE_MEMBER',
  INACTIVE_MEMBER = 'INACTIVE_MEMBER',
  TRANSFERRED = 'TRANSFERRED',
  DECEASED = 'DECEASED',
  INFANT = 'INFANT',
}

export enum MembershipType {
  REGULAR = 'REGULAR',
  ASSOCIATE = 'ASSOCIATE',
  HONORARY = 'HONORARY',
  YOUTH = 'YOUTH',
  CHILD = 'CHILD',
  SENIOR = 'SENIOR',
  CLERGY = 'CLERGY',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRANSFERRED = 'TRANSFERRED',
  DECEASED = 'DECEASED',
  REMOVED = 'REMOVED',
}

export enum PrivacyLevel {
  PUBLIC = 'PUBLIC',
  STANDARD = 'STANDARD',
  RESTRICTED = 'RESTRICTED',
  PRIVATE = 'PRIVATE',
}

export enum RelationshipType {
  SPOUSE = 'SPOUSE',
  PARENT = 'PARENT',
  CHILD = 'CHILD',
  SIBLING = 'SIBLING',
  GRANDPARENT = 'GRANDPARENT',
  GRANDCHILD = 'GRANDCHILD',
  UNCLE_AUNT = 'UNCLE_AUNT',
  NEPHEW_NIECE = 'NEPHEW_NIECE',
  COUSIN = 'COUSIN',
  GUARDIAN = 'GUARDIAN',
  WARD = 'WARD',
  FRIEND = 'FRIEND',
  EMERGENCY_CONTACT = 'EMERGENCY_CONTACT',
  OTHER = 'OTHER',
}

// Register enums
registerEnumType(MemberStatus, {
  name: 'MemberStatus',
  description: 'Status of a church member',
});

registerEnumType(MaritalStatus, {
  name: 'MaritalStatus',
  description: 'Marital status options',
});

registerEnumType(MembershipStatus, {
  name: 'MembershipStatus',
  description: 'Membership status in the church',
});

registerEnumType(MembershipType, {
  name: 'MembershipType',
  description: 'Type of membership',
});

registerEnumType(PrivacyLevel, {
  name: 'PrivacyLevel',
  description: 'Privacy level for member information',
});

registerEnumType(RelationshipType, {
  name: 'RelationshipType',
  description: 'Type of relationship between members',
});

// Supporting entities
@ObjectType()
export class CommunicationPrefs {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  memberId: string;

  @Field(() => Boolean)
  emailEnabled: boolean;

  @Field(() => Boolean)
  emailNewsletter: boolean;

  @Field(() => Boolean)
  emailEvents: boolean;

  @Field(() => Boolean)
  emailReminders: boolean;

  @Field(() => Boolean)
  emailPrayer: boolean;

  @Field(() => Boolean)
  smsEnabled: boolean;

  @Field(() => Boolean)
  smsEvents: boolean;

  @Field(() => Boolean)
  smsReminders: boolean;

  @Field(() => Boolean)
  smsEmergency: boolean;

  @Field(() => Boolean)
  phoneCallsEnabled: boolean;

  @Field(() => Boolean)
  phoneEmergency: boolean;

  @Field(() => Boolean)
  physicalMail: boolean;

  @Field(() => Boolean)
  pushNotifications: boolean;

  @Field(() => String, { nullable: true })
  preferredCallTime?: string;

  @Field(() => [String])
  doNotDisturbDays: string[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

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
  preferredName?: string | null;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  alternativeEmail?: string | null;

  @Field(() => String, { nullable: true })
  profileImageUrl?: string | null;

  @Field(() => String, { nullable: true })
  phoneNumber?: string | null;

  @Field(() => String, { nullable: true })
  alternatePhone?: string | null;

  @Field(() => String, { nullable: true })
  rfidCardId?: string | null;

  @Field(() => String, { nullable: true })
  nfcId?: string | null;

  @Field(() => String, { nullable: true })
  address?: string | null;

  @Field(() => String, { nullable: true })
  addressLine2?: string | null;

  @Field(() => String, { nullable: true })
  city?: string | null;

  @Field(() => String, { nullable: true })
  state?: string | null;

  @Field(() => String, { nullable: true })
  postalCode?: string | null;

  @Field(() => String, { nullable: true })
  country?: string | null;

  @Field(() => String, { nullable: true })
  district?: string | null;

  @Field(() => String, { nullable: true })
  region?: string | null;

  @Field(() => String, { nullable: true })
  digitalAddress?: string | null;

  @Field(() => String, { nullable: true })
  landmark?: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  dateOfBirth?: Date | null;

  @Field(() => String, { nullable: true })
  placeOfBirth?: string | null;

  @Field(() => String, { nullable: true })
  nationality?: string | null;

  @Field(() => String, { nullable: true })
  nlbNumber?: string | null;

  @Field(() => String, { nullable: true })
  fatherName?: string | null;

  @Field(() => String, { nullable: true })
  motherName?: string | null;

  @Field(() => String, { nullable: true })
  fatherOccupation?: string | null;

  @Field(() => String, { nullable: true })
  motherOccupation?: string | null;

  @Field(() => Gender)
  gender: Gender;

  @Field(() => MaritalStatus)
  maritalStatus: MaritalStatus;

  @Field(() => String, { nullable: true })
  occupation?: string | null;

  @Field(() => String, { nullable: true })
  employerName?: string | null;

  @Field(() => String, { nullable: true })
  education?: string | null;

  @Field(() => MemberStatus)
  status: MemberStatus;

  @Field(() => MembershipStatus)
  membershipStatus: MembershipStatus;

  @Field(() => MembershipType)
  membershipType: MembershipType;

  @Field(() => GraphQLISODateTime, { nullable: true })
  membershipDate?: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  baptismDate?: Date | null;

  @Field(() => String, { nullable: true })
  baptismLocation?: string | null;

  @Field(() => String, { nullable: true })
  affidavitUrl?: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  confirmationDate?: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  salvationDate?: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  statusChangeDate?: Date | null;

  @Field(() => String, { nullable: true })
  statusChangeReason?: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  customFields?: any;

  @Field(() => PrivacyLevel)
  privacyLevel: PrivacyLevel;

  @Field(() => GraphQLJSON, { nullable: true })
  privacySettings?: any;

  @Field(() => String)
  preferredLanguage: string;

  @Field(() => String, { nullable: true })
  notes?: string | null;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field(() => String, { nullable: true })
  organisationId?: string | null;

  @Field(() => String, { nullable: true })
  spouseId?: string | null;

  @Field(() => String, { nullable: true })
  parentId?: string | null;

  @Field(() => String, { nullable: true })
  familyId?: string | null;

  @Field(() => Boolean)
  headOfHousehold: boolean;

  // Single unified member identifier
  @Field(() => String, { nullable: true })
  memberId?: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  memberIdGeneratedAt?: Date | null;

  // Optional: Physical card metadata
  @Field(() => Boolean)
  cardIssued: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  cardIssuedAt?: Date | null;

  @Field(() => String, { nullable: true })
  cardType?: string | null;

  @Field(() => Boolean)
  isRegularAttendee: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastAttendanceDate?: Date | null;

  @Field(() => Boolean)
  isDeactivated: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  deactivatedAt?: Date | null;

  @Field(() => String, { nullable: true })
  deactivatedBy?: string | null;

  @Field(() => String, { nullable: true })
  deactivationReason?: string | null;

  // Emergency Contact
  @Field(() => String, { nullable: true })
  emergencyContactName?: string | null;

  @Field(() => String, { nullable: true })
  emergencyContactPhone?: string | null;

  @Field(() => String, { nullable: true })
  emergencyContactRelation?: string | null;

  // GDPR Compliance
  @Field(() => GraphQLISODateTime, { nullable: true })
  consentDate?: Date | null;

  @Field(() => String, { nullable: true })
  consentVersion?: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  dataRetentionDate?: Date | null;

  // Special Gifts and Talents
  @Field(() => String, { nullable: true })
  specialGifts?: string | null;

  // Soft Delete
  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt?: Date | null;

  @Field(() => String, { nullable: true })
  deletedBy?: string | null;

  @Field(() => String, { nullable: true })
  deletionReason?: string | null;

  @Field(() => String, { nullable: true })
  createdBy?: string | null;

  @Field(() => String, { nullable: true })
  lastModifiedBy?: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  // Relations
  @Field(() => Branch, { nullable: true })
  branch?: Branch | null;

  @Field(() => [Member], { nullable: true })
  children?: Member[];

  @Field(() => Member, { nullable: true })
  spouse?: Member | null;

  @Field(() => Member, { nullable: true })
  parent?: Member | null;

  @Field(() => [MinistryMember], { nullable: true })
  ministryMemberships?: MinistryMember[];

  @Field(() => [GraphQLJSON], { nullable: true })
  groupMemberships?: any[];

  @Field(() => [GraphQLJSON], { nullable: true })
  attendanceRecords?: any[];

  @Field(() => [GraphQLJSON], { nullable: true })
  sacramentalRecords?: any[];

  @Field(() => GraphQLJSON, { nullable: true })
  guardianProfile?: any;

  // Enhanced Relations
  @Field(() => CommunicationPrefs, { nullable: true })
  communicationPrefs?: CommunicationPrefs | null;
}
