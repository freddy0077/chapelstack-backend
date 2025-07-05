import { registerAs } from '@nestjs/config';

export interface S3Config {
  region: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export default registerAs<S3Config>('s3', () => {
  const region = process.env.AWS_S3_REGION;
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;

  if (!region) {
    throw new Error('AWS_S3_REGION environment variable is not set');
  }
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME environment variable is not set');
  }
  if (!accessKeyId) {
    throw new Error('AWS_S3_ACCESS_KEY_ID environment variable is not set');
  }
  if (!secretAccessKey) {
    throw new Error('AWS_S3_SECRET_ACCESS_KEY environment variable is not set');
  }

  return {
    region,
    bucketName,
    accessKeyId,
    secretAccessKey,
  };
});
