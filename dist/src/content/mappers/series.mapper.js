"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToSeriesEntity = mapToSeriesEntity;
exports.mapToSeriesEntities = mapToSeriesEntities;
function mapToSeriesEntity(series) {
    return {
        id: series.id,
        title: series.title,
        description: series.description || undefined,
        imageUrl: series.artworkUrl || undefined,
        startDate: series.startDate || new Date(),
        endDate: series.endDate || undefined,
        isActive: Boolean(series.startDate && (!series.endDate || series.endDate > new Date())),
        branchId: series.branchId,
        createdAt: series.createdAt,
        updatedAt: series.updatedAt,
    };
}
function mapToSeriesEntities(seriesArray) {
    return seriesArray.map(mapToSeriesEntity);
}
//# sourceMappingURL=series.mapper.js.map