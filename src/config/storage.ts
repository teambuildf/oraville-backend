import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.B2_APPLICATION_KEY_ID || !process.env.B2_APPLICATION_KEY) {
  console.warn('⚠️  Backblaze B2 credentials not configured. Avatar upload will not work.');
}

export const storageClient = new S3Client({
  region: process.env.B2_REGION || 'us-west-004',
  endpoint: process.env.B2_REGION 
    ? `https://s3.${process.env.B2_REGION}.backblazeb2.com`
    : 'https://s3.us-west-004.backblazeb2.com',
  credentials: process.env.B2_APPLICATION_KEY_ID && process.env.B2_APPLICATION_KEY
    ? {
        accessKeyId: process.env.B2_APPLICATION_KEY_ID,
        secretAccessKey: process.env.B2_APPLICATION_KEY,
      }
    : undefined,
});

export const STORAGE_BUCKET = process.env.B2_BUCKET_NAME || 'oraville-avatars';
