import { Field, InputType } from '@nestjs/graphql';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

@InputType()
export class CreateSeriesInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  artworkUrl?: string;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  branchId: string;
}
