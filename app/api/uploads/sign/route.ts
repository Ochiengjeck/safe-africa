import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloudinaryConfigured, signUploadParams } from "@/lib/cloudinary";

const ALLOWED_FOLDERS = new Set([
  "safe-africa/projects",
  "safe-africa/resources",
  "safe-africa/gallery",
  "safe-africa/team",
  "safe-africa/general",
  "safe-africa/cvs",
]);

export async function POST(request: Request) {
  const { folder } = await request.json().catch(() => ({ folder: "" }));
  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
  }

  // CV uploads come from the public careers form; everything else is admin-only.
  if (folder !== "safe-africa/cvs") {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!cloudinaryConfigured) {
    return NextResponse.json({ error: "Uploads are not configured" }, { status: 503 });
  }
  return NextResponse.json(signUploadParams(folder));
}
