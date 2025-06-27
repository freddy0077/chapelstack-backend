"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToSpeakerEntity = mapToSpeakerEntity;
exports.mapToSpeakerEntities = mapToSpeakerEntities;
function mapToSpeakerEntity(speaker) {
    return {
        id: speaker.id,
        name: speaker.name,
        title: undefined,
        bio: speaker.bio || undefined,
        photoUrl: speaker.imageUrl || undefined,
        email: undefined,
        phone: undefined,
        website: undefined,
        memberId: speaker.memberId || undefined,
        branchId: speaker.branchId || '',
        createdAt: speaker.createdAt,
        updatedAt: speaker.updatedAt,
    };
}
function mapToSpeakerEntities(speakers) {
    return speakers.map(mapToSpeakerEntity);
}
//# sourceMappingURL=speaker.mapper.js.map