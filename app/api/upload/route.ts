import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const video = formData.get("video");

    if (!video || !(video instanceof File)) {
      return NextResponse.json(
        { error: "No video uploaded" },
        { status: 400 }
      );
    }

    const blob = await put(video.name, video, {
      access: "public",
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: video.name,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
} 

