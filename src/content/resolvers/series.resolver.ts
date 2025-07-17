import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { SeriesService } from '../services/series.service';
import { CreateSeriesInput } from '../dto/create-series.input';
import { UpdateSeriesInput } from '../dto/update-series.input';
import { SeriesEntity } from '../entities/series.entity';
import {
  mapToSeriesEntity,
  mapToSeriesEntities,
} from '../mappers/series.mapper';

@Resolver(() => SeriesEntity)
export class SeriesResolver {
  constructor(private readonly seriesService: SeriesService) {}

  @Mutation(() => SeriesEntity, { name: 'createSeries' })
  async create(
    @Args('createSeriesInput') createSeriesInput: CreateSeriesInput,
  ): Promise<SeriesEntity> {
    const series = await this.seriesService.create(createSeriesInput);
    return mapToSeriesEntity(series);
  }

  @Query(() => [SeriesEntity], { name: 'series' })
  async findAll(
    @Args('branchId', { nullable: true }) branchId?: string,
  ): Promise<SeriesEntity[]> {
    const seriesArray = await this.seriesService.findAll(branchId);
    return mapToSeriesEntities(seriesArray);
  }

  @Query(() => SeriesEntity, { name: 'seriesById' })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SeriesEntity> {
    const series = await this.seriesService.findOne(id);
    return mapToSeriesEntity(series);
  }

  @Mutation(() => SeriesEntity, { name: 'updateSeries' })
  async update(
    @Args('updateSeriesInput') updateSeriesInput: UpdateSeriesInput,
  ): Promise<SeriesEntity> {
    const series = await this.seriesService.update(updateSeriesInput);
    return mapToSeriesEntity(series);
  }

  @Mutation(() => SeriesEntity, { name: 'removeSeries' })
  async remove(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SeriesEntity> {
    const series = await this.seriesService.remove(id);
    return mapToSeriesEntity(series);
  }

  @Query(() => [SeriesEntity])
  async getActiveSeries(
    @Args('branchId', { nullable: true }) branchId?: string,
  ): Promise<SeriesEntity[]> {
    const seriesArray = await this.seriesService.getActiveSeries(branchId);
    return mapToSeriesEntities(seriesArray);
  }
}
