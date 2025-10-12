import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAssetInput,
  UpdateAssetInput,
  AssetFilterInput,
} from '../dto/asset.input';
import {
  CreateAssetDisposalInput,
  AssetDisposalFilterInput,
} from '../dto/asset-disposal.input';
import { Asset } from '../entities/asset.entity';
import { AssetDisposal } from '../entities/asset-disposal.entity';
import { AssetStatistics } from '../entities/asset-statistics.entity';

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate unique asset code
   * Format: AST-YYYY-NNNN
   */
  async generateAssetCode(organisationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.asset.count({
      where: { organisationId },
    });
    return `AST-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Create a new asset
   */
  async createAsset(input: CreateAssetInput): Promise<Asset> {
    // Verify asset type exists
    const assetType = await this.prisma.assetType.findUnique({
      where: { id: input.assetTypeId },
    });

    if (!assetType) {
      throw new NotFoundException('Asset type not found');
    }

    // Generate asset code
    const assetCode = await this.generateAssetCode(input.organisationId);

    // Use depreciation rate from type if not provided
    const depreciationRate =
      input.depreciationRate ?? assetType.defaultDepreciationRate;

    // Create asset
    const asset = await this.prisma.asset.create({
      data: {
        ...input,
        assetCode,
        currentValue: input.currentValue ?? input.purchasePrice ?? 0,
        depreciationRate,
        status: input.status || 'ACTIVE',
      },
      include: {
        assetType: true,
        assignedToMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return asset as Asset;
  }

  /**
   * Update an existing asset
   */
  async updateAsset(input: UpdateAssetInput): Promise<Asset> {
    const { id, ...data } = input;

    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const updatedAsset = await this.prisma.asset.update({
      where: { id },
      data,
      include: {
        assetType: true,
        assignedToMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updatedAsset as Asset;
  }

  /**
   * Get asset by ID
   */
  async getAssetById(id: string): Promise<Asset> {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        assetType: true,
        assignedToMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        disposalRecords: {
          orderBy: { disposalDate: 'desc' },
          take: 1,
        },
        maintenanceRecords: {
          orderBy: { maintenanceDate: 'desc' },
          take: 5,
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset as Asset;
  }

  /**
   * Get assets with filters
   */
  async getAssets(filters: AssetFilterInput): Promise<Asset[]> {
    const where: any = {
      organisationId: filters.organisationId,
    };

    if (filters.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters.assetTypeId) {
      where.assetTypeId = filters.assetTypeId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.condition) {
      where.condition = filters.condition;
    }

    if (filters.assignedToMemberId) {
      where.assignedToMemberId = filters.assignedToMemberId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { assetCode: { contains: filters.search, mode: 'insensitive' } },
        { serialNumber: { contains: filters.search, mode: 'insensitive' } },
        { modelNumber: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const assets = await this.prisma.asset.findMany({
      where,
      include: {
        assetType: true,
        assignedToMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return assets as Asset[];
  }

  /**
   * Delete an asset
   */
  async deleteAsset(id: string): Promise<boolean> {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Check if asset has disposal records
    const disposalCount = await this.prisma.assetDisposal.count({
      where: { assetId: id },
    });

    if (disposalCount > 0) {
      throw new BadRequestException(
        'Cannot delete asset with disposal records. Consider marking as disposed instead.',
      );
    }

    await this.prisma.asset.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Calculate current value based on depreciation
   */
  async calculateCurrentValue(assetId: string): Promise<number> {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (
      !asset.purchaseDate ||
      !asset.purchasePrice ||
      !asset.depreciationRate
    ) {
      return asset.currentValue || asset.purchasePrice || 0;
    }

    const yearsOwned =
      (Date.now() - asset.purchaseDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365);
    const depreciationAmount =
      asset.purchasePrice * (asset.depreciationRate / 100) * yearsOwned;
    const currentValue = Math.max(0, asset.purchasePrice - depreciationAmount);

    // Update current value in database
    await this.prisma.asset.update({
      where: { id: assetId },
      data: { currentValue },
    });

    return currentValue;
  }

  /**
   * Recalculate all asset values
   */
  async recalculateAllAssetValues(organisationId: string): Promise<number> {
    const assets = await this.prisma.asset.findMany({
      where: {
        organisationId,
        status: 'ACTIVE',
        purchaseDate: { not: null },
        purchasePrice: { not: null },
        depreciationRate: { not: null },
      },
    });

    let updatedCount = 0;

    for (const asset of assets) {
      await this.calculateCurrentValue(asset.id);
      updatedCount++;
    }

    return updatedCount;
  }

  /**
   * Get asset statistics
   */
  async getAssetStatistics(
    organisationId: string,
    branchId?: string,
  ): Promise<AssetStatistics> {
    const where: any = { organisationId };
    if (branchId) {
      where.branchId = branchId;
    }

    const [
      totalAssets,
      activeAssets,
      disposedAssets,
      inMaintenanceAssets,
      valueAggregates,
    ] = await Promise.all([
      this.prisma.asset.count({ where }),
      this.prisma.asset.count({ where: { ...where, status: 'ACTIVE' } }),
      this.prisma.asset.count({ where: { ...where, status: 'DISPOSED' } }),
      this.prisma.asset.count({
        where: { ...where, status: 'IN_MAINTENANCE' },
      }),
      this.prisma.asset.aggregate({
        where,
        _sum: {
          currentValue: true,
          purchasePrice: true,
        },
      }),
    ]);

    const totalValue = valueAggregates._sum.currentValue || 0;
    const totalPurchaseValue = valueAggregates._sum.purchasePrice || 0;
    const totalDepreciation = totalPurchaseValue - totalValue;

    return {
      totalAssets,
      activeAssets,
      disposedAssets,
      inMaintenanceAssets,
      totalValue,
      totalPurchaseValue,
      totalDepreciation,
    };
  }

  /**
   * Dispose an asset
   */
  async disposeAsset(input: CreateAssetDisposalInput): Promise<AssetDisposal> {
    // Get asset
    const asset = await this.prisma.asset.findUnique({
      where: { id: input.assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (asset.status === 'DISPOSED') {
      throw new BadRequestException('Asset is already disposed');
    }

    // Calculate gain/loss
    const bookValue = input.bookValueAtDisposal || asset.currentValue || 0;
    const salePrice = input.salePrice || 0;
    const gainLoss = salePrice - bookValue;

    // Create disposal record
    const disposal = await this.prisma.assetDisposal.create({
      data: {
        ...input,
        bookValueAtDisposal: bookValue,
        gainLossOnDisposal: gainLoss,
      },
      include: {
        asset: {
          include: {
            assetType: true,
          },
        },
      },
    });

    // Update asset status
    await this.prisma.asset.update({
      where: { id: input.assetId },
      data: { status: 'DISPOSED' },
    });

    return disposal as AssetDisposal;
  }

  /**
   * Get disposal records
   */
  async getDisposals(
    filters: AssetDisposalFilterInput,
  ): Promise<AssetDisposal[]> {
    const where: any = {
      organisationId: filters.organisationId,
    };

    if (filters.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters.disposalMethod) {
      where.disposalMethod = filters.disposalMethod;
    }

    if (filters.startDate || filters.endDate) {
      where.disposalDate = {};
      if (filters.startDate) {
        where.disposalDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.disposalDate.lte = filters.endDate;
      }
    }

    const disposals = await this.prisma.assetDisposal.findMany({
      where,
      include: {
        asset: {
          include: {
            assetType: true,
          },
        },
        approvedByMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { disposalDate: 'desc' },
    });

    return disposals as AssetDisposal[];
  }
}
