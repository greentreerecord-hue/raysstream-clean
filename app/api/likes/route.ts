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

async function ensureLikesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS video_likes (
      video_id INTEGER PRIMARY KEY,
      like_count INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE video_likes
    ADD COLUMN IF NOT EXISTS like_count
    INTEGER NOT NULL DEFAULT 0
  `;

  await sql`
    ALTER TABLE video_likes
    ADD COLUMN IF NOT EXISTS updated_at
    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `;
}

export async function GET() {
  try {
    await ensureLikesTable();

    const rows = await sql`
      SELECT video_id, like_count
      FROM video_likes
      ORDER BY video_id
    `;

    const likes: Record<number, number> = {};

    for (const row of rows) {
      likes[Number(row.video_id)] =
        Number(row.like_count);
    }

    return NextResponse.json({
      likes,
    });
  } catch (error) {
    console.error("Unable to load likes:", error);

    return NextResponse.json(
      {
        error: "Unable to load likes.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureLikesTable();

    const body = await request.json();
    const videoId = Number(body.videoId);

    if (!Number.isInteger(videoId) || videoId < 1) {
      return NextResponse.json(
        {
          error: "A valid video ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const rows = await sql`
      INSERT INTO video_likes (
        video_id,
        like_count,
        updated_at
      )
      VALUES (
        ${videoId},
        1,
        NOW()
      )
      ON CONFLICT (video_id)
      DO UPDATE SET
        like_count = video_likes.like_count + 1,
        updated_at = NOW()
      RETURNING like_count
    `;

    return NextResponse.json({
      count: Number(rows[0].like_count),
    });
  } catch (error) {
    console.error("Unable to save like:", error);

    return NextResponse.json(
      {
        error: "Unable to save like.",
      },
      {
        status: 500,
      }
    );
  }
} 
