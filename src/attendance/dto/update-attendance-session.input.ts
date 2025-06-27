import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateAttendanceSessionInput } from './create-attendance-session.input';

@InputType()
export class UpdateAttendanceSessionInput extends PartialType(
  CreateAttendanceSessionInput,
) {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
