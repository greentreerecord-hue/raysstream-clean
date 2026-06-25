import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const video = formData.get("video");

    if (!(video instanceof File)) {
      return NextResponse.json(
        { error: "No video uploaded" },
        { status: 400 }
      );
    }

    const safeName = video.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "");

    const blob = await put(`videos/${Date.now()}-${safeName}`, video, {
      access: "public"
    });

    return NextResponse.json({
      success: true,
      url: blob.url
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
} 
