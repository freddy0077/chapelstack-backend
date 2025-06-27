import { Sermon } from '@prisma/client';
import { SermonEntity } from '../entities/sermon.entity';
import { ContentStatus } from '../enums/content-status.enum';

/**
 * Maps a Prisma Sermon model to a GraphQL SermonEntity
 */
export function mapToSermonEntity(sermon: Sermon): SermonEntity {
  return {
    id: sermon.id,
    title: sermon.title,
    description: sermon.description || undefined,
    // Convert Date to string for GraphQL
    datePreached: sermon.datePreached.toISOString(),
    speakerId: sermon.speakerId,
    seriesId: sermon.seriesId || undefined,
    mainScripture: sermon.mainScripture || undefined,
    audioUrl: sermon.audioUrl || undefined,
    videoUrl: sermon.videoUrl || undefined,
    transcriptUrl: sermon.transcriptUrl || undefined,
    transcriptText: sermon.transcriptText || undefined,
    duration: sermon.duration || undefined,
    branchId: sermon.branchId,
    // Convert Prisma enum to our local enum
    status: sermon.status as unknown as ContentStatus,
    createdAt: sermon.createdAt.toISOString(),
    updatedAt: sermon.updatedAt.toISOString(),
  };
}

/**
 * Maps an array of Prisma Sermon models to GraphQL SermonEntity objects
 */
export function mapToSermonEntities(sermons: Sermon[]): SermonEntity[] {
  return sermons.map(mapToSermonEntity);
}
