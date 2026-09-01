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

async function ensureCreatorEngagementTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS creator_video_engagement (
      video_id TEXT PRIMARY KEY,
      view_count INTEGER NOT NULL DEFAULT 0,
      like_count INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS creator_video_comments (
      id SERIAL PRIMARY KEY,
      video_id TEXT NOT NULL,
      comment_text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function GET(request: Request) {
  try {
    await ensureCreatorEngagementTables();

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId")?.trim();

    if (!videoId) {
      return NextResponse.json(
        {
          error: "Video ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const engagementRows = await sql`
      SELECT view_count, like_count
      FROM creator_video_engagement
      WHERE video_id = ${videoId}
      LIMIT 1
    `;

    const commentRows = await sql`
      SELECT id, comment_text, created_at
      FROM creator_video_comments
      WHERE video_id = ${videoId}
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      views: Number(
        engagementRows[0]?.view_count || 0
      ),
      likes: Number(
        engagementRows[0]?.like_count || 0
      ),
      comments: commentRows.map((row) => ({
        id: Number(row.id),
        text: String(row.comment_text),
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error(
      "Unable to load creator engagement:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load creator engagement.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureCreatorEngagementTables();

    const body = await request.json();
    const videoId = String(body.videoId || "").trim();
    const action = String(body.action || "").trim();

    if (!videoId) {
      return NextResponse.json(
        {
          error: "Video ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (action === "view") {
      const rows = await sql`
        INSERT INTO creator_video_engagement (
          video_id,
          view_count,
          like_count,
          updated_at
        )
        VALUES (
          ${videoId},
          1,
          0,
          NOW()
        )
        ON CONFLICT (video_id)
        DO UPDATE SET
          view_count =
            creator_video_engagement.view_count + 1,
          updated_at = NOW()
        RETURNING view_count
      `;

      return NextResponse.json({
        count: Number(rows[0].view_count),
      });
    }

    if (action === "like") {
      const rows = await sql`
        INSERT INTO creator_video_engagement (
          video_id,
          view_count,
          like_count,
          updated_at
        )
        VALUES (
          ${videoId},
          0,
          1,
          NOW()
        )
        ON CONFLICT (video_id)
        DO UPDATE SET
          like_count =
            creator_video_engagement.like_count + 1,
          updated_at = NOW()
        RETURNING like_count
      `;

      return NextResponse.json({
        count: Number(rows[0].like_count),
      });
    }

    if (action === "comment") {
      const text = String(body.text || "").trim();

      if (!text) {
        return NextResponse.json(
          {
            error: "Comment text is required.",
          },
          {
            status: 400,
          }
        );
      }

      if (text.length > 1000) {
        return NextResponse.json(
          {
            error:
              "Comment must be 1000 characters or fewer.",
          },
          {
            status: 400,
          }
        );
      }

      const rows = await sql`
        INSERT INTO creator_video_comments (
          video_id,
          comment_text
        )
        VALUES (
          ${videoId},
          ${text}
        )
        RETURNING id, comment_text, created_at
      `;

      return NextResponse.json({
        comment: {
          id: Number(rows[0].id),
          text: String(rows[0].comment_text),
          createdAt: rows[0].created_at,
        },
      });
    }

    return NextResponse.json(
      {
        error: "Invalid engagement action.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "Unable to save creator engagement:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to save creator engagement.",
      },
      {
        status: 500,
      }
    );
  }
} 
