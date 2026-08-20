import { NextResponse } from "next/server";
import postgres from "postgres";

const connectionString = process.env.RAYSSTREAM_DB_DATABASE_URL;

if (!connectionString) {
  throw new Error("RAYSSTREAM_DB_DATABASE_URL is missing");
}

const sql = postgres(connectionString, {
  ssl: "require",
});

async function createCreatorInteractionTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS creator_video_stats (
      video_id TEXT PRIMARY KEY,
      view_count INTEGER NOT NULL DEFAULT 0,
      like_count INTEGER NOT NULL DEFAULT 0,
      share_count INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS creator_video_comments (
      id SERIAL PRIMARY KEY,
      video_id TEXT NOT NULL,
      comment_text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET(request: Request) {
  try {
    await createCreatorInteractionTables();

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId")?.trim();

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required." },
        { status: 400 }
      );
    }

    const statsRows = await sql`
      SELECT view_count, like_count, share_count
      FROM creator_video_stats
      WHERE video_id = ${videoId}
    `;

    const commentRows = await sql`
      SELECT id, comment_text, created_at
      FROM creator_video_comments
      WHERE video_id = ${videoId}
      ORDER BY created_at ASC
    `;

    const stats = statsRows[0];

    return NextResponse.json({
      views: stats ? Number(stats.view_count) : 0,
      likes: stats ? Number(stats.like_count) : 0,
      shares: stats ? Number(stats.share_count) : 0,
      comments: commentRows.map((comment) => ({
        id: Number(comment.id),
        text: String(comment.comment_text),
        createdAt: comment.created_at,
      })),
    });
  } catch (error) {
    console.error("Load creator interactions error:", error);

    return NextResponse.json(
      { error: "Unable to load video activity." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await createCreatorInteractionTables();

    const body = await request.json();
    const videoId = String(body.videoId || "").trim();
    const action = String(body.action || "").trim();

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required." },
        { status: 400 }
      );
    }

    if (action === "view") {
      const result = await sql`
        INSERT INTO creator_video_stats (
          video_id,
          view_count,
          like_count,
          share_count,
          updated_at
        )
        VALUES (${videoId}, 1, 0, 0, NOW())
        ON CONFLICT (video_id)
        DO UPDATE SET
          view_count = creator_video_stats.view_count + 1,
          updated_at = NOW()
        RETURNING view_count
      `;

      return NextResponse.json({
        views: Number(result[0].view_count),
      });
    }

    if (action === "like") {
      const result = await sql`
        INSERT INTO creator_video_stats (
          video_id,
          view_count,
          like_count,
          share_count,
          updated_at
        )
        VALUES (${videoId}, 0, 1, 0, NOW())
        ON CONFLICT (video_id)
        DO UPDATE SET
          like_count = creator_video_stats.like_count + 1,
          updated_at = NOW()
        RETURNING like_count
      `;

      return NextResponse.json({
        likes: Number(result[0].like_count),
      });
    }

    if (action === "share") {
      const result = await sql`
        INSERT INTO creator_video_stats (
          video_id,
          view_count,
          like_count,
          share_count,
          updated_at
        )
        VALUES (${videoId}, 0, 0, 1, NOW())
        ON CONFLICT (video_id)
        DO UPDATE SET
          share_count = creator_video_stats.share_count + 1,
          updated_at = NOW()
        RETURNING share_count
      `;

      return NextResponse.json({
        shares: Number(result[0].share_count),
      });
    }

    if (action === "comment") {
      const text = String(body.text || "").trim();

      if (!text) {
        return NextResponse.json(
          { error: "Comment text is required." },
          { status: 400 }
        );
      }

      if (text.length > 1000) {
        return NextResponse.json(
          { error: "Comment must be 1,000 characters or less." },
          { status: 400 }
        );
      }

      const result = await sql`
        INSERT INTO creator_video_comments (
          video_id,
          comment_text
        )
        VALUES (${videoId}, ${text})
        RETURNING id, comment_text, created_at
      `;

      return NextResponse.json({
        comment: {
          id: Number(result[0].id),
          text: String(result[0].comment_text),
          createdAt: result[0].created_at,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Save creator interaction error:", error);

    return NextResponse.json(
      { error: "Unable to save video activity." },
      { status: 500 }
    );
  }
} 
