import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ContentStatus } from '../enums/content-status.enum';

@ObjectType('Sermon')
export class SermonEntity {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  datePreached: string;

  @Field()
  speakerId: string;

  @Field({ nullable: true })
  seriesId?: string;

  @Field({ nullable: true })
  mainScripture?: string;

  @Field({ nullable: true })
  audioUrl?: string;

  @Field({ nullable: true })
  videoUrl?: string;

  @Field({ nullable: true })
  transcriptUrl?: string;

  @Field({ nullable: true })
  transcriptText?: string;

  @Field({ nullable: true })
  duration?: number;

  @Field()
  branchId: string;

  @Field(() => ContentStatus)
  status: ContentStatus;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
