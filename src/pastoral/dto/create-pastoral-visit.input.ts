import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { VisitType, VisitStatus } from '../entities/pastoral-visit.entity';

@InputType()
export class CreatePastoralVisitInput {
  @Field(() => ID)
  @IsNotEmpty()
  memberId: string;

  @Field(() => VisitType)
  @IsEnum(VisitType)
  visitType: VisitType;

  @Field()
  @IsNotEmpty()
  visitDate: Date;

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

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  followUpRequired?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  nextVisitDate?: Date;

  @Field(() => VisitStatus, { nullable: true, defaultValue: VisitStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(VisitStatus)
  status?: VisitStatus;
}
