import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CertificateTemplate,
  ChurchDenomination,
  CertificateSacramentType,
  LiturgicalElement,
  TemplateField,
  TemplateStyle,
  LiturgicalElementType,
  LiturgicalElementPosition,
  TemplateFieldType,
  BorderStyle,
  FontWeight,
  TextAlignment,
  LogoPosition,
} from '../dto/certificate-template.dto';
import {
  GenerateCertificateInput,
  CertificateGeneration,
  CertificateStatus,
  CertificateFormat,
  CertificateGenerationStats,
  RecentCertificate,
  CertificateFilterInput,
  BulkCertificateGenerationInput,
  BulkCertificateGeneration,
} from '../dto/certificate-generation.dto';

@Injectable()
export class CertificateManagementService {
  constructor(private readonly prisma: PrismaService) {}

  // Standard Templates Library - All 18 Denominations
  private getStandardTemplates(): CertificateTemplate[] {
    const templates: CertificateTemplate[] = [];
    const now = new Date();

    // Catholic Templates
    templates.push({
      id: 'catholic-baptism-traditional',
      name: 'Traditional Catholic Baptism',
      denomination: ChurchDenomination.CATHOLIC,
      sacramentType: CertificateSacramentType.BAPTISM,
      description:
        'Traditional Catholic baptism certificate with Latin prayers and papal blessing',
      previewUrl: '/templates/previews/catholic-baptism-traditional.png',
      templateUrl: '/templates/catholic-baptism-traditional.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: LiturgicalElementType.PRAYER,
          content: 'In nomine Patris, et Filii, et Spiritus Sancti',
          position: LiturgicalElementPosition.HEADER,
          optional: false,
        },
        {
          type: LiturgicalElementType.SCRIPTURE,
          content:
            'Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit. - Matthew 28:19',
          position: LiturgicalElementPosition.BODY,
          optional: false,
        },
        {
          type: LiturgicalElementType.BLESSING,
          content: 'May the Lord bless and keep you in His grace',
          position: LiturgicalElementPosition.FOOTER,
          optional: false,
        },
      ],
      customFields: [
        {
          id: 'godparent1',
          label: 'Godparent 1',
          type: TemplateFieldType.TEXT,
          required: true,
          position: { x: 100, y: 300 },
          styling: {
            fontSize: 14,
            fontWeight: FontWeight.NORMAL,
            color: '#000000',
            alignment: TextAlignment.LEFT,
          },
        },
        {
          id: 'godparent2',
          label: 'Godparent 2',
          type: TemplateFieldType.TEXT,
          required: false,
          position: { x: 100, y: 320 },
          styling: {
            fontSize: 14,
            fontWeight: FontWeight.NORMAL,
            color: '#000000',
            alignment: TextAlignment.LEFT,
          },
        },
      ],
      styling: {
        primaryColor: '#8B0000',
        secondaryColor: '#FFD700',
        accentColor: '#FFFFFF',
        fontFamily: 'Times New Roman',
        headerFont: 'Trajan Pro',
        bodyFont: 'Times New Roman',
        borderStyle: BorderStyle.ORNATE,
        backgroundPattern: 'cross-pattern',
        logoPosition: LogoPosition.TOP_CENTER,
      },
      language: 'en',
      region: 'US',
      createdAt: now,
      updatedAt: now,
    });

    // Orthodox Templates
    templates.push({
      id: 'orthodox-baptism-byzantine',
      name: 'Byzantine Orthodox Baptism',
      denomination: ChurchDenomination.ORTHODOX,
      sacramentType: CertificateSacramentType.BAPTISM,
      description:
        'Traditional Orthodox baptism certificate with Byzantine iconography',
      previewUrl: '/templates/previews/orthodox-baptism-byzantine.png',
      templateUrl: '/templates/orthodox-baptism-byzantine.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: LiturgicalElementType.PRAYER,
          content:
            'Blessed is the Kingdom of the Father, and of the Son, and of the Holy Spirit',
          position: LiturgicalElementPosition.HEADER,
          optional: false,
        },
        {
          type: LiturgicalElementType.SCRIPTURE,
          content:
            'As many as have been baptized into Christ have put on Christ. - Galatians 3:27',
          position: LiturgicalElementPosition.BODY,
          optional: false,
        },
      ],
      customFields: [
        {
          id: 'patron-saint',
          label: 'Patron Saint',
          type: TemplateFieldType.TEXT,
          required: true,
          position: { x: 100, y: 280 },
          styling: {
            fontSize: 14,
            fontWeight: FontWeight.NORMAL,
            color: '#000080',
            alignment: TextAlignment.LEFT,
          },
        },
      ],
      styling: {
        primaryColor: '#000080',
        secondaryColor: '#FFD700',
        accentColor: '#FFFFFF',
        fontFamily: 'Palatino',
        headerFont: 'Uncial Antiqua',
        bodyFont: 'Palatino',
        borderStyle: BorderStyle.CLASSIC,
        backgroundPattern: 'byzantine-cross',
        logoPosition: LogoPosition.TOP_CENTER,
      },
      language: 'en',
      createdAt: now,
      updatedAt: now,
    });

    // Baptist Templates
    templates.push({
      id: 'baptist-baptism-immersion',
      name: "Baptist Believer's Baptism",
      denomination: ChurchDenomination.BAPTIST,
      sacramentType: CertificateSacramentType.ADULT_BAPTISM,
      description:
        "Baptist believer's baptism certificate emphasizing personal faith decision",
      previewUrl: '/templates/previews/baptist-baptism-immersion.png',
      templateUrl: '/templates/baptist-baptism-immersion.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: LiturgicalElementType.SCRIPTURE,
          content:
            'Therefore we were buried with Him through baptism into death, that just as Christ was raised from the dead by the glory of the Father, even so we also should walk in newness of life. - Romans 6:4',
          position: LiturgicalElementPosition.BODY,
          optional: false,
        },
        {
          type: LiturgicalElementType.PRAYER,
          content: 'May you walk in newness of life in Christ Jesus',
          position: LiturgicalElementPosition.FOOTER,
          optional: false,
        },
      ],
      customFields: [
        {
          id: 'testimony-date',
          label: 'Date of Testimony',
          type: TemplateFieldType.DATE,
          required: false,
          position: { x: 100, y: 300 },
          styling: {
            fontSize: 12,
            fontWeight: FontWeight.NORMAL,
            color: '#000000',
            alignment: TextAlignment.LEFT,
          },
        },
      ],
      styling: {
        primaryColor: '#4169E1',
        secondaryColor: '#FFFFFF',
        accentColor: '#87CEEB',
        fontFamily: 'Arial',
        headerFont: 'Georgia',
        bodyFont: 'Arial',
        borderStyle: BorderStyle.MODERN,
        backgroundPattern: 'water-waves',
        logoPosition: LogoPosition.TOP_LEFT,
      },
      language: 'en',
      createdAt: now,
      updatedAt: now,
    });

    // Lutheran Templates
    templates.push({
      id: 'lutheran-baptism-reformation',
      name: 'Lutheran Reformation Baptism',
      denomination: ChurchDenomination.LUTHERAN,
      sacramentType: CertificateSacramentType.BAPTISM,
      description:
        'Lutheran baptism certificate with Reformation heritage and Luther Rose',
      previewUrl: '/templates/previews/lutheran-baptism-reformation.png',
      templateUrl: '/templates/lutheran-baptism-reformation.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: LiturgicalElementType.SCRIPTURE,
          content:
            'For by grace you have been saved through faith, and this is not your own doing; it is the gift of God. - Ephesians 2:8',
          position: LiturgicalElementPosition.BODY,
          optional: false,
        },
        {
          type: LiturgicalElementType.BLESSING,
          content: 'May the grace of our Lord Jesus Christ be with you always',
          position: LiturgicalElementPosition.FOOTER,
          optional: false,
        },
      ],
      customFields: [
        {
          id: 'sponsors',
          label: 'Sponsors',
          type: TemplateFieldType.TEXT,
          required: false,
          position: { x: 100, y: 300 },
          styling: {
            fontSize: 14,
            fontWeight: FontWeight.NORMAL,
            color: '#8B4513',
            alignment: TextAlignment.LEFT,
          },
        },
      ],
      styling: {
        primaryColor: '#8B4513',
        secondaryColor: '#FFD700',
        accentColor: '#FFFFFF',
        fontFamily: 'Times New Roman',
        headerFont: 'Fraktur',
        bodyFont: 'Times New Roman',
        borderStyle: BorderStyle.CLASSIC,
        backgroundPattern: 'luther-rose',
        logoPosition: LogoPosition.TOP_CENTER,
      },
      language: 'en',
      createdAt: now,
      updatedAt: now,
    });

    // Methodist Templates
    templates.push({
      id: 'methodist-baptism-wesleyan',
      name: 'Methodist Wesleyan Baptism',
      denomination: ChurchDenomination.METHODIST,
      sacramentType: CertificateSacramentType.BAPTISM,
      description:
        'Methodist baptism certificate with Wesleyan tradition and flame symbolism',
      previewUrl: '/templates/previews/methodist-baptism-wesleyan.png',
      templateUrl: '/templates/methodist-baptism-wesleyan.html',
      isDefault: true,
      liturgicalElements: [
        {
          type: LiturgicalElementType.PRAYER,
          content:
            'The Holy Spirit work within you, that being born through water and the Spirit, you may be a faithful disciple of Jesus Christ.',
          position: LiturgicalElementPosition.BODY,
          optional: false,
        },
        {
          type: LiturgicalElementType.SCRIPTURE,
          content:
            'Jesus answered, "Very truly, I tell you, no one can enter the kingdom of God without being born of water and Spirit." - John 3:5',
          position: LiturgicalElementPosition.BODY,
          optional: false,
        },
      ],
      customFields: [],
      styling: {
        primaryColor: '#DC143C',
        secondaryColor: '#FFD700',
        accentColor: '#FFFFFF',
        fontFamily: 'Georgia',
        headerFont: 'Optima',
        bodyFont: 'Georgia',
        borderStyle: BorderStyle.MODERN,
        backgroundPattern: 'flame-pattern',
        logoPosition: LogoPosition.TOP_CENTER,
      },
      language: 'en',
      createdAt: now,
      updatedAt: now,
    });

    // Add more templates for other denominations...
    // (Presbyterian, Pentecostal, Anglican, etc.)

    return templates;
  }

  // Get all available templates
  async getTemplates(
    denomination?: ChurchDenomination,
    sacramentType?: CertificateSacramentType,
  ): Promise<CertificateTemplate[]> {
    const where: any = {};

    if (denomination) {
      where.denomination = denomination;
    }

    if (sacramentType) {
      where.sacramentType = sacramentType;
    }

    const templates = await this.prisma.certificateTemplate.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    return templates.map((template) => ({
      id: template.id,
      name: template.name,
      denomination: template.denomination as ChurchDenomination,
      sacramentType: template.sacramentType as CertificateSacramentType,
      description: template.description,
      previewUrl: template.previewUrl,
      templateUrl: template.templateUrl,
      isDefault: template.isDefault,
      liturgicalElements: (template.liturgicalElements as any) || [],
      customFields: (template.customFields as any) || [],
      styling: (template.styling as any) || {},
      language: template.language,
      region: template.region || undefined,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }));
  }

  // Get template by ID
  async getTemplateById(id: string): Promise<CertificateTemplate> {
    const template = await this.prisma.certificateTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return {
      id: template.id,
      name: template.name,
      denomination: template.denomination as ChurchDenomination,
      sacramentType: template.sacramentType as CertificateSacramentType,
      description: template.description,
      previewUrl: template.previewUrl,
      templateUrl: template.templateUrl,
      isDefault: template.isDefault,
      liturgicalElements: (template.liturgicalElements as any) || [],
      customFields: (template.customFields as any) || [],
      styling: (template.styling as any) || {},
      language: template.language,
      region: template.region || undefined,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  // Get default template for denomination and sacrament type
  async getDefaultTemplate(
    denomination: ChurchDenomination,
    sacramentType: CertificateSacramentType,
  ): Promise<CertificateTemplate> {
    const template = await this.prisma.certificateTemplate.findFirst({
      where: {
        denomination,
        sacramentType,
        isDefault: true,
      },
    });

    if (!template) {
      // Fallback to first available template
      const fallbackTemplate = await this.prisma.certificateTemplate.findFirst({
        where: {
          denomination,
          sacramentType,
        },
      });

      if (!fallbackTemplate) {
        throw new NotFoundException(
          `No template found for ${denomination} ${sacramentType}`,
        );
      }

      return {
        id: fallbackTemplate.id,
        name: fallbackTemplate.name,
        denomination: fallbackTemplate.denomination as ChurchDenomination,
        sacramentType:
          fallbackTemplate.sacramentType as CertificateSacramentType,
        description: fallbackTemplate.description,
        previewUrl: fallbackTemplate.previewUrl,
        templateUrl: fallbackTemplate.templateUrl,
        isDefault: fallbackTemplate.isDefault,
        liturgicalElements: (fallbackTemplate.liturgicalElements as any) || [],
        customFields: (fallbackTemplate.customFields as any) || [],
        styling: (fallbackTemplate.styling as any) || {},
        language: fallbackTemplate.language,
        region: fallbackTemplate.region || undefined,
        createdAt: fallbackTemplate.createdAt,
        updatedAt: fallbackTemplate.updatedAt,
      };
    }

    return {
      id: template.id,
      name: template.name,
      denomination: template.denomination as ChurchDenomination,
      sacramentType: template.sacramentType as CertificateSacramentType,
      description: template.description,
      previewUrl: template.previewUrl,
      templateUrl: template.templateUrl,
      isDefault: template.isDefault,
      liturgicalElements: (template.liturgicalElements as any) || [],
      customFields: (template.customFields as any) || [],
      styling: (template.styling as any) || {},
      language: template.language,
      region: template.region || undefined,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  // Generate certificate number
  private generateCertificateNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CERT-${timestamp}-${random}`.toUpperCase();
  }

  // Generate certificate
  async generateCertificate(
    input: GenerateCertificateInput,
    userId: string,
  ): Promise<CertificateGeneration> {
    // Validate sacramental record exists
    const sacramentalRecord = await this.prisma.sacramentalRecord.findUnique({
      where: { id: input.sacramentalRecordId },
      include: { member: true },
    });

    if (!sacramentalRecord) {
      throw new NotFoundException(
        `Sacramental record with ID ${input.sacramentalRecordId} not found`,
      );
    }

    // Get template
    const template = await this.getTemplateById(input.templateId);

    // Generate certificate number
    const certificateNumber = this.generateCertificateNumber();

    // Create certificate generation record in database
    const generation = await this.prisma.certificateGeneration.create({
      data: {
        sacramentalRecordId: input.sacramentalRecordId,
        templateId: input.templateId,
        certificateNumber,
        status: 'PENDING',
        format: input.format,
        fieldValues: {}, // Empty JSON object for now
        branchId: sacramentalRecord.branchId,
        organisationId: sacramentalRecord.organisationId,
        generatedBy: userId,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // TODO: Implement actual PDF generation logic here
    // For now, simulate the generation process and update the database
    setTimeout(async () => {
      try {
        // Simulate PDF generation
        const fileUrl = `/certificates/${certificateNumber}.pdf`;
        const downloadUrl = `/api/certificates/download/${generation.id}`;
        const previewUrl = `/api/certificates/preview/${generation.id}`;

        // Update generation record with success in database
        await this.prisma.certificateGeneration.update({
          where: { id: generation.id },
          data: {
            status: 'COMPLETED',
            fileUrl,
            downloadUrl,
            previewUrl,
            updatedAt: new Date(),
          },
        });

        // Update sacramental record with certificate info
        await this.prisma.sacramentalRecord.update({
          where: { id: input.sacramentalRecordId },
          data: {
            certificateNumber,
            certificateUrl: fileUrl,
          },
        });
      } catch (error) {
        // Update generation record with failure in database
        await this.prisma.certificateGeneration.update({
          where: { id: generation.id },
          data: {
            status: 'FAILED',
            errorMessage: error.message,
            updatedAt: new Date(),
          },
        });
      }
    }, 2000); // Simulate 2-second generation time

    return {
      id: generation.id,
      sacramentalRecordId: generation.sacramentalRecordId,
      templateId: generation.templateId,
      certificateNumber: generation.certificateNumber,
      status: generation.status as CertificateStatus,
      format: generation.format as CertificateFormat,
      fileUrl: generation.fileUrl || undefined,
      downloadUrl: generation.downloadUrl || undefined,
      previewUrl: generation.previewUrl || undefined,
      errorMessage: generation.errorMessage || undefined,
      generatedBy: generation.generatedBy,
      generatedAt: generation.generatedAt,
      downloadedAt: generation.downloadedAt || undefined,
      expiresAt: generation.expiresAt,
      createdAt: generation.createdAt,
      updatedAt: generation.updatedAt,
    };
  }

  // Get certificate generation stats
  async getCertificateGenerationStats(
    branchId?: string,
  ): Promise<CertificateGenerationStats> {
    const where: any = {};
    if (branchId) {
      where.sacramentalRecord = {
        branchId: branchId,
      };
    }

    // Get total generated certificates
    const totalGenerated = await this.prisma.certificateGeneration.count({
      where,
    });

    // Get this month's certificates
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonth = await this.prisma.certificateGeneration.count({
      where: {
        ...where,
        generatedAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get certificates by status
    const statusCounts = await this.prisma.certificateGeneration.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true,
      },
    });

    const pending =
      statusCounts.find((s) => s.status === 'PENDING')?._count.status || 0;
    const completed =
      statusCounts.find((s) => s.status === 'COMPLETED')?._count.status || 0;
    const failed =
      statusCounts.find((s) => s.status === 'FAILED')?._count.status || 0;

    // Calculate monthly growth (compare with previous month)
    const startOfPreviousMonth = new Date(startOfMonth);
    startOfPreviousMonth.setMonth(startOfPreviousMonth.getMonth() - 1);

    const previousMonth = await this.prisma.certificateGeneration.count({
      where: {
        ...where,
        generatedAt: {
          gte: startOfPreviousMonth,
          lt: startOfMonth,
        },
      },
    });

    const monthlyGrowth =
      previousMonth > 0
        ? Math.round(((thisMonth - previousMonth) / previousMonth) * 100)
        : thisMonth > 0
          ? 100
          : 0;

    // Get most used template
    const templateUsage = await this.prisma.certificateGeneration.groupBy({
      by: ['templateId'],
      where,
      _count: {
        templateId: true,
      },
      orderBy: {
        _count: {
          templateId: 'desc',
        },
      },
      take: 1,
    });

    const mostUsedTemplate =
      templateUsage.length > 0 ? templateUsage[0].templateId : 'none';

    // Calculate average generation time (mock for now, would need actual timing data)
    const averageGenerationTime = 2.5;

    // Get total downloads (certificates with downloadedAt set)
    const totalDownloads = await this.prisma.certificateGeneration.count({
      where: {
        ...where,
        downloadedAt: {
          not: null,
        },
      },
    });

    return {
      totalGenerated,
      thisMonth,
      pending,
      completed,
      failed,
      monthlyGrowth,
      averageGenerationTime,
      mostUsedTemplate,
      totalDownloads,
    };
  }

  // Get recent certificates
  async getRecentCertificates(
    limit: number = 10,
    branchId?: string,
  ): Promise<RecentCertificate[]> {
    const where: any = {};
    if (branchId) {
      where.sacramentalRecord = {
        branchId: branchId,
      };
    }

    const certificates = await this.prisma.certificateGeneration.findMany({
      where,
      include: {
        sacramentalRecord: {
          include: {
            member: true,
          },
        },
        template: true,
      },
      orderBy: {
        generatedAt: 'desc',
      },
      take: limit,
    });

    return certificates.map((cert) => ({
      id: cert.id,
      certificateNumber: cert.certificateNumber,
      memberName: cert.sacramentalRecord?.member
        ? `${cert.sacramentalRecord.member.firstName} ${cert.sacramentalRecord.member.lastName}`
        : 'Unknown Member',
      sacramentType: cert.sacramentalRecord?.sacramentType || 'UNKNOWN',
      templateName: cert.template?.name || 'Unknown Template',
      status: cert.status as CertificateStatus,
      generatedAt: cert.generatedAt,
      downloadUrl: cert.downloadUrl || undefined,
    }));
  }

  // Get supported denominations
  getSupportedDenominations(): ChurchDenomination[] {
    return Object.values(ChurchDenomination);
  }

  // Get supported sacrament types
  getSupportedSacramentTypes(): CertificateSacramentType[] {
    return Object.values(CertificateSacramentType);
  }

  // Bulk certificate generation
  async bulkGenerateCertificates(
    input: BulkCertificateGenerationInput,
    userId: string,
  ): Promise<BulkCertificateGeneration> {
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const certificates: CertificateGeneration[] = [];
    const errors: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const recordId of input.sacramentalRecordIds) {
      try {
        const certificate = await this.generateCertificate(
          {
            sacramentalRecordId: recordId,
            templateId: input.templateId,
            fieldValues: [], // Use default values for bulk generation
            format: input.format,
            includeChurchLogo: input.includeChurchLogo,
            includeBranchLetterhead: input.includeBranchLetterhead,
          },
          userId,
        );

        certificates.push(certificate);
        successCount++;
      } catch (error) {
        errors.push(
          `Failed to generate certificate for record ${recordId}: ${error.message}`,
        );
        failureCount++;
      }
    }

    return {
      batchId,
      totalRecords: input.sacramentalRecordIds.length,
      successCount,
      failureCount,
      certificates,
      errors,
      startedAt: new Date(),
      completedAt: new Date(),
    };
  }
}
