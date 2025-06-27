import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class Organisation {
  @Field(() => ID)
  id: string;
  @Field()
  name: string;
  @Field({ nullable: true })
  email?: string;
  @Field({ nullable: true })
  phoneNumber?: string;
  @Field({ nullable: true })
  website?: string;
  @Field({ nullable: true })
  address?: string;
  @Field({ nullable: true })
  city?: string;
  @Field({ nullable: true })
  state?: string;
  @Field({ nullable: true })
  country?: string;
  @Field({ nullable: true })
  zipCode?: string;
  @Field({ nullable: true })
  denomination?: string;
  @Field({ nullable: true })
  foundingYear?: number;
  @Field({ nullable: true })
  size?: string;
  @Field({ nullable: true })
  vision?: string;
  @Field({ nullable: true })
  missionStatement?: string;
  @Field({ nullable: true })
  description?: string;
  @Field({ nullable: true })
  timezone?: string;
  @Field({ nullable: true })
  currency?: string;
  @Field()
  primaryColor: string;
  @Field()
  secondaryColor: string;
  @Field({ nullable: true })
  accentColor?: string;
  @Field({ nullable: true })
  logoUrl?: string;
  @Field({ nullable: true })
  faviconUrl?: string;
  @Field({ nullable: true })
  slogan?: string;
  @Field({ nullable: true })
  brandFont?: string;
  @Field({ nullable: true })
  socialHandle?: string;
  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
