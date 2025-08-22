import { Module } from '@nestjs/common';
import { SacramentsService } from './sacraments.service';
import { SacramentsResolver } from './sacraments.resolver';
import { CertificateManagementService } from './services/certificate-management.service';
import { CertificateManagementResolver } from './resolvers/certificate-management.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [
    SacramentsResolver,
    SacramentsService,
    CertificateManagementService,
    CertificateManagementResolver,
    PrismaService,
  ],
  exports: [SacramentsService, CertificateManagementService],
})
export class SacramentsModule {}
