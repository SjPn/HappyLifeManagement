import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const v = process.env[key]?.trim();
    if (v) return v;
  }
  return undefined;
}

export function getR2Env() {
  return {
    accessKeyId: readEnv("R2_ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID", "S3_ACCESS_KEY_ID"),
    secretAccessKey: readEnv(
      "R2_SECRET_ACCESS_KEY",
      "AWS_SECRET_ACCESS_KEY",
      "S3_SECRET_ACCESS_KEY",
    ),
    bucket: readEnv("R2_BUCKET_NAME", "S3_BUCKET_NAME", "BUCKET_NAME"),
    publicBaseUrl: readEnv("R2_PUBLIC_BASE_URL", "R2_PUBLIC_URL"),
    endpoint: readEnv("R2_ENDPOINT"),
    accountId: readEnv("R2_ACCOUNT_ID"),
  };
}

export function isR2Configured(): boolean {
  const { accessKeyId, secretAccessKey, bucket, publicBaseUrl } = getR2Env();
  return Boolean(accessKeyId && secretAccessKey && bucket && publicBaseUrl);
}

/** S3 API host only — without `/bucket` in the path. */
function normalizeR2Endpoint(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  try {
    const u = new URL(trimmed);
    if (u.pathname && u.pathname !== "/") {
      u.pathname = "/";
    }
    return u.origin;
  } catch {
    return trimmed;
  }
}

function r2Endpoint(): string {
  const { endpoint, accountId } = getR2Env();
  if (endpoint) return normalizeR2Endpoint(endpoint);
  if (accountId) {
    return `https://${accountId}.r2.cloudflarestorage.com`;
  }
  throw new Error("STORAGE_NOT_CONFIGURED");
}

function getR2Client(): S3Client {
  const { accessKeyId, secretAccessKey } = getR2Env();
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("STORAGE_NOT_CONFIGURED");
  }
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: r2Endpoint(),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return client;
}

export function publicObjectUrl(key: string): string {
  const base = getR2Env().publicBaseUrl!.replace(/\/$/, "");
  return `${base}/${key}`;
}

export async function putR2Object(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  const bucket = getR2Env().bucket;
  if (!bucket) throw new Error("STORAGE_NOT_CONFIGURED");

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}
