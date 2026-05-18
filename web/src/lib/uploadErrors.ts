export type UploadActionError = "badFile" | "storageNotConfigured";

export function mapUploadError(err: unknown): UploadActionError {
  if (err instanceof Error && err.message === "STORAGE_NOT_CONFIGURED") {
    return "storageNotConfigured";
  }
  return "badFile";
}
