import { InputType, Field, registerEnumType } from '@nestjs/graphql';

@InputType()
export class MemberFilterInput {
  @Field({ nullable: true })
  groupId?: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  minAge?: number;

  @Field({ nullable: true })
  maxAge?: number;

  @Field({ nullable: true })
  search?: string;
}

export enum BirthdayRangeEnum {
  TODAY = 'TODAY',
  THIS_WEEK = 'THIS_WEEK',
  THIS_MONTH = 'THIS_MONTH',
}

registerEnumType(BirthdayRangeEnum, {
  name: 'BirthdayRangeEnum',
});
