import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Ministry } from './ministry.entity';

@ObjectType()
export class MinistryMember {
  @Field(() => ID)
  id: string;

  @Field(() => Ministry)
  ministry: Ministry;

  @Field(() => ID)
  memberId: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  joinDate?: string;
}
