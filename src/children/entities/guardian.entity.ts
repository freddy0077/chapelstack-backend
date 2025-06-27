import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { ChildGuardianRelation } from './child-guardian-relation.entity';
import { CheckInRecord } from './check-in-record.entity';

@ObjectType()
export class Guardian {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  memberId: string | null;

  @Field(() => String, { nullable: true })
  firstName: string | null;

  @Field(() => String, { nullable: true })
  lastName: string | null;

  @Field(() => String)
  relationship: string;

  @Field(() => Boolean)
  isPrimaryGuardian: boolean;

  @Field(() => Boolean)
  canPickup: boolean;

  @Field(() => String)
  phone: string;

  @Field(() => String, { nullable: true })
  email: string | null;

  @Field(() => String, { nullable: true })
  address: string | null;

  @Field(() => String, { nullable: true })
  notes: string | null;

  @Field(() => String)
  branchId: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  // Relations - not exposed in GraphQL by default
  childRelations?: ChildGuardianRelation[];
  checkInsPerformed?: CheckInRecord[];
  checkOutsPerformed?: CheckInRecord[];

  // Computed field - optional to allow Prisma types to be assignable
  @Field(() => String, { nullable: true })
  fullName?: string;
}
