import { NextResponse } from "next/server";
import postgres from "postgres";

const connectionString = process.env.RAYSSTREAM_DB_DATABASE_URL;

if (!connectionString) {
  throw new Error("RAYSSTREAM_DB_DATABASE_URL is missing");
}

const sql = postgres(connectionString, {
  ssl: "require",
});

async function createViewsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS video_views (
      video_id INTEGER PRIMARY KEY,
      view_count INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET() {
  try {
    await createViewsTable();

    const rows = await sql`
      SELECT video_id, view_count
      FROM video_views
      ORDER BY video_id
    `;

    const views: Record<number, number> = {};

    for (const row of rows) {
      views[Number(row.video_id)] = Number(row.view_count);
    }

    return NextResponse.json({ views });
  } catch (error) {
    console.error("Load views error:", error);

    return NextResponse.json(
      { error: "Unable to load video views." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await createViewsTable();

    const body = await request.json();
    const videoId = Number(body.videoId);

    if (!Number.isInteger(videoId) || videoId < 1) {
      return NextResponse.json(
        { error: "A valid video ID is required." },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO video_views (
        video_id,
        view_count,
        updated_at
      )
      VALUES (
        ${videoId},
        1,
        NOW()
      )
      ON CONFLICT (video_id)
      DO UPDATE SET
        view_count = video_views.view_count + 1,
        updated_at = NOW()
      RETURNING view_count
    `;

    return NextResponse.json({
      videoId,
      count: Number(result[0].view_count),
    });
  } catch (error) {
    console.error("Add view error:", error);

    return NextResponse.json(
      { error: "Unable to save video view." },
      { status: 500 }
    );
  }
} 
