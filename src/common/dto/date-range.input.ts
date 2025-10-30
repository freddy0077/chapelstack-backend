import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

@InputType()
export class DateRangeInput {
  @Field(() => Date, { nullable: true })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsOptional()
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsOptional()
  endDate?: Date;
}
