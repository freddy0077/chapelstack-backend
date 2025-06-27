import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DataOperationService } from '../services/data-operation.service';
import { DataOperation } from '../entities/data-operation.entity';
import {
  CreateDataImportInput,
  CreateDataExportInput,
  DataOperationFilterInput,
} from '../dto/data-operation.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver(() => DataOperation)
@UseGuards(JwtAuthGuard, RolesGuard)
export class DataOperationResolver {
  constructor(private readonly dataOperationService: DataOperationService) {}

  @Mutation(() => DataOperation)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createDataImport(
    @Args('input') input: CreateDataImportInput,
    @Context() context: any,
  ): Promise<DataOperation> {
    const { req } = context;
    const userId = req.user?.id || input.userId;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.dataOperationService.createDataImport(
      { ...input, userId },
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => DataOperation)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createDataExport(
    @Args('input') input: CreateDataExportInput,
    @Context() context: any,
  ): Promise<DataOperation> {
    const { req } = context;
    const userId = req.user?.id || input.userId;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.dataOperationService.createDataExport(
      { ...input, userId },
      ipAddress,
      userAgent,
    );
  }

  @Query(() => DataOperation)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async dataOperation(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<DataOperation> {
    return this.dataOperationService.getDataOperation(id);
  }

  @Query(() => [DataOperation])
  @Roles('SUPER_ADMIN', 'ADMIN')
  async dataOperations(
    @Args('filter', { nullable: true }) filter?: DataOperationFilterInput,
  ): Promise<DataOperation[]> {
    return this.dataOperationService.getDataOperations(filter);
  }

  @Mutation(() => DataOperation)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async cancelDataOperation(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Context() context: any,
  ): Promise<DataOperation> {
    const { req } = context;
    const userId = req.user?.id;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.dataOperationService.cancelDataOperation(
      id,
      userId,
      ipAddress,
      userAgent,
    );
  }
}
