import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ContentStatus } from '../enums/content-status.enum';
import { TagEntity } from './tag.entity';
import { SpeakerEntity } from './speaker.entity';
import { CategoryEntity } from './category.entity';
import { SeriesEntity } from './series.entity';

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

  @Field({ nullable: true })
  speakerId?: string;

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

  @Field({ nullable: true })
  notesUrl?: string;

  @Field({ nullable: true })
  categoryId?: string;

  @Field(() => CategoryEntity, { nullable: true })
  category?: CategoryEntity;

  @Field(() => SpeakerEntity, { nullable: true })
  speaker?: SpeakerEntity;

  @Field(() => SeriesEntity, { nullable: true })
  series?: SeriesEntity;

  @Field()
  branchId: string;

  @Field({ nullable: true })
  organisationId?: string;

  @Field(() => ContentStatus)
  status: ContentStatus;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => [TagEntity], { nullable: true })
  tags?: TagEntity[];
}
