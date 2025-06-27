import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSpeakerInput } from '../dto/create-speaker.input';
import { UpdateSpeakerInput } from '../dto/update-speaker.input';
import { Speaker } from '@prisma/client';

@Injectable()
export class SpeakersService {
  /**
   * Returns the total number of speakers.
   * TODO: Implement actual count logic.
   */
  async countAll(): Promise<number> {
    // TODO: Implement actual count logic
    return 0;
  }

  constructor(private readonly prisma: PrismaService) {}

  async create(createSpeakerInput: CreateSpeakerInput): Promise<Speaker> {
    return this.prisma.speaker.create({
      data: {
        name: createSpeakerInput.name,
        bio: createSpeakerInput.bio,
        memberId: createSpeakerInput.memberId,
        imageUrl: createSpeakerInput.imageUrl,
        branchId: createSpeakerInput.branchId,
      },
    });
  }

  async findAll(branchId?: string): Promise<Speaker[]> {
    const where = branchId ? { branchId } : {};
    return this.prisma.speaker.findMany({
      where,
      include: {
        member: true,
        sermons: true,
      },
    });
  }

  async findOne(id: string): Promise<Speaker> {
    const speaker = await this.prisma.speaker.findUnique({
      where: { id },
      include: {
        member: true,
        sermons: true,
      },
    });

    if (!speaker) {
      throw new NotFoundException(`Speaker with ID ${id} not found`);
    }

    return speaker;
  }

  async update(updateSpeakerInput: UpdateSpeakerInput): Promise<Speaker> {
    const { id, ...data } = updateSpeakerInput;

    // Check if speaker exists
    await this.findOne(id);

    return this.prisma.speaker.update({
      where: { id },
      data,
      include: {
        member: true,
        sermons: true,
      },
    });
  }

  async remove(id: string): Promise<Speaker> {
    // Check if speaker exists
    await this.findOne(id);

    // Check if speaker has sermons
    const speakerWithSermons = await this.prisma.speaker.findUnique({
      where: { id },
      include: {
        sermons: {
          take: 1,
        },
      },
    });

    if (speakerWithSermons && speakerWithSermons.sermons.length > 0) {
      throw new Error(
        `Cannot delete speaker with ID ${id} because they have associated sermons`,
      );
    }

    return this.prisma.speaker.delete({
      where: { id },
    });
  }

  async findByMember(memberId: string): Promise<Speaker | null> {
    return this.prisma.speaker.findUnique({
      where: { memberId },
      include: {
        sermons: true,
      },
    });
  }
}
