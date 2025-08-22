import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

// Enums for certificate management
export enum ChurchDenomination {
  CATHOLIC = 'CATHOLIC',
  ORTHODOX = 'ORTHODOX',
  ANGLICAN = 'ANGLICAN',
  LUTHERAN = 'LUTHERAN',
  METHODIST = 'METHODIST',
  BAPTIST = 'BAPTIST',
  PRESBYTERIAN = 'PRESBYTERIAN',
  PENTECOSTAL = 'PENTECOSTAL',
  EVANGELICAL = 'EVANGELICAL',
  REFORMED = 'REFORMED',
  EPISCOPAL = 'EPISCOPAL',
  ADVENTIST = 'ADVENTIST',
  CONGREGATIONAL = 'CONGREGATIONAL',
  MENNONITE = 'MENNONITE',
  QUAKER = 'QUAKER',
  NONDENOMINATIONAL = 'NONDENOMINATIONAL',
  INTERDENOMINATIONAL = 'INTERDENOMINATIONAL',
}

export enum CertificateSacramentType {
  BAPTISM = 'BAPTISM',
  INFANT_BAPTISM = 'INFANT_BAPTISM',
  ADULT_BAPTISM = 'ADULT_BAPTISM',
  IMMERSION_BAPTISM = 'IMMERSION_BAPTISM',
  EUCHARIST_FIRST_COMMUNION = 'EUCHARIST_FIRST_COMMUNION',
  CONFIRMATION = 'CONFIRMATION',
  MATRIMONY = 'MATRIMONY',
  ORDINATION = 'ORDINATION',
  RECONCILIATION = 'RECONCILIATION',
  ANOINTING_OF_THE_SICK = 'ANOINTING_OF_THE_SICK',
  DEDICATION = 'DEDICATION',
  MEMBERSHIP = 'MEMBERSHIP',
  BLESSING = 'BLESSING',
}

export enum LiturgicalElementType {
  SCRIPTURE = 'SCRIPTURE',
  PRAYER = 'PRAYER',
  BLESSING = 'BLESSING',
  CREED = 'CREED',
  HYMN = 'HYMN',
}

export enum LiturgicalElementPosition {
  HEADER = 'HEADER',
  BODY = 'BODY',
  FOOTER = 'FOOTER',
}

export enum TemplateFieldType {
  TEXT = 'TEXT',
  DATE = 'DATE',
  SIGNATURE = 'SIGNATURE',
  SEAL = 'SEAL',
  IMAGE = 'IMAGE',
}

export enum BorderStyle {
  CLASSIC = 'CLASSIC',
  MODERN = 'MODERN',
  ORNATE = 'ORNATE',
  SIMPLE = 'SIMPLE',
}

export enum FontWeight {
  NORMAL = 'NORMAL',
  BOLD = 'BOLD',
  LIGHT = 'LIGHT',
}

export enum TextAlignment {
  LEFT = 'LEFT',
  CENTER = 'CENTER',
  RIGHT = 'RIGHT',
}

export enum LogoPosition {
  TOP_CENTER = 'TOP_CENTER',
  TOP_LEFT = 'TOP_LEFT',
  TOP_RIGHT = 'TOP_RIGHT',
  BOTTOM_CENTER = 'BOTTOM_CENTER',
}

// Register enums with GraphQL
registerEnumType(ChurchDenomination, { name: 'ChurchDenomination' });
registerEnumType(CertificateSacramentType, {
  name: 'CertificateSacramentType',
});
registerEnumType(LiturgicalElementType, { name: 'LiturgicalElementType' });
registerEnumType(LiturgicalElementPosition, {
  name: 'LiturgicalElementPosition',
});
registerEnumType(TemplateFieldType, { name: 'TemplateFieldType' });
registerEnumType(BorderStyle, { name: 'BorderStyle' });
registerEnumType(FontWeight, { name: 'FontWeight' });
registerEnumType(TextAlignment, { name: 'TextAlignment' });
registerEnumType(LogoPosition, { name: 'LogoPosition' });

@ObjectType()
export class FieldPosition {
  @Field()
  x: number;

  @Field()
  y: number;
}

@ObjectType()
export class FieldStyle {
  @Field()
  fontSize: number;

  @Field(() => FontWeight)
  fontWeight: FontWeight;

  @Field()
  color: string;

  @Field(() => TextAlignment)
  alignment: TextAlignment;
}

@ObjectType()
export class TemplateField {
  @Field(() => ID)
  id: string;

  @Field()
  label: string;

  @Field(() => TemplateFieldType)
  type: TemplateFieldType;

  @Field()
  required: boolean;

  @Field({ nullable: true })
  defaultValue?: string;

  @Field(() => FieldPosition)
  position: FieldPosition;

  @Field(() => FieldStyle)
  styling: FieldStyle;
}

@ObjectType()
export class LiturgicalElement {
  @Field(() => LiturgicalElementType)
  type: LiturgicalElementType;

  @Field()
  content: string;

  @Field(() => LiturgicalElementPosition)
  position: LiturgicalElementPosition;

  @Field()
  optional: boolean;
}

@ObjectType()
export class TemplateStyle {
  @Field()
  primaryColor: string;

  @Field()
  secondaryColor: string;

  @Field()
  accentColor: string;

  @Field()
  fontFamily: string;

  @Field()
  headerFont: string;

  @Field()
  bodyFont: string;

  @Field(() => BorderStyle)
  borderStyle: BorderStyle;

  @Field({ nullable: true })
  backgroundPattern?: string;

  @Field(() => LogoPosition)
  logoPosition: LogoPosition;
}

@ObjectType()
export class CertificateTemplate {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ChurchDenomination)
  denomination: ChurchDenomination;

  @Field(() => CertificateSacramentType)
  sacramentType: CertificateSacramentType;

  @Field()
  description: string;

  @Field()
  previewUrl: string;

  @Field()
  templateUrl: string;

  @Field()
  isDefault: boolean;

  @Field(() => [LiturgicalElement])
  liturgicalElements: LiturgicalElement[];

  @Field(() => [TemplateField])
  customFields: TemplateField[];

  @Field(() => TemplateStyle)
  styling: TemplateStyle;

  @Field()
  language: string;

  @Field({ nullable: true })
  region?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
