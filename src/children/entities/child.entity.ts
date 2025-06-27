import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { ChildGuardianRelation } from './child-guardian-relation.entity';
import { CheckInRecord } from './check-in-record.entity';

@ObjectType()
export class Child {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => GraphQLISODateTime)
  dateOfBirth: Date;

  @Field(() => String, { nullable: true })
  gender: string | null;

  @Field(() => String, { nullable: true })
  allergies: string | null;

  @Field(() => String, { nullable: true })
  specialNeeds: string | null;

  @Field(() => String)
  emergencyContactName: string;

  @Field(() => String)
  emergencyContactPhone: string;

  @Field(() => Boolean)
  photoConsent: boolean;

  @Field(() => String, { nullable: true })
  notes: string | null;

  @Field(() => String)
  branchId: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  // Relations - not exposed in GraphQL by default
  guardianRelations?: ChildGuardianRelation[];
  checkInRecords?: CheckInRecord[];

  // Computed fields - optional to allow Prisma types to be assignable
  @Field(() => String, { nullable: true })
  fullName?: string;

  @Field(() => Number, { nullable: true })
  age?: number;
}
