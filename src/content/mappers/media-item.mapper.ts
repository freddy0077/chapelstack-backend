import { MediaItem } from '@prisma/client';
import { MediaItemEntity } from '../entities/media-item.entity';
import { MediaType } from '../enums/media-type.enum';

/**
 * Maps a Prisma MediaItem model to a GraphQL MediaItemEntity
 */
export function mapToMediaItemEntity(mediaItem: MediaItem): MediaItemEntity {
  return {
    id: mediaItem.id,
    title: mediaItem.title,
    description: mediaItem.description || undefined,
    fileUrl: mediaItem.fileUrl,
    mimeType: mediaItem.mimeType,
    fileSize: mediaItem.fileSize,
    type: mediaItem.type as unknown as MediaType,
    branchId: mediaItem.branchId,
  };
}

/**
 * Maps an array of Prisma MediaItem models to GraphQL MediaItemEntity objects
 */
export function mapToMediaItemEntities(
  mediaItems: MediaItem[],
): MediaItemEntity[] {
  return mediaItems.map(mapToMediaItemEntity);
}
