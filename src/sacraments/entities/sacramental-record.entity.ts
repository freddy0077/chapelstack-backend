import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SacramentType } from '@prisma/client';

// Define the enum values explicitly
export enum SacramentTypeEnum {
  BAPTISM = 'BAPTISM',
  EUCHARIST_FIRST_COMMUNION = 'EUCHARIST_FIRST_COMMUNION',
  CONFIRMATION = 'CONFIRMATION',
  RECONCILIATION_FIRST = 'RECONCILIATION_FIRST',
  ANOINTING_OF_THE_SICK = 'ANOINTING_OF_THE_SICK',
  HOLY_ORDERS_DIACONATE = 'HOLY_ORDERS_DIACONATE',
  HOLY_ORDERS_PRIESTHOOD = 'HOLY_ORDERS_PRIESTHOOD',
  MATRIMONY = 'MATRIMONY',
  RCIA_INITIATION = 'RCIA_INITIATION',
  OTHER = 'OTHER',
}

registerEnumType(SacramentTypeEnum, {
  name: 'SacramentType',
  description: 'Types of sacraments administered in the church',
});

@ObjectType()
export class SacramentalRecord {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  memberId: string;

  @Field(() => SacramentTypeEnum)
  sacramentType: SacramentType;

  @Field(() => Date)
  dateOfSacrament: Date;

  @Field(() => String)
  locationOfSacrament: string;

  @Field(() => String)
  officiantName: string;

  @Field(() => String, { nullable: true })
  officiantId: string | null;

  @Field(() => String, { nullable: true })
  godparent1Name: string | null;

  @Field(() => String, { nullable: true })
  godparent2Name: string | null;

  @Field(() => String, { nullable: true })
  sponsorName: string | null;

  @Field(() => String, { nullable: true })
  witness1Name: string | null;

  @Field(() => String, { nullable: true })
  witness2Name: string | null;

  @Field(() => String, { nullable: true })
  certificateNumber: string | null;

  @Field(() => String, { nullable: true })
  certificateUrl: string | null;

  @Field(() => String, { nullable: true })
  notes: string | null;

  @Field(() => String)
  branchId: string;

  @Field(() => String, { nullable: true })
  organisationId: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
