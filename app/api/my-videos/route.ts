import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Creator email is required." },
        { status: 400 }
      );
    }

    const token = process.env.RAYSSTREAM_VIDEO_READ_WRITE_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "Ray'sStream Blob token is missing." },
        { status: 500 }
      );
    }

    const safeEmail = email
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    const { blobs } = await list({
      prefix: `videos/${safeEmail}/`,
      token,
    });

    const videos = blobs
      .filter((blob) => {
        const name = blob.pathname.toLowerCase();

        return (
          name.endsWith(".mp4") ||
          name.endsWith(".webm") ||
          name.endsWith(".mov")
        );
      })
      .map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
      }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not load creator videos." },
      { status: 500 }
    );
  }
} 
