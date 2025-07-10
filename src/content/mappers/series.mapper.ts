import { Series } from '@prisma/client';
import { SeriesEntity } from '../entities/series.entity';

/**
 * Maps a Prisma Series model to a GraphQL SeriesEntity
 */
export function mapToSeriesEntity(series: Series): SeriesEntity {
  return {
    id: series.id,
    title: series.title,
    description: series.description || undefined,
    startDate: series.startDate ? series.startDate.toISOString() : undefined,
    endDate: series.endDate ? series.endDate.toISOString() : undefined,
    artworkUrl: series.artworkUrl || undefined,
    isActive: Boolean(
      series.startDate && (!series.endDate || series.endDate > new Date()),
    ),
    branchId: series.branchId,
    createdAt: series.createdAt,
    updatedAt: series.updatedAt,
  };
}

/**
 * Maps an array of Prisma Series models to GraphQL SeriesEntity objects
 */
export function mapToSeriesEntities(seriesArray: Series[]): SeriesEntity[] {
  return seriesArray.map(mapToSeriesEntity);
}
