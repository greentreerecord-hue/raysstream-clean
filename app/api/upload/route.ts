import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const video = formData.get("video");

    if (!video || typeof video === "string") {
      return NextResponse.json({ error: "No video uploaded" }, { status: 400 });
    }

    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = video.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "");

    const uploadFolder = path.join(process.cwd(), "public", "videos");
    await mkdir(uploadFolder, { recursive: true });

    const filePath = path.join(uploadFolder, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/videos/${fileName}`,
      fileName,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
} 
