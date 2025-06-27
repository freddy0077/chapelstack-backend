import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SacramentAnniversaryOutput {
  @Field()
  name: string;

  @Field()
  sacramentType: string;

  @Field()
  anniversaryType: string;

  @Field()
  date: Date;

  @Field({ nullable: true })
  isSpecial?: boolean;

  @Field({ nullable: true })
  timeUntil?: string;
}
