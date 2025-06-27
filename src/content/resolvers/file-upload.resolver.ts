import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { S3UploadService } from '../services/s3-upload.service';
import { FileUploadInput } from '../dto/file-upload.input';
import { MediaType } from '../enums/media-type.enum';
import { FileUploadResponse } from '../dto/file-upload.response';
import { MediaItemsService } from '../services/media-items.service';

@Resolver()
export class FileUploadResolver {
  constructor(
    private readonly s3UploadService: S3UploadService,
    private readonly mediaItemsService: MediaItemsService,
  ) {}

  @Mutation(() => FileUploadResponse)
  async getPresignedUploadUrl(
    @Args('input') input: FileUploadInput,
  ): Promise<FileUploadResponse> {
    // Determine the appropriate directory based on media type
    let directory = input.directory || 'general';
    if (!input.directory) {
      // Use MediaType enum for better type safety
      switch (input.mediaType) {
        case MediaType.AUDIO_FILE:
          directory = 'audio';
          break;
        case MediaType.VIDEO:
          directory = 'video';
          break;
        case MediaType.IMAGE:
          directory = 'images';
          break;
        case MediaType.DOCUMENT_PDF:
        case MediaType.DOCUMENT_WORD:
          directory = 'documents';
          break;
        case MediaType.SLIDESHOW:
          directory = 'presentations';
          break;
        default:
          directory = 'other';
      }
    }

    // Generate the presigned URL for uploading
    const { uploadUrl, fileUrl } =
      await this.s3UploadService.generatePresignedUploadUrl(
        input.fileName,
        input.contentType,
        directory,
      );

    // Create a media item record in the database
    const mediaItem = await this.mediaItemsService.create({
      title: input.fileName,
      description: input.description,
      fileUrl,
      mimeType: input.contentType,
      fileSize: 0, // This will be updated after the actual upload
      type: input.mediaType,
      branchId: input.branchId,
      uploadedBy: 'system', // This should be replaced with the actual user ID from context
    });

    // Ensure we have a valid media item with an ID
    if (!mediaItem || !mediaItem.id) {
      throw new Error('Failed to create media item record');
    }

    return {
      uploadUrl,
      fileUrl,
      mediaItemId: mediaItem.id,
    };
  }

  @Mutation(() => Boolean)
  async deleteFile(@Args('id') id: string): Promise<boolean> {
    try {
      // Find the media item first
      const mediaItem = await this.mediaItemsService.findOne(id);
      if (!mediaItem) {
        throw new Error(`Media item with id ${id} not found`);
      }

      if (!mediaItem.fileUrl) {
        throw new Error(`Media item with id ${id} has no file URL`);
      }

      // Delete from S3
      const success = await this.s3UploadService.deleteFile(mediaItem.fileUrl);
      if (!success) {
        throw new Error(`Failed to delete file from S3: ${mediaItem.fileUrl}`);
      }

      // Delete the media item record
      await this.mediaItemsService.remove(id);

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}
