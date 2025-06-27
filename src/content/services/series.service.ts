import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSeriesInput } from '../dto/create-series.input';
import { UpdateSeriesInput } from '../dto/update-series.input';
import { Series } from '@prisma/client';

@Injectable()
export class SeriesService {
  /**
   * Returns the number of active series.
   * TODO: Implement actual count logic.
   */
  async countActive(): Promise<number> {
    // TODO: Implement actual count logic
    return 0;
  }

  constructor(private readonly prisma: PrismaService) {}

  async create(createSeriesInput: CreateSeriesInput): Promise<Series> {
    return this.prisma.series.create({
      data: {
        title: createSeriesInput.title,
        description: createSeriesInput.description,
        startDate: createSeriesInput.startDate
          ? new Date(createSeriesInput.startDate)
          : null,
        endDate: createSeriesInput.endDate
          ? new Date(createSeriesInput.endDate)
          : null,
        artworkUrl: createSeriesInput.artworkUrl,
        branchId: createSeriesInput.branchId,
      },
    });
  }

  async findAll(branchId?: string): Promise<Series[]> {
    const where = branchId ? { branchId } : {};
    return this.prisma.series.findMany({
      where,
      include: {
        sermons: true,
      },
    });
  }

  async findOne(id: string): Promise<Series> {
    const series = await this.prisma.series.findUnique({
      where: { id },
      include: {
        sermons: true,
      },
    });

    if (!series) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }

    return series;
  }

  async update(updateSeriesInput: UpdateSeriesInput): Promise<Series> {
    const { id, ...data } = updateSeriesInput;

    // Check if series exists
    await this.findOne(id);

    // Process date fields
    const updateData: any = { ...data };
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    return this.prisma.series.update({
      where: { id },
      data: updateData,
      include: {
        sermons: true,
      },
    });
  }

  async remove(id: string): Promise<Series> {
    // Check if series exists
    await this.findOne(id);

    // Check if series has sermons
    const seriesWithSermons = await this.prisma.series.findUnique({
      where: { id },
      include: {
        sermons: {
          take: 1,
        },
      },
    });

    if (seriesWithSermons && seriesWithSermons.sermons.length > 0) {
      throw new Error(
        `Cannot delete series with ID ${id} because it has associated sermons`,
      );
    }

    return this.prisma.series.delete({
      where: { id },
    });
  }

  async getActiveSeries(branchId?: string): Promise<Series[]> {
    const today = new Date();

    return this.prisma.series.findMany({
      where: {
        branchId: branchId ? branchId : undefined,
        OR: [
          {
            // Series with no end date or end date in the future
            endDate: {
              gte: today,
            },
          },
          {
            // Series with no end date
            endDate: null,
          },
        ],
      },
      include: {
        sermons: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }
}
