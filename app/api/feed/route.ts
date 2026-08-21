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
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET() {
  try {
    await ensureVideoTable();

    const rows = await sql`
      SELECT
        id,
        creator_email,
        blob_url,
        pathname,
        title,
        created_at
      FROM creator_videos
      ORDER BY created_at DESC
    `;

    const videos = rows.map((video) => ({
      id: `creator-${video.id}`,
      creator_email: video.creator_email,
      url: video.blob_url,
      pathname: video.pathname,
      title: video.title,
      createdAt: video.created_at,
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
