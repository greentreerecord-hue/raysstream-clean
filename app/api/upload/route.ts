import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("video");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No video file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "videos");
    await mkdir(uploadDir, { recursive: true });

    const safeName = file.name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "")
      .toLowerCase();

    const filePath = path.join(uploadDir, safeName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      fileName: safeName,
      url: `/videos/${safeName}`,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
} 

