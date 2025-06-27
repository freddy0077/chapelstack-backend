import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSermonInput } from '../dto/create-sermon.input';
import { UpdateSermonInput } from '../dto/update-sermon.input';
import { ContentStatus, Sermon } from '@prisma/client';

@Injectable()
export class SermonsService {
  /**
   * Returns the total number of sermons in the system.
   */
  async countAll(): Promise<number> {
    return this.prisma.sermon.count();
  }

  constructor(private readonly prisma: PrismaService) {}

  async create(createSermonInput: CreateSermonInput): Promise<Sermon> {
    // Check if speaker exists
    const speaker = await this.prisma.speaker.findUnique({
      where: { id: createSermonInput.speakerId },
    });

    if (!speaker) {
      throw new NotFoundException(
        `Speaker with ID ${createSermonInput.speakerId} not found`,
      );
    }

    // Check if series exists if provided
    if (createSermonInput.seriesId) {
      const series = await this.prisma.series.findUnique({
        where: { id: createSermonInput.seriesId },
      });

      if (!series) {
        throw new NotFoundException(
          `Series with ID ${createSermonInput.seriesId} not found`,
        );
      }
    }

    // Create sermon with proper relation connections
    return this.prisma.sermon.create({
      data: {
        title: createSermonInput.title,
        description: createSermonInput.description,
        datePreached: new Date(createSermonInput.datePreached),
        mainScripture: createSermonInput.mainScripture,
        audioUrl: createSermonInput.audioUrl,
        videoUrl: createSermonInput.videoUrl,
        transcriptUrl: createSermonInput.transcriptUrl,
        transcriptText: createSermonInput.transcriptText,
        duration: createSermonInput.duration,
        status: createSermonInput.status || ContentStatus.DRAFT,
        speaker: {
          connect: { id: createSermonInput.speakerId },
        },
        branch: {
          connect: { id: createSermonInput.branchId },
        },
        ...(createSermonInput.seriesId && {
          series: {
            connect: { id: createSermonInput.seriesId },
          },
        }),
      },
      include: {
        speaker: true,
        series: true,
      },
    });
  }

  async findAll(
    branchId?: string,
    speakerId?: string,
    seriesId?: string,
    status?: ContentStatus,
  ): Promise<Sermon[]> {
    const where: any = {};

    if (branchId) where.branchId = branchId;
    if (speakerId) where.speakerId = speakerId;
    if (seriesId) where.seriesId = seriesId;
    if (status) where.status = status;

    return this.prisma.sermon.findMany({
      where,
      include: {
        speaker: true,
        series: true,
      },
      orderBy: {
        datePreached: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Sermon> {
    const sermon = await this.prisma.sermon.findUnique({
      where: { id },
      include: {
        speaker: true,
        series: true,
      },
    });

    if (!sermon) {
      throw new NotFoundException(`Sermon with ID ${id} not found`);
    }

    return sermon;
  }

  async update(updateSermonInput: UpdateSermonInput): Promise<Sermon> {
    const { id, speakerId, seriesId, datePreached, ...data } =
      updateSermonInput;

    // Check if sermon exists
    await this.findOne(id);

    // Check if speaker exists if provided
    if (speakerId) {
      const speaker = await this.prisma.speaker.findUnique({
        where: { id: speakerId },
      });

      if (!speaker) {
        throw new NotFoundException(`Speaker with ID ${speakerId} not found`);
      }
    }

    // Check if series exists if provided
    if (seriesId) {
      const series = await this.prisma.series.findUnique({
        where: { id: seriesId },
      });

      if (!series) {
        throw new NotFoundException(`Series with ID ${seriesId} not found`);
      }
    }

    // Prepare update data
    const updateData: any = { ...data };

    // Handle date conversion
    if (datePreached) {
      updateData.datePreached = new Date(datePreached);
    }

    // Handle relations
    if (speakerId) {
      updateData.speaker = { connect: { id: speakerId } };
    }

    if (seriesId) {
      updateData.series = { connect: { id: seriesId } };
    } else if (seriesId === null) {
      // If seriesId is explicitly set to null, disconnect the series
      updateData.series = { disconnect: true };
    }

    return this.prisma.sermon.update({
      where: { id },
      data: updateData,
      include: {
        speaker: true,
        series: true,
      },
    });
  }

  async remove(id: string): Promise<Sermon> {
    // Check if sermon exists
    await this.findOne(id);

    return this.prisma.sermon.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: ContentStatus): Promise<Sermon> {
    // Check if sermon exists
    await this.findOne(id);

    return this.prisma.sermon.update({
      where: { id },
      data: { status },
      include: {
        speaker: true,
        series: true,
      },
    });
  }

  async findRecent(limit: number = 5, branchId?: string): Promise<Sermon[]> {
    const where: any = { status: ContentStatus.PUBLISHED };
    if (branchId) where.branchId = branchId;

    return this.prisma.sermon.findMany({
      where,
      take: limit,
      orderBy: {
        datePreached: 'desc',
      },
      include: {
        speaker: true,
        series: true,
      },
    });
  }

  async search(query: string, branchId?: string): Promise<Sermon[]> {
    const where: any = {
      status: ContentStatus.PUBLISHED,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { mainScripture: { contains: query, mode: 'insensitive' } },
        { transcriptText: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (branchId) where.branchId = branchId;

    return this.prisma.sermon.findMany({
      where,
      include: {
        speaker: true,
        series: true,
      },
      orderBy: {
        datePreached: 'desc',
      },
    });
  }
}
