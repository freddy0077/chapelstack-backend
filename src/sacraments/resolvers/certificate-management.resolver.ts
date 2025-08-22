import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { CertificateManagementService } from '../services/certificate-management.service';
import {
  CertificateTemplate,
  ChurchDenomination,
  CertificateSacramentType,
} from '../dto/certificate-template.dto';
import {
  GenerateCertificateInput,
  CertificateGeneration,
  CertificateGenerationStats,
  RecentCertificate,
  CertificateFilterInput,
  BulkCertificateGenerationInput,
  BulkCertificateGeneration,
} from '../dto/certificate-generation.dto';

@Resolver()
export class CertificateManagementResolver {
  constructor(
    private readonly certificateManagementService: CertificateManagementService,
  ) {}

  // Template Management Queries
  @Query(() => [CertificateTemplate], { name: 'certificateTemplates' })
  async getCertificateTemplates(
    @Args('denomination', { type: () => ChurchDenomination, nullable: true })
    denomination?: ChurchDenomination,
    @Args('sacramentType', {
      type: () => CertificateSacramentType,
      nullable: true,
    })
    sacramentType?: CertificateSacramentType,
  ): Promise<CertificateTemplate[]> {
    return this.certificateManagementService.getTemplates(
      denomination,
      sacramentType,
    );
  }

  @Query(() => CertificateTemplate, { name: 'certificateTemplate' })
  async getCertificateTemplate(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CertificateTemplate> {
    return this.certificateManagementService.getTemplateById(id);
  }

  @Query(() => CertificateTemplate, { name: 'defaultCertificateTemplate' })
  async getDefaultCertificateTemplate(
    @Args('denomination', { type: () => ChurchDenomination })
    denomination: ChurchDenomination,
    @Args('sacramentType', { type: () => CertificateSacramentType })
    sacramentType: CertificateSacramentType,
  ): Promise<CertificateTemplate> {
    return this.certificateManagementService.getDefaultTemplate(
      denomination,
      sacramentType,
    );
  }

  @Query(() => [ChurchDenomination], { name: 'supportedDenominations' })
  getSupportedDenominations(): ChurchDenomination[] {
    return this.certificateManagementService.getSupportedDenominations();
  }

  @Query(() => [CertificateSacramentType], {
    name: 'supportedCertificateSacramentTypes',
  })
  getSupportedCertificateSacramentTypes(): CertificateSacramentType[] {
    return this.certificateManagementService.getSupportedSacramentTypes();
  }

  // Certificate Generation Mutations
  @Mutation(() => CertificateGeneration, { name: 'generateCertificate' })
  async generateCertificate(
    @Args('input') input: GenerateCertificateInput,
    @Context() context: any,
  ): Promise<CertificateGeneration> {
    const userId = context.req.user.id;
    return this.certificateManagementService.generateCertificate(input, userId);
  }

  @Mutation(() => BulkCertificateGeneration, {
    name: 'bulkGenerateCertificates',
  })
  async bulkGenerateCertificates(
    @Args('input') input: BulkCertificateGenerationInput,
    @Context() context: any,
  ): Promise<BulkCertificateGeneration> {
    const userId = context.req.user.id;
    return this.certificateManagementService.bulkGenerateCertificates(
      input,
      userId,
    );
  }

  // Certificate Analytics and Stats Queries
  @Query(() => CertificateGenerationStats, {
    name: 'certificateGenerationStats',
  })
  async getCertificateGenerationStats(
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
  ): Promise<CertificateGenerationStats> {
    return this.certificateManagementService.getCertificateGenerationStats(
      branchId,
    );
  }

  @Query(() => [RecentCertificate], { name: 'recentCertificates' })
  async getRecentCertificates(
    @Args('limit', { type: () => Number, defaultValue: 10 }) limit: number,
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
  ): Promise<RecentCertificate[]> {
    return this.certificateManagementService.getRecentCertificates(
      limit,
      branchId,
    );
  }

  // Template Statistics Queries
  @Query(() => Number, { name: 'totalCertificateTemplates' })
  async getTotalCertificateTemplates(
    @Args('denomination', { type: () => ChurchDenomination, nullable: true })
    denomination?: ChurchDenomination,
  ): Promise<number> {
    const templates =
      await this.certificateManagementService.getTemplates(denomination);
    return templates.length;
  }

  @Query(() => Number, { name: 'totalSupportedDenominations' })
  getTotalSupportedDenominations(): number {
    return this.certificateManagementService.getSupportedDenominations().length;
  }

  @Query(() => Number, { name: 'totalSupportedSacramentTypes' })
  getTotalSupportedSacramentTypes(): number {
    return this.certificateManagementService.getSupportedSacramentTypes()
      .length;
  }

  // Template Search and Filtering
  @Query(() => [CertificateTemplate], { name: 'searchCertificateTemplates' })
  async searchCertificateTemplates(
    @Args('searchTerm', { type: () => String }) searchTerm: string,
    @Args('denomination', { type: () => ChurchDenomination, nullable: true })
    denomination?: ChurchDenomination,
    @Args('sacramentType', {
      type: () => CertificateSacramentType,
      nullable: true,
    })
    sacramentType?: CertificateSacramentType,
  ): Promise<CertificateTemplate[]> {
    const templates = await this.certificateManagementService.getTemplates(
      denomination,
      sacramentType,
    );

    // Filter templates by search term (name, description, or denomination)
    const filteredTemplates = templates.filter(
      (template) =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.denomination.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return filteredTemplates;
  }

  // Template Recommendations
  @Query(() => [CertificateTemplate], {
    name: 'recommendedCertificateTemplates',
  })
  async getRecommendedCertificateTemplates(
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('sacramentType', {
      type: () => CertificateSacramentType,
      nullable: true,
    })
    sacramentType?: CertificateSacramentType,
    @Args('limit', { type: () => Number, defaultValue: 5, nullable: true })
    limit?: number,
  ): Promise<CertificateTemplate[]> {
    // TODO: Implement logic to get branch denomination and recommend templates
    // For now, return default templates
    const templates = await this.certificateManagementService.getTemplates(
      undefined,
      sacramentType,
    );

    // Prioritize default templates
    const sortedTemplates = templates.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });

    return sortedTemplates.slice(0, limit || 5);
  }

  // Certificate Template Preview
  @Query(() => String, { name: 'certificateTemplatePreview' })
  async getCertificateTemplatePreview(
    @Args('templateId', { type: () => ID }) templateId: string,
    @Args('sacramentalRecordId', { type: () => ID })
    sacramentalRecordId: string,
  ): Promise<string> {
    // TODO: Implement template preview generation
    // For now, return a placeholder preview URL
    return `/api/certificates/preview/${templateId}/${sacramentalRecordId}`;
  }
}
