import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadResolver } from './file-upload.resolver';
import { S3UploadService } from '../services/s3-upload.service';
import { MediaItemsService } from '../services/media-items.service';
import { FileUploadInput, MediaType } from '../dto/file-upload.input';

describe('FileUploadResolver', () => {
  let resolver: FileUploadResolver;
  let mockS3UploadService: Partial<S3UploadService>;
  let mockMediaItemsService: Partial<MediaItemsService>;

  beforeEach(async () => {
    // Create mock services
    mockS3UploadService = {
      generatePresignedUploadUrl: jest.fn().mockResolvedValue({
        uploadUrl: 'https://presigned-url.example.com',
        fileUrl: 'https://bucket.s3.amazonaws.com/audio/test-file.mp3',
      }),
      deleteFile: jest.fn().mockResolvedValue(true),
    };

    mockMediaItemsService = {
      create: jest.fn().mockResolvedValue({
        id: 'test-media-item-id',
        title: 'Test File',
        fileUrl: 'https://bucket.s3.amazonaws.com/audio/test-file.mp3',
        type: 'AUDIO_FILE',
      }),
      findOne: jest.fn().mockResolvedValue({
        id: 'test-media-item-id',
        title: 'Test File',
        fileUrl: 'https://bucket.s3.amazonaws.com/audio/test-file.mp3',
        type: 'AUDIO_FILE',
      }),
      remove: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadResolver,
        {
          provide: S3UploadService,
          useValue: mockS3UploadService,
        },
        {
          provide: MediaItemsService,
          useValue: mockMediaItemsService,
        },
      ],
    }).compile();

    resolver = module.get<FileUploadResolver>(FileUploadResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getPresignedUploadUrl', () => {
    it('should generate a presigned URL and create a media item', async () => {
      // Arrange
      const input: FileUploadInput = {
        fileName: 'test-file.mp3',
        contentType: 'audio/mpeg',
        mediaType: MediaType.AUDIO_FILE,
        branchId: 'test-branch-id',
      };

      // Act
      const result = await resolver.getPresignedUploadUrl(input);

      // Assert
      expect(result).toEqual({
        uploadUrl: 'https://presigned-url.example.com',
        fileUrl: 'https://bucket.s3.amazonaws.com/audio/test-file.mp3',
        mediaItemId: 'test-media-item-id',
      });

      expect(
        mockS3UploadService.generatePresignedUploadUrl,
      ).toHaveBeenCalledWith('test-file.mp3', 'audio/mpeg', 'audio');

      expect(mockMediaItemsService.create).toHaveBeenCalledWith({
        title: 'test-file.mp3',
        description: undefined,
        fileUrl: 'https://bucket.s3.amazonaws.com/audio/test-file.mp3',
        mimeType: 'audio/mpeg',
        fileSize: 0,
        type: 'AUDIO_FILE',
        branchId: 'test-branch-id',
        uploadedBy: 'system',
      });
    });

    it('should use custom directory if provided', async () => {
      // Arrange
      const input: FileUploadInput = {
        fileName: 'test-file.mp3',
        contentType: 'audio/mpeg',
        mediaType: MediaType.AUDIO_FILE,
        branchId: 'test-branch-id',
        directory: 'custom-directory',
      };

      // Act
      await resolver.getPresignedUploadUrl(input);

      // Assert
      expect(
        mockS3UploadService.generatePresignedUploadUrl,
      ).toHaveBeenCalledWith('test-file.mp3', 'audio/mpeg', 'custom-directory');
    });
  });

  describe('deleteFile', () => {
    it('should delete a file and its media item record', async () => {
      // Arrange
      const mediaItemId = 'test-media-item-id';

      // Act
      const result = await resolver.deleteFile(mediaItemId);

      // Assert
      expect(result).toBe(true);
      expect(mockMediaItemsService.findOne).toHaveBeenCalledWith(mediaItemId);
      expect(mockS3UploadService.deleteFile).toHaveBeenCalledWith(
        'https://bucket.s3.amazonaws.com/audio/test-file.mp3',
      );
      expect(mockMediaItemsService.remove).toHaveBeenCalledWith(mediaItemId);
    });

    it('should throw an error if media item not found', async () => {
      // Arrange
      const mediaItemId = 'nonexistent-id';
      mockMediaItemsService.findOne = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(resolver.deleteFile(mediaItemId)).rejects.toThrow();
      expect(mockS3UploadService.deleteFile).not.toHaveBeenCalled();
      expect(mockMediaItemsService.remove).not.toHaveBeenCalled();
    });

    it('should throw an error if S3 deletion fails', async () => {
      // Arrange
      const mediaItemId = 'test-media-item-id';
      mockS3UploadService.deleteFile = jest.fn().mockResolvedValue(false);

      // Act & Assert
      await expect(resolver.deleteFile(mediaItemId)).rejects.toThrow(
        'Failed to delete file from S3',
      );
      expect(mockS3UploadService.deleteFile).toHaveBeenCalled();
      expect(mockMediaItemsService.remove).not.toHaveBeenCalled();
    });
  });
});
