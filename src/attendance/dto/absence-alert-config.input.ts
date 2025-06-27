import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

@InputType()
export class AbsenceAlertConfigInput {
  @Field(() => String)
  @IsUUID()
  branchId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  absenceThresholdDays: number;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  sendEmailAlerts?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  sendSmsAlerts?: boolean;
}
