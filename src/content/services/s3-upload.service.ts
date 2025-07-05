import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Config } from '../../config/s3-config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3UploadService {
  private readonly s3Client: S3Client;
  private readonly region: string;
  private readonly bucketName: string;
  private readonly baseUrl: string;

  private async init() {
    try {
      const command = new HeadBucketCommand({ Bucket: this.bucketName });
      await this.s3Client.send(command);
    } catch (error) {
      if (error.name === 'NotFound') {
        throw new Error(`S3 bucket ${this.bucketName} does not exist in region ${this.region}`);
      }
      throw error;
    }
  }

  constructor(private configService: ConfigService) {
    const config = this.configService.get<S3Config>('s3');
    
    if (!config) {
      throw new Error('S3 configuration not loaded');
    }

    this.region = config.region;
    this.bucketName = config.bucketName;
    this.baseUrl = `https://${config.bucketName}.s3.${config.region}.amazonaws.com`;

    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    // Initialize bucket check
    this.init();
  }

  /**
   * Generate a pre-signed URL for uploading a file directly to S3
   * @param filename Original file name
   * @param mimetype MIME type of the file
   * @param folderPath Optional subdirectory within the bucket
   * @returns Object containing the upload URL and the final file URL
   */
  async generatePresignedUploadUrl(
    filename: string,
    mimetype: string,
    folderPath: string,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    try {
      if (!filename || !mimetype || !folderPath) {
        throw new Error('Required parameters are missing');
      }

      const fileExtension = filename.split('.').pop();
      if (!fileExtension) {
        throw new Error('Invalid filename');
      }

      const uniqueFilename = `${uuidv4()}.${fileExtension}`;
      const key = `${folderPath}/${uniqueFilename}`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: mimetype,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      const fileUrl = `${this.baseUrl}/${key}`;

      return { uploadUrl, fileUrl };
    } catch (error) {
      Logger.error('Error generating presigned URL:', error);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   * @param fileUrl The complete URL of the file to delete
   * @returns True if deletion was successful
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      if (!fileUrl) {
        throw new Error('File URL is required');
      }

      const key = fileUrl.replace(`${this.baseUrl}/`, '');
      if (!key) {
        throw new Error('Invalid file URL');
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      Logger.error('Error deleting file from S3:', error);
      return false;
    }
  }

  /**
   * Get the file URL from a key
   * @param key The S3 object key
   * @returns The complete URL to access the file
   */
  getFileUrl(key: string): string {
    if (!key) {
      throw new Error('Key is required');
    }
    return `${this.baseUrl}/${key}`;
  }
}
