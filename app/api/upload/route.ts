import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("video");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No video uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const cleanName =
      Date.now() +
      "-" +
      file.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9.-]/g, "");

    const uploadDir = path.join(process.cwd(), "public", "videos");
    await mkdir(uploadDir, { recursive: true });

    await writeFile(path.join(uploadDir, cleanName), buffer);

    return NextResponse.json({
      success: true,
      name: cleanName,
      url: `/videos/${cleanName}`,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
} 
