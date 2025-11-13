import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class BranchSettingsEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  branchId: string;

  @Field({ nullable: true })
  branchName?: string;

  @Field({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  contactPhone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  postalCode?: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field({ nullable: true })
  language?: string;

  @Field({ nullable: true })
  dateFormat?: string;

  @Field({ nullable: true })
  timeFormat?: string;

  @Field({ nullable: true })
  weekStartDay?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  secondaryLogoUrl?: string;

  @Field({ nullable: true })
  faviconUrl?: string;

  @Field({ nullable: true })
  primaryColor?: string;

  @Field({ nullable: true })
  secondaryColor?: string;

  @Field({ nullable: true })
  accentColor?: string;

  @Field({ nullable: true })
  textColorLight?: string;

  @Field({ nullable: true })
  textColorDark?: string;

  @Field({ nullable: true })
  backgroundColor?: string;

  @Field({ nullable: true })
  theme?: string;

  @Field({ nullable: true })
  customCss?: string;

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  currencySymbol?: string;

  @Field({ nullable: true })
  currencyPosition?: string;

  @Field({ nullable: true })
  decimalPlaces?: number;

  @Field({ nullable: true })
  thousandSeparator?: string;

  @Field({ nullable: true })
  decimalSeparator?: string;

  @Field({ nullable: true })
  attendanceType?: string;

  @Field(() => [String], { nullable: true })
  attendanceMethods?: string[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
