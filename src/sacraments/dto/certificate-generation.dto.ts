import {
  ObjectType,
  Field,
  ID,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';

export enum CertificateStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DOWNLOADED = 'DOWNLOADED',
}

export enum CertificateFormat {
  PDF = 'PDF',
  PNG = 'PNG',
  JPEG = 'JPEG',
}

// Register enums with GraphQL
registerEnumType(CertificateStatus, { name: 'CertificateStatus' });
registerEnumType(CertificateFormat, { name: 'CertificateFormat' });

@InputType()
export class CertificateFieldValue {
  @Field()
  fieldId: string;

  @Field()
  value: string;
}

@InputType()
export class GenerateCertificateInput {
  @Field(() => ID)
  sacramentalRecordId: string;

  @Field(() => ID)
  templateId: string;

  @Field(() => [CertificateFieldValue])
  fieldValues: CertificateFieldValue[];

  @Field(() => CertificateFormat, { defaultValue: CertificateFormat.PDF })
  format: CertificateFormat;

  @Field({ nullable: true })
  customMessage?: string;

  @Field({ nullable: true })
  includeChurchLogo?: boolean;

  @Field({ nullable: true })
  includeBranchLetterhead?: boolean;
}

@ObjectType()
export class CertificateGeneration {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  sacramentalRecordId: string;

  @Field(() => ID)
  templateId: string;

  @Field()
  certificateNumber: string;

  @Field(() => CertificateStatus)
  status: CertificateStatus;

  @Field(() => CertificateFormat)
  format: CertificateFormat;

  @Field({ nullable: true })
  fileUrl?: string;

  @Field({ nullable: true })
  downloadUrl?: string;

  @Field({ nullable: true })
  previewUrl?: string;

  @Field({ nullable: true })
  errorMessage?: string;

  @Field()
  generatedBy: string;

  @Field()
  generatedAt: Date;

  @Field({ nullable: true })
  downloadedAt?: Date;

  @Field()
  expiresAt: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class CertificateGenerationStats {
  @Field()
  totalGenerated: number;

  @Field()
  thisMonth: number;

  @Field()
  pending: number;

  @Field()
  completed: number;

  @Field()
  failed: number;

  @Field()
  monthlyGrowth: number;

  @Field()
  averageGenerationTime: number;

  @Field()
  mostUsedTemplate: string;

  @Field()
  totalDownloads: number;
}

@ObjectType()
export class RecentCertificate {
  @Field(() => ID)
  id: string;

  @Field()
  certificateNumber: string;

  @Field()
  memberName: string;

  @Field()
  sacramentType: string;

  @Field()
  templateName: string;

  @Field(() => CertificateStatus)
  status: CertificateStatus;

  @Field()
  generatedAt: Date;

  @Field({ nullable: true })
  downloadUrl?: string;
}

@InputType()
export class CertificateFilterInput {
  @Field({ nullable: true })
  branchId?: string;

  @Field({ nullable: true })
  sacramentType?: string;

  @Field({ nullable: true })
  status?: CertificateStatus;

  @Field({ nullable: true })
  dateFrom?: Date;

  @Field({ nullable: true })
  dateTo?: Date;

  @Field({ nullable: true })
  templateId?: string;

  @Field({ nullable: true })
  generatedBy?: string;
}

@InputType()
export class BulkCertificateGenerationInput {
  @Field(() => [ID])
  sacramentalRecordIds: string[];

  @Field(() => ID)
  templateId: string;

  @Field(() => CertificateFormat, { defaultValue: CertificateFormat.PDF })
  format: CertificateFormat;

  @Field({ nullable: true })
  includeChurchLogo?: boolean;

  @Field({ nullable: true })
  includeBranchLetterhead?: boolean;
}

@ObjectType()
export class BulkCertificateGeneration {
  @Field(() => ID)
  batchId: string;

  @Field()
  totalRecords: number;

  @Field()
  successCount: number;

  @Field()
  failureCount: number;

  @Field(() => [CertificateGeneration])
  certificates: CertificateGeneration[];

  @Field(() => [String])
  errors: string[];

  @Field()
  startedAt: Date;

  @Field({ nullable: true })
  completedAt?: Date;
}
