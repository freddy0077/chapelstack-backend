import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { SpeakersService } from '../services/speakers.service';
import { CreateSpeakerInput } from '../dto/create-speaker.input';
import { UpdateSpeakerInput } from '../dto/update-speaker.input';
import { SpeakerEntity } from '../entities/speaker.entity';
import {
  mapToSpeakerEntity,
  mapToSpeakerEntities,
} from '../mappers/speaker.mapper';

@Resolver(() => SpeakerEntity)
export class SpeakersResolver {
  constructor(private readonly speakersService: SpeakersService) {}

  @Mutation(() => SpeakerEntity)
  async create(
    @Args('createSpeakerInput') createSpeakerInput: CreateSpeakerInput,
  ): Promise<SpeakerEntity> {
    const speaker = await this.speakersService.create(createSpeakerInput);
    return mapToSpeakerEntity(speaker);
  }

  @Query(() => [SpeakerEntity])
  async findAll(
    @Args('branchId', { nullable: true }) branchId?: string,
  ): Promise<SpeakerEntity[]> {
    const speakers = await this.speakersService.findAll(branchId);
    return mapToSpeakerEntities(speakers);
  }

  @Query(() => SpeakerEntity)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SpeakerEntity> {
    const speaker = await this.speakersService.findOne(id);
    return mapToSpeakerEntity(speaker);
  }

  @Mutation(() => SpeakerEntity)
  async update(
    @Args('updateSpeakerInput') updateSpeakerInput: UpdateSpeakerInput,
  ): Promise<SpeakerEntity> {
    const speaker = await this.speakersService.update(updateSpeakerInput);
    return mapToSpeakerEntity(speaker);
  }

  @Mutation(() => SpeakerEntity)
  async remove(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SpeakerEntity> {
    const speaker = await this.speakersService.remove(id);
    return mapToSpeakerEntity(speaker);
  }

  @Query(() => SpeakerEntity, { nullable: true })
  async findByMember(
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<SpeakerEntity | null> {
    const speaker = await this.speakersService.findByMember(memberId);
    return speaker ? mapToSpeakerEntity(speaker) : null;
  }
}
