/**
 * Temporary type declarations for Prisma models that don't exist in the schema yet
 * These will be used to help TypeScript understand the models until they are properly added to the schema
 */

// Temporary License model type to match the entity
export type PrismaLicense = {
  id: string;
  key: string;
  type: string;
  status: string;
  startDate: Date;
  expiryDate: Date;
  organizationName?: string;
  contactEmail?: string;
  contactPhone?: string;
  features?: Record<string, any>;
  maxUsers?: number;
  maxBranches?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Extended PrismaClient with the missing License model
export type PrismaClientWithLicense = {
  license: {
    create: (args: { data: Partial<PrismaLicense> }) => Promise<PrismaLicense>;
    findUnique: (args: {
      where: { id?: string; key?: string };
    }) => Promise<PrismaLicense | null>;
    findFirst: (args: {
      where: any;
      orderBy?: any;
    }) => Promise<PrismaLicense | null>;
    findMany: (args: {
      where?: any;
      orderBy?: any;
      take?: number;
    }) => Promise<PrismaLicense[]>;
    update: (args: {
      where: { id: string };
      data: Partial<PrismaLicense>;
    }) => Promise<PrismaLicense>;
    delete: (args: { where: { id: string } }) => Promise<PrismaLicense>;
  };
};
