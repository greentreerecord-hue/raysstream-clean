import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const video = formData.get("video");

    if (!(video instanceof File)) {
      return NextResponse.json({ error: "No video uploaded" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      url: "/videos/itscool.mp4",
      name: video.name
    });
  } catch {
    return NextResponse.json({ error: "Server upload error" }, { status: 500 });
  }
} 
