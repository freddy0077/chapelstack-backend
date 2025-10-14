import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { PastoralVisitType, PastoralVisitStatus } from '@prisma/client';

@InputType()
export class CreatePastoralVisitInput {
  @Field(() => ID)
  @IsNotEmpty()
  memberId: string;

  @Field(() => ID)
  @IsNotEmpty()
  pastorId: string;

  @Field()
  @IsNotEmpty()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => String)
  @IsEnum(PastoralVisitType)
  visitType: string;

  @Field()
  @IsNotEmpty()
  scheduledDate: Date;

  @Field({ nullable: true })
  @IsOptional()
  actualDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  privateNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  actionItems?: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  followUpNeeded?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  followUpDate?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(PastoralVisitStatus)
  status?: string;
}
