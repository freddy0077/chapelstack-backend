import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { OrganisationService } from './organisation.service';
import { Organisation } from './dto/organisation.model';
import { CreateOrganisationInput } from './dto/create-organisation.input';
import { UpdateOrganisationInput } from './dto/update-organisation.input';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { S3Service } from './services/s3.service';

interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Resolver(() => Organisation)
export class OrganisationResolver {
  constructor(
    private readonly organisationService: OrganisationService,
    private readonly s3Service: S3Service,
  ) {}

  @Query(() => [Organisation], { name: 'organisations' })
  findAll() {
    return this.organisationService.findAll();
  }

  @Query(() => Organisation, { name: 'organisation', nullable: true })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.organisationService.findOne(id);
  }

  @Mutation(() => Organisation)
  createOrganisation(@Args('input') input: CreateOrganisationInput) {
    return this.organisationService.create(input);
  }

  @Mutation(() => Organisation)
  updateOrganisation(@Args('input') input: UpdateOrganisationInput) {
    return this.organisationService.update(input.id, input);
  }

  @Mutation(() => Boolean)
  deleteOrganisation(@Args('id', { type: () => ID }) id: string) {
    return this.organisationService.delete(id);
  }

  @Mutation(() => String)
  async uploadOrganisationBrandingFile(
    @Args('organisationId', { type: () => ID }) organisationId: string,
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
  ): Promise<string> {
    // Read file buffer
    const { createReadStream, mimetype, filename } = await file;
    const chunks: Buffer[] = [];
    const stream = createReadStream();
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const fileObj: UploadedFile = {
      originalname: filename,
      mimetype,
      buffer,
    };
    // organisationId is available here for future association logic
    return this.s3Service.uploadFile(fileObj);
  }
}
