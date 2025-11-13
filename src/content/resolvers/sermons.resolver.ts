import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { SermonsService } from '../services/sermons.service';
import { CreateSermonInput } from '../dto/create-sermon.input';
import { UpdateSermonInput } from '../dto/update-sermon.input';
import { ContentStatus } from '../enums/content-status.enum';
import { SermonEntity } from '../entities/sermon.entity';
import {
  mapToSermonEntity,
  mapToSermonEntities,
} from '../mappers/sermon.mapper';

@Resolver(() => SermonEntity)
export class SermonsResolver {
  constructor(private readonly sermonsService: SermonsService) {}

  @Mutation(() => SermonEntity)
  async createSermon(
    @Args('createSermonInput') createSermonInput: CreateSermonInput,
  ): Promise<SermonEntity> {
    const sermon = await this.sermonsService.create(createSermonInput);
    return mapToSermonEntity(sermon);
  }

  @Query(() => [SermonEntity], { name: 'sermons' })
  async findAll(
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('speakerId', { nullable: true }) speakerId?: string,
    @Args('seriesId', { nullable: true }) seriesId?: string,
    @Args('status', { nullable: true }) status?: ContentStatus,
  ): Promise<SermonEntity[]> {
    const sermons = await this.sermonsService.findAll(
      branchId,
      speakerId,
      seriesId,
      status,
    );
    return mapToSermonEntities(sermons);
  }

  @Query(() => SermonEntity)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SermonEntity> {
    const sermon = await this.sermonsService.findOne(id);
    return mapToSermonEntity(sermon);
  }

  @Mutation(() => SermonEntity)
  async update(
    @Args('updateSermonInput') updateSermonInput: UpdateSermonInput,
  ): Promise<SermonEntity> {
    const sermon = await this.sermonsService.update(updateSermonInput);
    return mapToSermonEntity(sermon);
  }

  @Mutation(() => SermonEntity)
  async remove(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SermonEntity> {
    const sermon = await this.sermonsService.remove(id);
    return mapToSermonEntity(sermon);
  }

  @Mutation(() => SermonEntity)
  async updateSermonStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status') status: ContentStatus,
  ): Promise<SermonEntity> {
    const sermon = await this.sermonsService.updateStatus(id, status);
    return mapToSermonEntity(sermon);
  }

  @Query(() => [SermonEntity])
  async findRecent(
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('branchId', { nullable: true }) branchId?: string,
  ): Promise<SermonEntity[]> {
    const sermons = await this.sermonsService.findRecent(limit, branchId);
    return mapToSermonEntities(sermons);
  }

  @Query(() => [SermonEntity])
  async search(
    @Args('query') query: string,
    @Args('branchId', { nullable: true }) branchId?: string,
  ): Promise<SermonEntity[]> {
    const sermons = await this.sermonsService.search(query, branchId);
    return mapToSermonEntities(sermons);
  }
}
