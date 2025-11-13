import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { DataOperationsService } from '../services/data-operations.service';

@ObjectType()
export class DataOperationType {
  @Field()
  id: string;

  @Field()
  action: string;

  @Field()
  entityType: string;

  @Field(() => Int)
  recordCount: number;

  @Field()
  status: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  userId?: string;
}

@ObjectType()
export class DataOperationsResponseType {
  @Field(() => [DataOperationType])
  operations: DataOperationType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
export class ImportValidationResultType {
  @Field()
  valid: boolean;

  @Field(() => Int)
  recordCount: number;

  @Field(() => [String])
  errors: string[];

  @Field(() => [String])
  warnings: string[];

  @Field()
  estimatedTime: string;
}

@ObjectType()
export class ImportResultType {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => Int)
  importedCount: number;

  @Field(() => Int)
  failedCount: number;

  @Field(() => [String])
  warnings: string[];
}

@ObjectType()
export class ExportResultType {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => Int)
  recordCount: number;

  @Field()
  filename: string;

  @Field()
  format: string;

  @Field()
  downloadUrl: string;
}

@ObjectType()
export class BulkOperationResultType {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field()
  operation: string;

  @Field(() => Int)
  successCount: number;

  @Field(() => Int)
  failureCount: number;

  @Field(() => Int)
  totalCount: number;
}

@ObjectType()
export class EntityTypeType {
  @Field()
  name: string;

  @Field()
  displayName: string;

  @Field(() => [String])
  fields: string[];
}

@ObjectType()
export class SupportedEntityTypesType {
  @Field(() => [EntityTypeType])
  entityTypes: EntityTypeType[];
}

@InputType()
export class DataImportInputType {
  @Field()
  entityType: string;

  @Field(() => [String])
  data: string[];

  @Field({ nullable: true })
  validateOnly?: boolean;
}

@InputType()
export class DataExportInputType {
  @Field()
  entityType: string;

  @Field({ nullable: true })
  format?: string;
}

@InputType()
export class BulkOperationInputType {
  @Field()
  entityType: string;

  @Field()
  operation: string;

  @Field(() => [String])
  entityIds: string[];
}

@Resolver()
export class DataOperationsResolver {
  constructor(private dataOperationsService: DataOperationsService) {}

  @Query(() => DataOperationsResponseType, { name: 'godModeDataOperations' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getDataOperations(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Context() context?: any,
  ) {
    return this.dataOperationsService.getDataOperations(skip, take);
  }

  @Query(() => ImportValidationResultType, { name: 'godModeValidateImport' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async validateImportData(
    @Args('entityType') entityType: string,
    @Args('data', { type: () => [String] }) data: string[],
    @Context() context?: any,
  ) {
    return this.dataOperationsService.validateImportData({
      entityType,
      data: data.map((d) => JSON.parse(d)),
    });
  }

  @Query(() => SupportedEntityTypesType, { name: 'godModeSupportedEntityTypes' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getSupportedEntityTypes(@Context() context: any) {
    return this.dataOperationsService.getSupportedEntityTypes();
  }

  @Query(() => [String], { name: 'godModeImportTemplate' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getImportTemplate(
    @Args('entityType') entityType: string,
    @Context() context: any,
  ) {
    const templates = await this.dataOperationsService.getImportTemplates(entityType);
    return templates.map((t) => JSON.stringify(t));
  }

  @Mutation(() => ImportResultType, { name: 'godModeImportData' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async importData(
    @Args('entityType') entityType: string,
    @Args('data', { type: () => [String] }) data: string[],
    @Args('validateOnly', { nullable: true }) validateOnly?: boolean,
    @Context() context?: any,
  ) {
    return this.dataOperationsService.importData({
      entityType,
      data: data.map((d) => JSON.parse(d)),
      validateOnly,
    });
  }

  @Mutation(() => ExportResultType, { name: 'godModeExportData' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async exportData(
    @Args('entityType') entityType: string,
    @Args('format', { nullable: true }) format?: string,
    @Context() context?: any,
  ) {
    return this.dataOperationsService.exportData({
      entityType,
      format: format as 'json' | 'csv',
    });
  }

  @Mutation(() => BulkOperationResultType, { name: 'godModePerformBulkOperation' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async performBulkOperation(
    @Args('entityType') entityType: string,
    @Args('operation') operation: string,
    @Args('entityIds', { type: () => [String] }) entityIds: string[],
    @Context() context: any,
  ) {
    return this.dataOperationsService.performBulkOperation({
      entityType,
      operation: operation as 'update' | 'delete' | 'activate' | 'deactivate',
      entityIds,
    });
  }
}
