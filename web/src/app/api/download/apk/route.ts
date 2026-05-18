import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const APK_FILENAME = "happylife.apk";
const LOCAL_APK = path.join(process.cwd(), "public", "downloads", APK_FILENAME);

function externalApkUrl(): string | null {
  const url =
    process.env.NEXT_PUBLIC_APK_URL?.trim() ||
    process.env.APK_DOWNLOAD_URL?.trim();
  if (url && /^https?:\/\//i.test(url)) return url;
  return null;
}

async function localApkAvailable(): Promise<boolean> {
  try {
    const info = await stat(LOCAL_APK);
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("meta") === "1") {
    const external = externalApkUrl();
    const local = await localApkAvailable();
    const available = Boolean(external || local);
    return NextResponse.json({
      available,
      url: available ? "/api/download/apk" : null,
    });
  }

  const external = externalApkUrl();
  if (external) {
    return NextResponse.redirect(external, 302);
  }

  if (!(await localApkAvailable())) {
    return NextResponse.json(
      { error: "apk_not_available", message: "APK file is not published yet." },
      { status: 404 },
    );
  }

  const body = await readFile(LOCAL_APK);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": `attachment; filename="${APK_FILENAME}"`,
      "Content-Length": String(body.length),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
