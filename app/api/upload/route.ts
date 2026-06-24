import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("video") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const folderPath = path.join(process.cwd(), "public", "videos");
    await mkdir(folderPath, { recursive: true });

    const fileName = file.name.replaceAll(" ", "-").toLowerCase();
    const filePath = path.join(folderPath, fileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/videos/${fileName}`,
      fileName,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
} 
