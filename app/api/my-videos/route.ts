import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";

function safeEmail(email: string) {
  return email
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
}

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

    const creatorFolder = safeEmail(email);

    const { blobs } = await list({
      prefix: `videos/${creatorFolder}/`,
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

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const email = body.email;
    const pathname = body.pathname;

    if (!email || !pathname) {
      return NextResponse.json(
        { error: "Creator email and video pathname are required." },
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

    const creatorFolder = safeEmail(email);
    const creatorPrefix = `videos/${creatorFolder}/`;

    if (!pathname.startsWith(creatorPrefix)) {
      return NextResponse.json(
        { error: "You cannot delete another creator's video." },
        { status: 403 }
      );
    }

    const { blobs } = await list({
      prefix: pathname,
      token,
    });

    const video = blobs.find(
      (blob) => blob.pathname === pathname
    );

    if (!video) {
      return NextResponse.json(
        { error: "Video not found." },
        { status: 404 }
      );
    }

    await del(video.url, {
      token,
    });

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not delete video." },
      { status: 500 }
    );
  }
} 
