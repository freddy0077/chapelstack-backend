"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToMediaItemEntity = mapToMediaItemEntity;
exports.mapToMediaItemEntities = mapToMediaItemEntities;
function mapToMediaItemEntity(mediaItem) {
    return {
        id: mediaItem.id,
        title: mediaItem.title,
        description: mediaItem.description || undefined,
        fileUrl: mediaItem.fileUrl,
        mimeType: mediaItem.mimeType,
        fileSize: mediaItem.fileSize,
        type: mediaItem.type,
        branchId: mediaItem.branchId,
    };
}
function mapToMediaItemEntities(mediaItems) {
    return mediaItems.map(mapToMediaItemEntity);
}
//# sourceMappingURL=media-item.mapper.js.map