import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AssetService } from './services/asset.service';
import { AssetTypeService } from './services/asset-type.service';
import { AssetResolver } from './resolvers/asset.resolver';
import { AssetTypeResolver } from './resolvers/asset-type.resolver';

@Module({
  imports: [PrismaModule],
  providers: [
    // Services
    AssetService,
    AssetTypeService,

    // Resolvers
    AssetResolver,
    AssetTypeResolver,
  ],
  exports: [AssetService, AssetTypeService],
})
export class AssetsModule {}
