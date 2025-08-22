import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class MonthlyMarriageData {
  @Field()
  month: string;

  @Field(() => Int)
  count: number;

  @Field(() => Int)
  memberMarriages: number; // Both spouses are members

  @Field(() => Int)
  mixedMarriages: number; // One spouse is member

  @Field(() => Int)
  externalMarriages: number; // Neither spouse is member
}

@ObjectType()
export class OfficiantStats {
  @Field()
  officiantId: string;

  @Field()
  officiantName: string;

  @Field(() => Int)
  marriageCount: number;

  @Field({ nullable: true })
  memberOfficiant?: boolean; // Is the officiant a church member
}

@ObjectType()
export class MarriageAnalytics {
  @Field(() => Int)
  totalMarriages: number;

  @Field(() => Int)
  memberMarriages: number; // Both spouses are members

  @Field(() => Int)
  mixedMarriages: number; // One spouse is member

  @Field(() => Int)
  externalMarriages: number; // Neither spouse is member

  @Field(() => Int)
  thisYearMarriages: number;

  @Field(() => Int)
  lastYearMarriages: number;

  @Field()
  growthPercentage: number; // Year-over-year growth

  @Field(() => [MonthlyMarriageData])
  monthlyTrends: MonthlyMarriageData[];

  @Field(() => [OfficiantStats])
  topOfficiants: OfficiantStats[];

  @Field()
  averageAge: number; // Average age of married members

  @Field(() => Int)
  upcomingAnniversaries: number; // Next 30 days
}

@ObjectType()
export class MemberMarriageHistory {
  @Field()
  memberId: string;

  @Field()
  memberName: string;

  @Field()
  spouseName: string;

  @Field({ nullable: true })
  spouseMemberId?: string;

  @Field()
  marriageDate: Date;

  @Field()
  marriageLocation: string;

  @Field()
  officiantName: string;

  @Field()
  yearsMarried: number;

  @Field()
  nextAnniversary: Date;

  @Field({ nullable: true })
  certificateUrl?: string;
}
