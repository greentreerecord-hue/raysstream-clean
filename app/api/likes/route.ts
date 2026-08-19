import { NextResponse } from "next/server";
import postgres from "postgres";

const connectionString = process.env.RAYSSTREAM_DB_DATABASE_URL;

if (!connectionString) {
  throw new Error("RAYSSTREAM_DB_DATABASE_URL is missing");
}

const sql = postgres(connectionString, {
  ssl: "require",
});

async function createLikesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS video_likes (
      video_id TEXT PRIMARY KEY,
      likes INTEGER NOT NULL DEFAULT 0
    )
  `;
}

export async function GET(request: Request) {
  try {
    await createLikesTable();

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required." },
        { status: 400 }
      );
    }

    const rows = await sql`
      SELECT likes
      FROM video_likes
      WHERE video_id = ${videoId}
    `;

    return NextResponse.json({
      likes: rows[0]?.likes ?? 0,
    });
  } catch (error) {
    console.error("Get likes error:", error);

    return NextResponse.json(
      { error: "Could not load likes." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await createLikesTable();

    const body = await request.json();
    const videoId = body.videoId;

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required." },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO video_likes (video_id, likes)
      VALUES (${videoId}, 1)
      ON CONFLICT (video_id)
      DO UPDATE SET likes = video_likes.likes + 1
      RETURNING likes
    `;

    return NextResponse.json({
      likes: rows[0].likes,
    });
  } catch (error) {
    console.error("Add like error:", error);

    return NextResponse.json(
      { error: "Could not add like." },
      { status: 500 }
    );
  }
} 
