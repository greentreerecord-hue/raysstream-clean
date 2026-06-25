import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const video = formData.get("video");

    if (!(video instanceof File)) {
      return NextResponse.json({ error: "No video uploaded" }, { status: 400 });
    }

    if (video.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Video too large. Try under 50MB." },
        { status: 400 }
      );
    }

    const safeName = video.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "");

    const blob = await put(`videos/${Date.now()}-${safeName}`, video, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      name: safeName,
      size: video.size,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      { error: "Upload failed. Check Vercel Blob Storage connection." },
      { status: 500 }
    );
  }
} 
