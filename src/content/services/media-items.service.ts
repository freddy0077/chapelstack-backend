import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMediaItemInput } from '../dto/create-media-item.input';
import { UpdateMediaItemInput } from '../dto/update-media-item.input';
import { MediaItem, MediaType as PrismaMediaType } from '@prisma/client';

@Injectable()
export class MediaItemsService {
  /**
   * Returns the total number of media items.
   * TODO: Implement actual count logic.
   */
  async countAll(): Promise<number> {
    // TODO: Implement actual count logic
    return 0;
  }

  constructor(private readonly prisma: PrismaService) {}

  async create(createMediaItemInput: CreateMediaItemInput): Promise<MediaItem> {
    return this.prisma.mediaItem.create({
      data: {
        title: createMediaItemInput.title,
        description: createMediaItemInput.description,
        fileUrl: createMediaItemInput.fileUrl,
        mimeType: createMediaItemInput.mimeType,
        fileSize: createMediaItemInput.fileSize,
        type: createMediaItemInput.type as PrismaMediaType,
        branchId: createMediaItemInput.branchId,
        uploadedBy: createMediaItemInput.uploadedBy,
      },
    });
  }

  async findAll(
    branchId?: string,
    type?: PrismaMediaType,
  ): Promise<MediaItem[]> {
    const where: any = {};

    if (branchId) where.branchId = branchId;
    if (type) where.type = type;

    return this.prisma.mediaItem.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<MediaItem> {
    const mediaItem = await this.prisma.mediaItem.findUnique({
      where: { id },
    });

    if (!mediaItem) {
      throw new NotFoundException(`Media item with ID ${id} not found`);
    }

    return mediaItem;
  }

  async update(updateMediaItemInput: UpdateMediaItemInput): Promise<MediaItem> {
    const { id, ...rest } = updateMediaItemInput;
    // Only include defined fields in the update object
    const data: any = {};
    if (rest.title !== undefined) data.title = rest.title;
    if (rest.description !== undefined) data.description = rest.description;
    if (rest.fileUrl !== undefined) data.fileUrl = rest.fileUrl;
    if (rest.mimeType !== undefined) data.mimeType = rest.mimeType;
    if (rest.fileSize !== undefined) data.fileSize = rest.fileSize;
    if (rest.type !== undefined) data.type = rest.type as PrismaMediaType;
    if (rest.branchId !== undefined) data.branchId = rest.branchId;

    // Check if media item exists
    await this.findOne(id);

    return this.prisma.mediaItem.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<MediaItem> {
    // Check if media item exists
    await this.findOne(id);

    return this.prisma.mediaItem.delete({
      where: { id },
    });
  }

  async findByType(
    type: PrismaMediaType,
    branchId?: string,
  ): Promise<MediaItem[]> {
    const where: any = { type };
    if (branchId) where.branchId = branchId;

    return this.prisma.mediaItem.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async search(
    query: string,
    branchId?: string,
    type?: PrismaMediaType,
  ): Promise<MediaItem[]> {
    const where: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (branchId) where.branchId = branchId;
    if (type) where.type = type;

    return this.prisma.mediaItem.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
