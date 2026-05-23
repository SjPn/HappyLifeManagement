"use client";

import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { labelClass } from "@/lib/formStyles";
import {
  FORUM_MAX_PHOTOS,
  FORUM_MAX_TOTAL_BYTES,
  IMAGE_ACCEPT,
  validateForumImages,
} from "@/lib/forumUploadLimits";

function formatMb(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ForumImageInput({
  existingCount = 0,
  onFilesChange,
}: {
  /** Already attached images (edit topic). */
  existingCount?: number;
  onFilesChange?: (files: File[]) => void;
}) {
  const t = useTranslations("forum");
  const te = useTranslations("errors");
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const totalBytes = useMemo(
    () => files.reduce((sum, f) => sum + f.size, 0),
    [files],
  );

  const slotsLeft = FORUM_MAX_PHOTOS - existingCount - files.length;

  function applySelection(selected: File[]) {
    const merged = [...files, ...selected];
    const code = validateForumImages(merged, existingCount);
    if (code) {
      setError(te(code));
      return;
    }
    setError(null);
    setFiles(merged);
    onFilesChange?.(merged);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;
    applySelection(selected);
  }

  function removeAt(index: number) {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onFilesChange?.(next);
    const code = validateForumImages(next, existingCount);
    setError(code ? te(code) : null);
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className={labelClass}>{t("images")}</span>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        disabled={slotsLeft <= 0}
        onChange={onChange}
        className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-800 hover:file:bg-blue-100 dark:file:bg-blue-950/50 dark:file:text-blue-200"
      />
      <p className="text-xs text-zinc-500">{t("photoHint")}</p>
      {existingCount > 0 && (
        <p className="text-xs text-zinc-500">
          {t("existingPhotos", { count: existingCount })}
        </p>
      )}
      {files.length > 0 && (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {t("selectedPhotos", {
            count: files.length,
            size: formatMb(totalBytes),
            max: Math.max(0, slotsLeft),
          })}
        </p>
      )}
      {files.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="relative overflow-hidden rounded-lg ring-1 ring-black/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="aspect-square h-24 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
