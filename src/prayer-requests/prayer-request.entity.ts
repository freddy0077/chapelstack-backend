import { ObjectType, Field, ID } from '@nestjs/graphql';
import { PrayerRequestStatusEnum } from './prayer-request-status.enum';
import { Member } from '../members/entities/member.entity';

@ObjectType()
export class PrayerRequest {
  @Field(() => ID)
  id: string;

  @Field()
  memberId: string;

  @Field(() => Member)
  member: Member;

  @Field()
  branchId: string;

  @Field()
  requestText: string;

  @Field(() => PrayerRequestStatusEnum)
  status: PrayerRequestStatusEnum;

  @Field({ nullable: true })
  assignedPastorId?: string;

  @Field({ nullable: true })
  organisationId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
