import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_S3_REGION');
    const accessKeyId = this.configService.get<string>('AWS_S3_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_S3_SECRET_ACCESS_KEY',
    );
    if (region && accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } else {
      throw new Error('Missing AWS S3 credentials');
    }
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') as string;
    if (!this.bucket) {
      throw new Error('Missing AWS S3 bucket');
    }
  }

  async uploadFile(file: UploadedFile, folder = 'branding'): Promise<string> {
    const fileKey = `${folder}/${uuidv4()}-${file.originalname}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return `https://${this.bucket}.s3.${this.configService.get<string>('AWS_S3_REGION')}.amazonaws.com/${fileKey}`;
  }
}
