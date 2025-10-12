import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AssetService } from '../services/asset.service';
import { Asset } from '../entities/asset.entity';
import { AssetDisposal } from '../entities/asset-disposal.entity';
import { AssetStatistics } from '../entities/asset-statistics.entity';
import {
  CreateAssetInput,
  UpdateAssetInput,
  AssetFilterInput,
} from '../dto/asset.input';
import {
  CreateAssetDisposalInput,
  AssetDisposalFilterInput,
} from '../dto/asset-disposal.input';

@Resolver(() => Asset)
export class AssetResolver {
  constructor(private assetService: AssetService) {}

  @Query(() => [Asset])
  async assets(@Args('filters') filters: AssetFilterInput): Promise<Asset[]> {
    return this.assetService.getAssets(filters);
  }

  @Query(() => Asset)
  async asset(@Args('id') id: string): Promise<Asset> {
    return this.assetService.getAssetById(id);
  }

  @Query(() => AssetStatistics)
  async assetStatistics(
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
  ): Promise<AssetStatistics> {
    return this.assetService.getAssetStatistics(organisationId, branchId);
  }

  @Query(() => [AssetDisposal])
  async assetDisposals(
    @Args('filters') filters: AssetDisposalFilterInput,
  ): Promise<AssetDisposal[]> {
    return this.assetService.getDisposals(filters);
  }

  @Mutation(() => Asset)
  async createAsset(@Args('input') input: CreateAssetInput): Promise<Asset> {
    return this.assetService.createAsset(input);
  }

  @Mutation(() => Asset)
  async updateAsset(@Args('input') input: UpdateAssetInput): Promise<Asset> {
    return this.assetService.updateAsset(input);
  }

  @Mutation(() => Boolean)
  async deleteAsset(@Args('id') id: string): Promise<boolean> {
    return this.assetService.deleteAsset(id);
  }

  @Mutation(() => AssetDisposal)
  async disposeAsset(
    @Args('input') input: CreateAssetDisposalInput,
  ): Promise<AssetDisposal> {
    return this.assetService.disposeAsset(input);
  }

  @Mutation(() => Number)
  async recalculateAssetValues(
    @Args('organisationId') organisationId: string,
  ): Promise<number> {
    return this.assetService.recalculateAllAssetValues(organisationId);
  }
}
