import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Speaker')
export class SpeakerEntity {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  memberId?: string;

  @Field({ nullable: true })
  photoUrl?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  website?: string;

  @Field(() => String)
  branchId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
