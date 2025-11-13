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
    // Handle tags: connect or create
    const tagsInput = createSermonInput.tags || [];
    const tagConnectOrCreate = tagsInput.map((tagName) => ({
      where: { name: tagName },
      create: { name: tagName },
    }));

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
        notesUrl: createSermonInput.notesUrl,
        organisationId: createSermonInput.organisationId,
        speakerId: createSermonInput.speakerId,
        branchId: createSermonInput.branchId,
        seriesId: createSermonInput.seriesId || null,
        categoryId: createSermonInput.categoryId || null,
        tags: {
          connectOrCreate: tagConnectOrCreate,
        },
      },
      include: {
        speaker: true,
        series: true,
        tags: true,
        category: true,
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
        tags: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Sermon | null> {
    return this.prisma.sermon.findUnique({
      where: { id },
      include: {
        speaker: true,
        series: true,
        tags: true,
        category: true,
      },
    });
  }

  async update(updateSermonInput: UpdateSermonInput): Promise<Sermon> {
    const {
      id,
      speakerId,
      seriesId,
      datePreached,
      tags,
      categoryId,
      notesUrl,
      organisationId,
      branchId,
      ...data
    } = updateSermonInput;

    // Check if sermon exists
    const sermon = await this.prisma.sermon.findUnique({ where: { id } });
    if (!sermon) {
      throw new Error('Sermon not found');
    }

    const updateData: any = { ...data };

    if (speakerId) {
      updateData.speaker = { connect: { id: speakerId } };
    }

    if (typeof seriesId !== 'undefined') {
      updateData.series = seriesId
        ? { connect: { id: seriesId } }
        : { disconnect: true };
    }

    if (datePreached) {
      updateData.datePreached = new Date(datePreached);
    }

    if (tags) {
      const tagConnectOrCreate = tags.map((tagName) => ({
        where: { name: tagName },
        create: { name: tagName },
      }));
      updateData.tags = { set: [], connectOrCreate: tagConnectOrCreate };
    }

    if (typeof categoryId !== 'undefined') {
      updateData.category = categoryId
        ? { connect: { id: categoryId } }
        : { disconnect: true };
    }
    if (typeof notesUrl !== 'undefined') {
      updateData.notesUrl = notesUrl;
    }
    if (organisationId) {
      updateData.organisationId = organisationId;
    }
    if (branchId) {
      updateData.branch = { connect: { id: branchId } };
    }

    return this.prisma.sermon.update({
      where: { id },
      data: updateData,
      include: {
        speaker: true,
        series: true,
        tags: true,
        category: true,
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
        tags: true,
        category: true,
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
        createdAt: 'desc',
      },
      include: {
        speaker: true,
        series: true,
        tags: true,
        category: true,
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
        tags: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
