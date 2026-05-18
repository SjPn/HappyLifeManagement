import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_BASE_URL?.trim(),
  );
}

function r2Endpoint(): string {
  const explicit = process.env.R2_ENDPOINT?.trim();
  if (explicit) return explicit;
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  if (accountId) {
    return `https://${accountId}.r2.cloudflarestorage.com`;
  }
  throw new Error("STORAGE_NOT_CONFIGURED");
}

function getR2Client(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: r2Endpoint(),
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

export function publicObjectUrl(key: string): string {
  const base = process.env.R2_PUBLIC_BASE_URL!.trim().replace(/\/$/, "");
  return `${base}/${key}`;
}

export async function putR2Object(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}
