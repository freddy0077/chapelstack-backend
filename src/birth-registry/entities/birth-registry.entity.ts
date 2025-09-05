import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Member } from '../../members/entities/member.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Organisation } from '../../organisation/dto/organisation.model';
import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';
import { Gender } from '../../common/enums/gender.enum';

@ObjectType()
export class AdditionalDocument {
  @Field(() => String)
  name: string;

  @Field(() => String)
  url: string;

  @Field(() => String, { nullable: true })
  type?: string;
}

@ObjectType()
export class BirthRegistry {
  @Field(() => ID)
  id: string;

  // Child Information
  @Field(() => String)
  childFirstName: string;

  @Field(() => String, { nullable: true })
  childMiddleName?: string;

  @Field(() => String)
  childLastName: string;

  @Field(() => Gender)
  childGender: Gender;

  @Field(() => GraphQLISODateTime)
  dateOfBirth: Date;

  @Field(() => String, { nullable: true })
  timeOfBirth?: string;

  @Field(() => String)
  placeOfBirth: string;

  @Field(() => String, { nullable: true })
  hospitalName?: string;

  @Field(() => String, { nullable: true })
  attendingPhysician?: string;

  @Field(() => Number, { nullable: true })
  birthWeight?: number;

  @Field(() => Number, { nullable: true })
  birthLength?: number;

  @Field(() => String, { nullable: true })
  birthCircumstances?: string;

  @Field(() => String, { nullable: true })
  complications?: string;

  // Mother Information
  @Field(() => String)
  motherFirstName: string;

  @Field(() => String)
  motherLastName: string;

  @Field(() => ID, { nullable: true })
  motherMemberId?: string;

  @Field(() => Number, { nullable: true })
  motherAge?: number;

  @Field(() => String, { nullable: true })
  motherOccupation?: string;

  // Father Information
  @Field(() => String, { nullable: true })
  fatherFirstName?: string;

  @Field(() => String, { nullable: true })
  fatherLastName?: string;

  @Field(() => ID, { nullable: true })
  fatherMemberId?: string;

  @Field(() => Number, { nullable: true })
  fatherAge?: number;

  @Field(() => String, { nullable: true })
  fatherOccupation?: string;

  // Parent Contact Information
  @Field(() => String)
  parentAddress: string;

  @Field(() => String, { nullable: true })
  parentPhone?: string;

  @Field(() => String, { nullable: true })
  parentEmail?: string;

  // Baptism Planning
  @Field(() => Boolean)
  baptismPlanned: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  baptismDate?: Date;

  @Field(() => String, { nullable: true })
  baptismLocation?: string;

  @Field(() => String, { nullable: true })
  baptismOfficiant?: string;

  @Field(() => ID, { nullable: true })
  baptismEventId?: string;

  // Child Member Creation
  @Field(() => Boolean, { defaultValue: true })
  createChildMember: boolean;

  @Field(() => ID, { nullable: true })
  childMemberId?: string;

  // Documentation
  @Field(() => String, { nullable: true })
  birthCertificateUrl?: string;

  @Field(() => String, { nullable: true })
  hospitalRecordUrl?: string;

  @Field(() => [String])
  photoUrls: string[];

  @Field(() => [AdditionalDocument])
  additionalDocuments: AdditionalDocument[];

  // Administrative
  @Field(() => ID, { nullable: true })
  createdById?: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => ID, { nullable: true })
  updatedById?: string;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  // Foreign Keys
  @Field(() => ID, { nullable: true })
  branchId?: string;

  @Field(() => ID)
  organisationId: string;

  // Relations
  @Field(() => Member, { nullable: true })
  childMember?: Member;

  @Field(() => Member, { nullable: true })
  motherMember?: Member;

  @Field(() => Member, { nullable: true })
  fatherMember?: Member;

  @Field(() => Branch, { nullable: true })
  branch?: Branch;

  @Field(() => Organisation, { nullable: true })
  organisation?: Organisation;

  @Field(() => Event, { nullable: true })
  baptismEvent?: Event;

  @Field(() => User, { nullable: true })
  createdBy?: User;

  @Field(() => User, { nullable: true })
  updatedBy?: User;
}

@ObjectType()
export class BirthRegistryStats {
  @Field(() => Number)
  total: number;

  @Field(() => Number)
  thisYear: number;

  @Field(() => Number)
  thisMonth: number;

  @Field(() => Number)
  maleCount: number;

  @Field(() => Number)
  femaleCount: number;

  @Field(() => Number)
  baptismPlannedCount: number;

  @Field(() => Number)
  baptismCompletedCount: number;

  @Field(() => Number)
  averageBirthWeight: number;

  @Field(() => Number)
  hospitalBirthsCount: number;

  @Field(() => Number)
  homeBirthsCount: number;
}

@ObjectType()
export class BirthRegistryCalendarEntry {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  childName: string;

  @Field(() => GraphQLISODateTime)
  dateOfBirth: Date;

  @Field(() => String, { nullable: true })
  photoUrl?: string;

  @Field(() => Number)
  daysOld: number;

  @Field(() => Boolean)
  baptismPlanned: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  baptismDate?: Date;
}

@ObjectType()
export class ParentMember {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @Field(() => String, { nullable: true })
  profileImageUrl?: string;
}
