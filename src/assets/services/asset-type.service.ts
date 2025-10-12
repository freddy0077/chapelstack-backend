import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAssetTypeInput,
  UpdateAssetTypeInput,
} from '../dto/asset-type.input';
import { AssetType } from '../entities/asset-type.entity';

@Injectable()
export class AssetTypeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new asset type
   */
  async createAssetType(input: CreateAssetTypeInput): Promise<AssetType> {
    // Check if name already exists for this organisation
    const existing = await this.prisma.assetType.findFirst({
      where: {
        name: input.name,
        organisationId: input.organisationId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Asset type with this name already exists',
      );
    }

    const assetType = await this.prisma.assetType.create({
      data: input,
    });

    return assetType as AssetType;
  }

  /**
   * Update an existing asset type
   */
  async updateAssetType(input: UpdateAssetTypeInput): Promise<AssetType> {
    const { id, ...data } = input;

    const assetType = await this.prisma.assetType.findUnique({
      where: { id },
    });

    if (!assetType) {
      throw new NotFoundException('Asset type not found');
    }

    // Check name uniqueness if name is being updated
    if (data.name) {
      const existing = await this.prisma.assetType.findFirst({
        where: {
          name: data.name,
          organisationId: assetType.organisationId,
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException(
          'Asset type with this name already exists',
        );
      }
    }

    const updatedAssetType = await this.prisma.assetType.update({
      where: { id },
      data,
    });

    return updatedAssetType as AssetType;
  }

  /**
   * Get asset type by ID
   */
  async getAssetTypeById(id: string): Promise<AssetType> {
    const assetType = await this.prisma.assetType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assets: true },
        },
      },
    });

    if (!assetType) {
      throw new NotFoundException('Asset type not found');
    }

    return {
      ...assetType,
      assetCount: assetType._count.assets,
    } as AssetType;
  }

  /**
   * Get all asset types for an organisation
   */
  async getAssetTypes(organisationId: string): Promise<AssetType[]> {
    const assetTypes = await this.prisma.assetType.findMany({
      where: { organisationId },
      include: {
        _count: {
          select: { assets: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return assetTypes.map((type) => ({
      ...type,
      assetCount: type._count.assets,
    })) as AssetType[];
  }

  /**
   * Delete an asset type
   */
  async deleteAssetType(id: string): Promise<boolean> {
    const assetType = await this.prisma.assetType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assets: true },
        },
      },
    });

    if (!assetType) {
      throw new NotFoundException('Asset type not found');
    }

    if (assetType._count.assets > 0) {
      throw new BadRequestException(
        `Cannot delete asset type with ${assetType._count.assets} associated assets`,
      );
    }

    await this.prisma.assetType.delete({
      where: { id },
    });

    return true;
  }
}
