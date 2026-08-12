import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const video = formData.get("video");

    if (!(video instanceof File)) {
      return NextResponse.json(
        { error: "No video was selected." },
        { status: 400 }
      );
    }

    const blob = await put(
      `videos/${video.name}`,
      video,
      {
        access: "public",
        addRandomSuffix: true,
        token: process.env.RAYSSTREAM_VIDEO_READ_WRITE_TOKEN,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Video uploaded to Vercel Blob!",
      videoUrl: blob.url,
    });
  } catch (error) {
    console.error("Blob upload error:", error);

    return NextResponse.json(
      { error: "Video upload failed." },
      { status: 500 }
    );
  }
} 
