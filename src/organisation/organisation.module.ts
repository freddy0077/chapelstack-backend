import { Module } from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { OrganisationResolver } from './organisation.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from './services/s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    OrganisationResolver,
    OrganisationService,
    S3Service,
    PrismaService,
  ],
  exports: [OrganisationService],
})
export class OrganisationModule {}
