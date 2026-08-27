import { Client } from "minio";

const BUCKET = process.env.MINIO_BUCKET ?? "metriq-evidence";

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
  port: parseInt(process.env.MINIO_PORT ?? "9000", 10),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY ?? "",
  secretKey: process.env.MINIO_SECRET_KEY ?? "",
});

export async function initMinio(): Promise<void> {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET, "us-east-1");
    console.log(`[minio] Bucket "${BUCKET}" created`);
  } else {
    console.log(`[minio] Bucket "${BUCKET}" ready`);
  }
}

/** Upload a buffer and return the object key. */
export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  await minioClient.putObject(BUCKET, key, buffer, buffer.length, {
    "Content-Type": mimeType,
  });
  return key;
}

/** Generate a presigned URL valid for 1 hour. */
export async function getPresignedUrl(key: string): Promise<string> {
  return minioClient.presignedGetObject(BUCKET, key, 3600);
}
