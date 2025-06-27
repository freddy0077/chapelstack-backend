import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AbsentMember {
  @Field(() => String)
  id: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => Date, { nullable: true })
  lastAttendance?: Date;
}

@ObjectType()
export class AbsenceAlertResult {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => Int)
  count: number;

  @Field(() => [AbsentMember])
  members: AbsentMember[];
}
