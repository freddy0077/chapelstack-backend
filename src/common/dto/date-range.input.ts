import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsDate } from 'class-validator';

@InputType()
export class DateRangeInput {
  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  endDate?: Date;
}
