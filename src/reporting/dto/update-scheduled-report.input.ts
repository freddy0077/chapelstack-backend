import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { CreateScheduledReportInput } from './create-scheduled-report.input';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class UpdateScheduledReportInput extends PartialType(
  CreateScheduledReportInput,
) {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
