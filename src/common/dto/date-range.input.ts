import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';

@InputType()
export class DateRangeInput {
  @Field(() => Date)
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  startDate: Date;

  @Field(() => Date)
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  endDate: Date;
}
