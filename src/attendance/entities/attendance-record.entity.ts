import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Member } from '../../members/entities/member.entity';
import { User } from '../../users/entities/user.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { AttendanceSession } from './attendance-session.entity';

@ObjectType()
export class AttendanceRecord {
  @Field(() => ID)
  id: string;

  @Field(() => GraphQLISODateTime)
  checkInTime: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  checkOutTime?: Date;

  @Field()
  checkInMethod: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => AttendanceSession, { nullable: true })
  session?: AttendanceSession;

  @Field(() => Member, { nullable: true })
  member?: Member;

  @Field({ nullable: true })
  visitorName?: string;

  @Field({ nullable: true })
  visitorEmail?: string;

  @Field({ nullable: true })
  visitorPhone?: string;

  @Field(() => User, { nullable: true })
  recordedBy?: User;

  @Field(() => Branch, { nullable: true })
  branch?: Branch;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
