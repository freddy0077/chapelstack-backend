import { Field, InputType } from '@nestjs/graphql';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

@InputType()
export class UpdateSeriesInput {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
