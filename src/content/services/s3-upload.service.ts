import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3UploadService {
  private s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.region =
      this.configService.get<string>('AWS_S3_REGION') || 'us-east-1';
    this.bucketName =
      this.configService.get<string>('AWS_S3_BUCKET_NAME') || 'default-bucket';

    const accessKeyId =
      this.configService.get<string>('AWS_ACCESS_KEY_ID') || 'default-key';
    const secretAccessKey =
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ||
      'default-secret';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.baseUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com`;
  }

  /**
   * Generate a pre-signed URL for uploading a file directly to S3
   * @param fileName Original file name
   * @param contentType MIME type of the file
   * @param directory Optional subdirectory within the bucket
   * @returns Object containing the upload URL and the final file URL
   */
  async generatePresignedUploadUrl(
    fileName: string,
    contentType: string,
    directory = 'general',
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    // Generate a unique file name to prevent collisions
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${directory}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: uniqueFileName,
      ContentType: contentType,
    });

    // Generate a pre-signed URL that expires in 15 minutes
    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 900, // 15 minutes
    });

    // Return both the upload URL and the final URL where the file will be accessible
    return {
      uploadUrl,
      fileUrl: `${this.baseUrl}/${uniqueFileName}`,
    };
  }

  /**
   * Delete a file from S3
   * @param fileUrl The complete URL of the file to delete
   * @returns True if deletion was successful
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Extract the key from the file URL
      const key = fileUrl.replace(`${this.baseUrl}/`, '');

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      return false;
    }
  }

  /**
   * Get the file URL from a key
   * @param key The S3 object key
   * @returns The complete URL to access the file
   */
  getFileUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}
