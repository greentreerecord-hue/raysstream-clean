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
      description TEXT,
      thumbnail_url TEXT,
      thumbnail_pathname TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE creator_videos
    ADD COLUMN IF NOT EXISTS description TEXT
  `;

  await sql`
    ALTER TABLE creator_videos
    ADD COLUMN IF NOT EXISTS thumbnail_url TEXT
  `;

  await sql`
    ALTER TABLE creator_videos
    ADD COLUMN IF NOT EXISTS thumbnail_pathname TEXT
  `;

  await sql`
    ALTER TABLE creators
    ADD COLUMN IF NOT EXISTS profile_picture_url TEXT
  `;

  await sql`
    ALTER TABLE creators
    ADD COLUMN IF NOT EXISTS profile_picture_pathname TEXT
  `;
}

export async function GET() {
  try {
    await ensureVideoTable();

    const rows = await sql`
      SELECT
        creator_videos.id,
        creator_videos.blob_url,
        creator_videos.pathname,
        creator_videos.title,
        creator_videos.description,
        creator_videos.thumbnail_url,
        creator_videos.created_at,
        creators.name AS creator_name,
        creators.profile_picture_url,
        MD5(
          LOWER(creator_videos.creator_email)
        ) AS channel_id
      FROM creator_videos
      LEFT JOIN creators
        ON LOWER(creators.email) =
           LOWER(creator_videos.creator_email)
      ORDER BY creator_videos.created_at DESC
    `;

    const videos = rows.map((video) => ({
      id: `creator-${video.id}`,
      url: video.blob_url,
      pathname: video.pathname,
      title: video.title,
      description: video.description || "",
      thumbnailUrl: video.thumbnail_url || "",
      creatorName:
        video.creator_name || "Ray'sStream Creator",
      creatorProfilePictureUrl:
        video.profile_picture_url || "",
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
