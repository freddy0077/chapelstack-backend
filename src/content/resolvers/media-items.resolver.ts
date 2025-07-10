import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { MediaItemsService } from '../services/media-items.service';
import { CreateMediaItemInput } from '../dto/create-media-item.input';
import { UpdateMediaItemInput } from '../dto/update-media-item.input';
import { MediaType } from '@prisma/client';
import { MediaItemEntity } from '../entities/media-item.entity';
import {
  mapToMediaItemEntity,
  mapToMediaItemEntities,
} from '../mappers/media-item.mapper';

@Resolver(() => MediaItemEntity)
export class MediaItemsResolver {
  constructor(private readonly mediaItemsService: MediaItemsService) {}

  @Mutation(() => MediaItemEntity)
  async create(
    @Args('createMediaItemInput') createMediaItemInput: CreateMediaItemInput,
  ): Promise<MediaItemEntity> {
    const mediaItem = await this.mediaItemsService.create(createMediaItemInput);
    return mapToMediaItemEntity(mediaItem);
  }

  @Query(() => [MediaItemEntity], { name: 'mediaItems' })
  async findAll(
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('type', { nullable: true }) type?: MediaType,
  ): Promise<MediaItemEntity[]> {
    const mediaItems = await this.mediaItemsService.findAll(branchId, type);
    return mapToMediaItemEntities(mediaItems);
  }

  @Query(() => MediaItemEntity)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MediaItemEntity> {
    const mediaItem = await this.mediaItemsService.findOne(id);
    return mapToMediaItemEntity(mediaItem);
  }

  @Mutation(() => MediaItemEntity)
  async update(
    @Args('updateMediaItemInput') updateMediaItemInput: UpdateMediaItemInput,
  ): Promise<MediaItemEntity> {
    const mediaItem = await this.mediaItemsService.update(updateMediaItemInput);
    return mapToMediaItemEntity(mediaItem);
  }

  @Mutation(() => MediaItemEntity)
  async remove(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MediaItemEntity> {
    const mediaItem = await this.mediaItemsService.remove(id);
    return mapToMediaItemEntity(mediaItem);
  }

  @Query(() => [MediaItemEntity])
  async findByType(
    @Args('type') type: MediaType,
    @Args('branchId', { nullable: true }) branchId?: string,
  ): Promise<MediaItemEntity[]> {
    const mediaItems = await this.mediaItemsService.findByType(type, branchId);
    return mapToMediaItemEntities(mediaItems);
  }

  @Query(() => [MediaItemEntity])
  async search(
    @Args('query') query: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('type', { nullable: true }) type?: MediaType,
  ): Promise<MediaItemEntity[]> {
    const mediaItems = await this.mediaItemsService.search(
      query,
      branchId,
      type,
    );
    return mapToMediaItemEntities(mediaItems);
  }
}
