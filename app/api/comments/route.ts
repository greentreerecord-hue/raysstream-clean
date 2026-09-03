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

async function ensureCommentsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS video_comments (
      id SERIAL PRIMARY KEY,
      video_id INTEGER NOT NULL,
      comment_text TEXT NOT NULL,
      viewer_id INTEGER,
      viewer_name TEXT,
      viewer_username TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE video_comments
    ADD COLUMN IF NOT EXISTS viewer_id INTEGER
  `;

  await sql`
    ALTER TABLE video_comments
    ADD COLUMN IF NOT EXISTS viewer_name TEXT
  `;

  await sql`
    ALTER TABLE video_comments
    ADD COLUMN IF NOT EXISTS viewer_username TEXT
  `;
}

export async function GET() {
  try {
    await ensureCommentsTable();

    const rows = await sql`
      SELECT
        id,
        video_id,
        comment_text,
        viewer_id,
        viewer_name,
        viewer_username,
        created_at
      FROM video_comments
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      comments: rows.map((row) => ({
        id: Number(row.id),
        videoId: Number(row.video_id),
        text: String(row.comment_text),
        viewerId:
          row.viewer_id === null
            ? null
            : Number(row.viewer_id),
        viewerName:
          row.viewer_name || "Ray'sStream User",
        viewerUsername:
          row.viewer_username || null,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("Load comments error:", error);

    return NextResponse.json(
      {
        error: "Unable to load comments.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureCommentsTable();

    const body = await request.json();
    const videoId = Number(body.videoId);

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    const viewerId =
      body.viewerId !== undefined &&
      body.viewerId !== null &&
      body.viewerId !== ""
        ? Number(body.viewerId)
        : null;

    if (
      !Number.isInteger(videoId) ||
      videoId < 1
    ) {
      return NextResponse.json(
        {
          error: "A valid video ID is required.",
        },
        {
          status: 400,
        }
      );
    }

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
            "Comment must be 1,000 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    let viewerName = "Ray'sStream User";
    let viewerUsername: string | null = null;

    if (viewerId !== null) {
      if (
        !Number.isInteger(viewerId) ||
        viewerId < 1
      ) {
        return NextResponse.json(
          {
            error:
              "Please sign in to a valid viewer account.",
          },
          {
            status: 401,
          }
        );
      }

      const viewerRows = await sql`
        SELECT id, name, username
        FROM viewers
        WHERE id = ${viewerId}
        LIMIT 1
      `;

      if (viewerRows.length === 0) {
        return NextResponse.json(
          {
            error:
              "Viewer account not found. Please log in again.",
          },
          {
            status: 401,
          }
        );
      }

      viewerName = String(viewerRows[0].name);
      viewerUsername = String(
        viewerRows[0].username
      );
    }

    const result = await sql`
      INSERT INTO video_comments (
        video_id,
        comment_text,
        viewer_id,
        viewer_name,
        viewer_username
      )
      VALUES (
        ${videoId},
        ${text},
        ${viewerId},
        ${viewerName},
        ${viewerUsername}
      )
      RETURNING
        id,
        video_id,
        comment_text,
        viewer_id,
        viewer_name,
        viewer_username,
        created_at
    `;

    const comment = result[0];

    return NextResponse.json({
      comment: {
        id: Number(comment.id),
        videoId: Number(comment.video_id),
        text: String(comment.comment_text),
        viewerId:
          comment.viewer_id === null
            ? null
            : Number(comment.viewer_id),
        viewerName:
          comment.viewer_name || "Ray'sStream User",
        viewerUsername:
          comment.viewer_username || null,
        createdAt: comment.created_at,
      },
    });
  } catch (error) {
    console.error("Save comment error:", error);

    return NextResponse.json(
      {
        error: "Unable to save comment.",
      },
      {
        status: 500,
      }
    );
  }
} 
