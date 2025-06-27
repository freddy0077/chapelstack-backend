import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Speaker')
export class SpeakerEntity {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  photoUrl?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  memberId?: string;

  @Field()
  branchId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
