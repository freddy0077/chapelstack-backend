import { SermonEntity } from '../entities/sermon.entity';
import { Sermon } from '@prisma/client';
import { ContentStatus } from '../enums/content-status.enum';
import { TagEntity } from '../entities/tag.entity';
import { CategoryEntity } from '../entities/category.entity';
import { SpeakerEntity } from '../entities/speaker.entity';
import { SeriesEntity } from '../entities/series.entity';

/**
 * Maps a Prisma Sermon model to a GraphQL SermonEntity
 * @param sermon The Prisma Sermon model to map
 * @returns The mapped GraphQL SermonEntity
 */
export function mapToSermonEntity(sermon: any): SermonEntity {
  return {
    id: sermon.id,
    title: sermon.title,
    description: sermon.description || undefined,
    datePreached: sermon.datePreached.toISOString(),
    speakerId: sermon.speakerId,
    seriesId: sermon.seriesId || undefined,
    mainScripture: sermon.mainScripture || undefined,
    audioUrl: sermon.audioUrl || undefined,
    videoUrl: sermon.videoUrl || undefined,
    transcriptUrl: sermon.transcriptUrl || undefined,
    transcriptText: sermon.transcriptText || undefined,
    duration: sermon.duration || undefined,
    notesUrl: sermon.notesUrl || undefined,
    branchId: sermon.branchId,
    organisationId: sermon.organisationId || undefined,
    status: sermon.status as unknown as ContentStatus,
    createdAt: sermon.createdAt.toISOString(),
    updatedAt: sermon.updatedAt.toISOString(),
    tags: sermon.tags ? sermon.tags.map(mapToTagEntity) : [],
    speaker: sermon.speaker ? mapToSpeakerEntity(sermon.speaker) : undefined,
    series: sermon.series ? mapToSeriesEntity(sermon.series) : undefined,
    category: sermon.category
      ? mapToCategoryEntity(sermon.category)
      : undefined,
    categoryId: sermon.categoryId || undefined,
  };
}

function mapToTagEntity(tag: any): TagEntity {
  return {
    id: tag.id,
    name: tag.name,
  };
}

function mapToCategoryEntity(category: any): CategoryEntity {
  return {
    id: category.id,
    name: category.name,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

function mapToSpeakerEntity(speaker: any): SpeakerEntity {
  return {
    id: speaker.id,
    name: speaker.name,
    bio: speaker.bio || undefined,
    imageUrl: speaker.imageUrl || undefined,
    createdAt: speaker.createdAt.toISOString(),
    updatedAt: speaker.updatedAt.toISOString(),
    branchId: speaker.branchId,
    memberId: speaker.memberId || undefined,
  };
}

function mapToSeriesEntity(series: any): SeriesEntity {
  return {
    id: series.id,
    title: series.title,
    description: series.description || undefined,
    artworkUrl: series.artworkUrl || undefined,
    startDate: series.startDate ? series.startDate.toISOString() : undefined,
    endDate: series.endDate ? series.endDate.toISOString() : undefined,
    createdAt: series.createdAt.toISOString(),
    updatedAt: series.updatedAt.toISOString(),
    branchId: series.branchId,
    isActive: series.isActive,
  };
}

/**
 * Maps an array of Prisma Sermon models to GraphQL SermonEntity objects
 * @param sermons The array of Prisma Sermon models to map
 * @returns The array of mapped GraphQL SermonEntity objects
 */
export function mapToSermonEntities(sermons: Sermon[]): SermonEntity[] {
  return sermons.map(mapToSermonEntity);
}
