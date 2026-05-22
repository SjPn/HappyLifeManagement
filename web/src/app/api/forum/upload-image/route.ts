import { auth } from "@/auth";
import { mapUploadError, type UploadActionError } from "@/lib/uploadErrors";
import { savePublicUpload } from "@/lib/upload";
import { FORUM_MAX_TOTAL_BYTES } from "@/lib/forumUploadLimits";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "noAccess" }, { status: 401 });
  }
  if (session.user.role === "MODERATOR") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "uploadFailed" }, { status: 413 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "badFile" }, { status: 400 });
  }
  if (file.size > FORUM_MAX_TOTAL_BYTES) {
    return NextResponse.json({ error: "forumBadFile" }, { status: 413 });
  }

  try {
    const url = await savePublicUpload(file, {
      maxBytes: FORUM_MAX_TOTAL_BYTES,
    });
    if (!url) {
      return NextResponse.json({ error: "badFile" }, { status: 400 });
    }
    return NextResponse.json({ url });
  } catch (e) {
    const code: UploadActionError = mapUploadError(e);
    const status = code === "storageNotConfigured" ? 503 : 400;
    return NextResponse.json({ error: code }, { status });
  }
}
