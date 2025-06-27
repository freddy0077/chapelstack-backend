import { Speaker } from '@prisma/client';
import { SpeakerEntity } from '../entities/speaker.entity';

/**
 * Maps a Prisma Speaker model to a GraphQL SpeakerEntity
 */
export function mapToSpeakerEntity(speaker: Speaker): SpeakerEntity {
  return {
    id: speaker.id,
    name: speaker.name,
    title: undefined, // Field doesn't exist in Prisma model
    bio: speaker.bio || undefined,
    photoUrl: speaker.imageUrl || undefined, // Different field name in Prisma
    email: undefined, // Field doesn't exist in Prisma model
    phone: undefined, // Field doesn't exist in Prisma model
    website: undefined, // Field doesn't exist in Prisma model
    memberId: speaker.memberId || undefined,
    branchId: speaker.branchId || '', // Convert null to empty string if needed
    createdAt: speaker.createdAt,
    updatedAt: speaker.updatedAt,
  };
}

/**
 * Maps an array of Prisma Speaker models to GraphQL SpeakerEntity objects
 */
export function mapToSpeakerEntities(speakers: Speaker[]): SpeakerEntity[] {
  return speakers.map(mapToSpeakerEntity);
}
