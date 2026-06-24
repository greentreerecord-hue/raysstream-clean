import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("video");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No video file received" },
        { status: 400 }
      );
    }

    const fileName = file.name
      .toLowerCase()
      .replaceAll(" ", "-")
      .replace(/[^a-z0-9.-]/g, "");

    return NextResponse.json({
      success: true,
      fileName,
      url: `/videos/${fileName}`,
      message:
        "Upload received. For permanent uploads on Vercel, connect cloud storage next.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
} 

