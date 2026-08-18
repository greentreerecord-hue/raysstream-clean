import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import postgres from "postgres";

const connectionString = process.env.RAYSSTREAM_DB_DATABASE_URL;

if (!connectionString) {
  throw new Error("RAYSSTREAM_DB_DATABASE_URL is missing");
}

const sql = postgres(connectionString, {
  ssl: "require",
});

async function ensureVideoTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS creator_videos (
      id SERIAL PRIMARY KEY,
      creator_email TEXT NOT NULL,
      blob_url TEXT UNIQUE NOT NULL,
      pathname TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET(request: Request) {
  try {
    await ensureVideoTable();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Creator email is required." },
        { status: 400 }
      );
    }

    const creatorEmail = email.trim().toLowerCase();

    const safeEmail = creatorEmail.replace(/[^a-z0-9]/g, "-");

    const { blobs } = await list({
      prefix: `videos/${safeEmail}/`,
      token: process.env.RAYSSTREAM_VIDEO_READ_WRITE_TOKEN,
    });

    const videoBlobs = blobs.filter((blob) => {
      const name = blob.pathname.toLowerCase();

      return (
        name.endsWith(".mp4") ||
        name.endsWith(".webm") ||
        name.endsWith(".mov")
      );
    });

    const savedVideos = await sql`
      SELECT blob_url, title
      FROM creator_videos
      WHERE creator_email = ${creatorEmail}
    `;

    const videos = videoBlobs.map((blob) => {
      const savedVideo = savedVideos.find(
        (video) => video.blob_url === blob.url
      );

      return {
        url: blob.url,
        pathname: blob.pathname,
        title: savedVideo?.title || null,
      };
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("My videos error:", error);

    return NextResponse.json(
      { error: "Could not load videos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureVideoTable();

    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const url = body.url;
    const pathname = body.pathname;
    const title = body.title?.trim();

    if (!email || !url || !pathname || !title) {
      return NextResponse.json(
        { error: "Missing video information." },
        { status: 400 }
      );
    }

    const safeEmail = email.replace(/[^a-z0-9]/g, "-");
    const creatorFolder = `videos/${safeEmail}/`;

    if (!pathname.startsWith(creatorFolder)) {
      return NextResponse.json(
        { error: "Invalid creator video." },
        { status: 403 }
      );
    }

    await sql`
      INSERT INTO creator_videos (
        creator_email,
        blob_url,
        pathname,
        title
      )
      VALUES (
        ${email},
        ${url},
        ${pathname},
        ${title}
      )
      ON CONFLICT (blob_url)
      DO UPDATE SET
        title = EXCLUDED.title
    `;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Save video error:", error);

    return NextResponse.json(
      { error: "Could not save video information." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureVideoTable();

    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const url = body.url;
    const title = body.title?.trim();

    if (!email || !url || !title) {
      return NextResponse.json(
        { error: "Email, video, and title are required." },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE creator_videos
      SET title = ${title}
      WHERE creator_email = ${email}
        AND blob_url = ${url}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Video was not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      title,
    });
  } catch (error) {
    console.error("Edit title error:", error);

    return NextResponse.json(
      { error: "Could not update title." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureVideoTable();

    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const url = body.url;
    const pathname = body.pathname;

    if (!email || !url || !pathname) {
      return NextResponse.json(
        { error: "Missing video information." },
        { status: 400 }
      );
    }

    const safeEmail = email.replace(/[^a-z0-9]/g, "-");
    const creatorFolder = `videos/${safeEmail}/`;

    if (!pathname.startsWith(creatorFolder)) {
      return NextResponse.json(
        { error: "You cannot delete this video." },
        { status: 403 }
      );
    }

    await del(url, {
      token: process.env.RAYSSTREAM_VIDEO_READ_WRITE_TOKEN,
    });

    await sql`
      DELETE FROM creator_videos
      WHERE creator_email = ${email}
        AND blob_url = ${url}
    `;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete video error:", error);

    return NextResponse.json(
      { error: "Could not delete video." },
      { status: 500 }
    );
  }
} 
