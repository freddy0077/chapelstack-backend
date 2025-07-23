import {
  InputType,
  Field,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { PastoralVisitType, PastoralVisitStatus } from '@prisma/client';

// Register enums for GraphQL
registerEnumType(PastoralVisitType, {
  name: 'PastoralVisitType',
});

registerEnumType(PastoralVisitStatus, {
  name: 'PastoralVisitStatus',
});

@InputType()
export class CreatePastoralVisitInput {
  @Field()
  @IsUUID()
  memberId: string;

  @Field()
  @IsUUID()
  pastorId: string;

  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => PastoralVisitType)
  @IsEnum(PastoralVisitType)
  visitType: PastoralVisitType;

  @Field()
  @IsDateString()
  scheduledDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => PastoralVisitStatus, {
    defaultValue: PastoralVisitStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(PastoralVisitStatus)
  status?: PastoralVisitStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @Field()
  @IsUUID()
  organisationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

@InputType()
export class UpdatePastoralVisitInput {
  @Field()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  pastorId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => PastoralVisitType, { nullable: true })
  @IsOptional()
  @IsEnum(PastoralVisitType)
  visitType?: PastoralVisitType;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => PastoralVisitStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PastoralVisitStatus)
  status?: PastoralVisitStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;
}

@InputType()
export class PastoralVisitFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  pastorId?: string;

  @Field(() => PastoralVisitType, { nullable: true })
  @IsOptional()
  @IsEnum(PastoralVisitType)
  visitType?: PastoralVisitType;

  @Field(() => PastoralVisitStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PastoralVisitStatus)
  status?: PastoralVisitStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field()
  @IsUUID()
  organisationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

@ObjectType()
export class PastoralVisit {
  @Field()
  id: string;

  @Field()
  memberId: string;

  @Field()
  pastorId: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => PastoralVisitType)
  visitType: PastoralVisitType;

  @Field()
  scheduledDate: Date;

  @Field(() => Date, { nullable: true })
  actualDate?: Date;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => PastoralVisitStatus)
  status: PastoralVisitStatus;

  @Field(() => Date, { nullable: true })
  followUpDate?: Date;

  @Field()
  organisationId: string;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field()
  createdBy: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
