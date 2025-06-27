import { Field, ObjectType } from '@nestjs/graphql';
import { PrayerRequestStatus } from '@prisma/client';

@ObjectType()
export class PrayerRequestGraphqlJson {
  @Field()
  id: string;

  @Field()
  memberId: string;

  @Field()
  branchId: string;

  @Field()
  requestText: string;

  @Field(() => PrayerRequestStatus)
  status: PrayerRequestStatus;

  @Field({ nullable: true })
  assignedPastorId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
