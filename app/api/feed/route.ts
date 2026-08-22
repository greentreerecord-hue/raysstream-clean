import { NextResponse } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

const connectionString =
  process.env.RAYSSTREAM_DB_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "RAYSSTREAM_DB_DATABASE_URL is missing"
  );
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
      thumbnail_url TEXT,
      thumbnail_pathname TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE creator_videos
    ADD COLUMN IF NOT EXISTS thumbnail_url TEXT
  `;

  await sql`
    ALTER TABLE creator_videos
    ADD COLUMN IF NOT EXISTS thumbnail_pathname TEXT
  `;
}

export async function GET() {
  try {
    await ensureVideoTable();

    const rows = await sql`
      SELECT
        id,
        blob_url,
        pathname,
        title,
        thumbnail_url,
        created_at,
        MD5(LOWER(creator_email)) AS channel_id
      FROM creator_videos
      ORDER BY created_at DESC
    `;

    const videos = rows.map((video) => ({
      id: `creator-${video.id}`,
      url: video.blob_url,
      pathname: video.pathname,
      title: video.title,
      thumbnailUrl: video.thumbnail_url,
      createdAt: video.created_at,
      channelId: video.channel_id,
    }));

    return NextResponse.json(
      { videos },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Creator feed error:", error);

    return NextResponse.json(
      {
        error: "Could not load creator videos.",
      },
      {
        status: 500,
      }
    );
  }
} 
