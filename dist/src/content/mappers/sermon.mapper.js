"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToSermonEntity = mapToSermonEntity;
exports.mapToSermonEntities = mapToSermonEntities;
function mapToSermonEntity(sermon) {
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
        branchId: sermon.branchId,
        status: sermon.status,
        createdAt: sermon.createdAt.toISOString(),
        updatedAt: sermon.updatedAt.toISOString(),
    };
}
function mapToSermonEntities(sermons) {
    return sermons.map(mapToSermonEntity);
}
//# sourceMappingURL=sermon.mapper.js.map