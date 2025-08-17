import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Member } from '../../members/entities/member.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Organisation } from '../../organisation/dto/organisation.model';
import { Event } from '../../events/entities/event.entity';

@ObjectType()
export class DeathRegister {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  memberId: string;

  @Field(() => GraphQLISODateTime)
  dateOfDeath: Date;

  @Field(() => String, { nullable: true })
  timeOfDeath?: string;

  @Field(() => String)
  placeOfDeath: string;

  @Field(() => String, { nullable: true })
  causeOfDeath?: string;

  @Field(() => String, { nullable: true })
  circumstances?: string;

  // Funeral Information
  @Field(() => GraphQLISODateTime, { nullable: true })
  funeralDate?: Date;

  @Field(() => String, { nullable: true })
  funeralLocation?: string;

  @Field(() => String, { nullable: true })
  funeralOfficiant?: string;

  @Field(() => BurialType)
  burialCremation: BurialType;

  @Field(() => String, { nullable: true })
  cemeteryLocation?: string;

  // Family & Contacts
  @Field(() => String)
  nextOfKin: string;

  @Field(() => String, { nullable: true })
  nextOfKinPhone?: string;

  @Field(() => String, { nullable: true })
  nextOfKinEmail?: string;

  @Field(() => Boolean)
  familyNotified: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  notificationDate?: Date;

  // Documentation
  @Field(() => String, { nullable: true })
  deathCertificateUrl?: string;

  @Field(() => String, { nullable: true })
  obituaryUrl?: string;

  @Field(() => [String])
  photoUrls: string[];

  @Field(() => [String])
  additionalDocuments: string[];

  // Administrative
  @Field(() => String)
  recordedBy: string;

  @Field(() => GraphQLISODateTime)
  recordedDate: Date;

  @Field(() => String, { nullable: true })
  lastUpdatedBy?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastUpdatedDate?: Date;

  // Foreign Keys
  @Field(() => ID, { nullable: true })
  branchId?: string;

  @Field(() => ID)
  organisationId: string;

  @Field(() => ID, { nullable: true })
  funeralEventId?: string;

  // Relations
  @Field(() => Member, { nullable: true })
  member?: Member;

  @Field(() => Branch, { nullable: true })
  branch?: Branch;

  @Field(() => Organisation, { nullable: true })
  organisation?: Organisation;

  @Field(() => Event, { nullable: true })
  funeralEvent?: Event;
}

@ObjectType()
export class DeathRegisterStats {
  @Field(() => Number)
  total: number;

  @Field(() => Number)
  thisYear: number;

  @Field(() => Number)
  thisMonth: number;

  @Field(() => Number)
  burialCount: number;

  @Field(() => Number)
  cremationCount: number;

  @Field(() => Number)
  averageAge: number;

  @Field(() => Number)
  familyNotifiedCount: number;

  @Field(() => Number)
  funeralServicesHeld: number;
}

@ObjectType()
export class MemorialDate {
  @Field(() => ID)
  memberId: string;

  @Field(() => String)
  memberName: string;

  @Field(() => GraphQLISODateTime)
  dateOfDeath: Date;

  @Field(() => Number)
  yearsAgo: number;

  @Field(() => String, { nullable: true })
  photoUrl?: string;
}

// Enum for burial type
import { registerEnumType } from '@nestjs/graphql';

export enum BurialType {
  BURIAL = 'BURIAL',
  CREMATION = 'CREMATION',
}

registerEnumType(BurialType, {
  name: 'BurialType',
  description: 'Type of burial or cremation',
});
