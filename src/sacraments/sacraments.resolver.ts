import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { SacramentsService } from './sacraments.service';
import { SacramentalRecord } from './entities/sacramental-record.entity';
import { CreateSacramentalRecordInput } from './dto/create-sacramental-record.input';
import { UpdateSacramentalRecordInput } from './dto/update-sacramental-record.input';
import { SacramentalRecordFilterInput } from './dto/sacramental-record-filter.input';
import { ParseUUIDPipe } from '@nestjs/common';
import { SacramentStatsOutput } from './dto/sacrament-stats.output';
import { SacramentAnniversaryOutput } from './dto/sacrament-anniversary.output';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Resolver(() => SacramentalRecord)
export class SacramentsResolver {
  constructor(private readonly sacramentsService: SacramentsService) {}

  @Query(() => [SacramentStatsOutput], { name: 'sacramentStats' })
  async sacramentStats(
    @Args('period', { nullable: true }) period?: string,
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
  ): Promise<SacramentStatsOutput[]> {
    return await this.sacramentsService.getSacramentStats(period, branchId);
  }

  @Query(() => [SacramentAnniversaryOutput], {
    name: 'upcomingSacramentAnniversaries',
  })
  async upcomingSacramentAnniversaries(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
  ): Promise<SacramentAnniversaryOutput[]> {
    return await this.sacramentsService.getUpcomingAnniversaries(
      limit,
      branchId,
    );
  }

  @Mutation(() => SacramentalRecord)
  async createSacramentalRecord(
    @Args('input') createSacramentalRecordInput: CreateSacramentalRecordInput,
  ): Promise<SacramentalRecord> {
    return this.sacramentsService.create(createSacramentalRecordInput);
  }

  @Query(() => [SacramentalRecord], { name: 'sacramentalRecords' })
  async findAll(
    @Args('filter', { nullable: true }) filter?: SacramentalRecordFilterInput,
  ): Promise<SacramentalRecord[]> {
    return this.sacramentsService.findAll(filter);
  }

  @Query(() => SacramentalRecord, { name: 'sacramentalRecord' })
  async findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<SacramentalRecord> {
    return this.sacramentsService.findOne(id);
  }

  @Query(() => [SacramentalRecord], { name: 'sacramentsByMember' })
  async findByMember(
    @Args('memberId', { type: () => ID }, ParseUUIDPipe) memberId: string,
  ): Promise<SacramentalRecord[]> {
    return this.sacramentsService.findByMember(memberId);
  }

  @Mutation(() => SacramentalRecord)
  async updateSacramentalRecord(
    @Args('input') updateSacramentalRecordInput: UpdateSacramentalRecordInput,
  ): Promise<SacramentalRecord> {
    return this.sacramentsService.update(
      updateSacramentalRecordInput.id,
      updateSacramentalRecordInput,
    );
  }

  @Mutation(() => Boolean)
  async deleteSacramentalRecord(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<boolean> {
    return this.sacramentsService.remove(id);
  }

  @Mutation(() => SacramentalRecord)
  async uploadSacramentalCertificate(
    @Args('recordId', { type: () => ID }, ParseUUIDPipe) recordId: string,
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ): Promise<SacramentalRecord> {
    const { createReadStream, filename, mimetype } = await file;

    // Validate file type
    if (!mimetype.match(/^(image\/|application\/pdf)/)) {
      throw new Error('Invalid file type. Only images and PDFs are allowed.');
    }

    // Generate unique filename
    const fileExtension = filename.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;

    // Define upload path
    const uploadsDir = join(process.cwd(), 'uploads', 'certificates');
    const filePath = join(uploadsDir, uniqueFilename);

    // Save file
    const writeStream = createWriteStream(filePath);
    createReadStream().pipe(writeStream);

    // Wait for the file to be written
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    });

    // Generate URL for the certificate
    const certificateUrl = `/uploads/certificates/${uniqueFilename}`;

    // Update the record with the certificate URL
    return this.sacramentsService.uploadCertificate(recordId, certificateUrl);
  }
}
