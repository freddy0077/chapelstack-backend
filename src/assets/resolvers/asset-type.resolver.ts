import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AssetTypeService } from '../services/asset-type.service';
import { AssetType } from '../entities/asset-type.entity';
import {
  CreateAssetTypeInput,
  UpdateAssetTypeInput,
} from '../dto/asset-type.input';

@Resolver(() => AssetType)
export class AssetTypeResolver {
  constructor(private assetTypeService: AssetTypeService) {}

  @Query(() => [AssetType])
  async assetTypes(
    @Args('organisationId') organisationId: string,
  ): Promise<AssetType[]> {
    return this.assetTypeService.getAssetTypes(organisationId);
  }

  @Query(() => AssetType)
  async assetType(@Args('id') id: string): Promise<AssetType> {
    return this.assetTypeService.getAssetTypeById(id);
  }

  @Mutation(() => AssetType)
  async createAssetType(
    @Args('input') input: CreateAssetTypeInput,
  ): Promise<AssetType> {
    return this.assetTypeService.createAssetType(input);
  }

  @Mutation(() => AssetType)
  async updateAssetType(
    @Args('input') input: UpdateAssetTypeInput,
  ): Promise<AssetType> {
    return this.assetTypeService.updateAssetType(input);
  }

  @Mutation(() => Boolean)
  async deleteAssetType(@Args('id') id: string): Promise<boolean> {
    return this.assetTypeService.deleteAssetType(id);
  }
}
