import { NextResponse } from "next/server";
import postgres from "postgres";

const connectionString = process.env.RAYSSTREAM_DB_DATABASE_URL;

if (!connectionString) {
  throw new Error("RAYSSTREAM_DB_DATABASE_URL is missing");
}

const sql = postgres(connectionString, {
  ssl: "require",
});

async function createCommentsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS video_comments (
      id SERIAL PRIMARY KEY,
      video_id INTEGER NOT NULL,
      comment_text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET() {
  try {
    await createCommentsTable();

    const rows = await sql`
      SELECT id, video_id, comment_text, created_at
      FROM video_comments
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      comments: rows.map((row) => ({
        id: Number(row.id),
        videoId: Number(row.video_id),
        text: row.comment_text,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("Load comments error:", error);

    return NextResponse.json(
      { error: "Unable to load comments." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await createCommentsTable();

    const body = await request.json();
    const videoId = Number(body.videoId);
    const text = body.text?.trim();

    if (!Number.isInteger(videoId) || videoId < 1) {
      return NextResponse.json(
        { error: "A valid video ID is required." },
        { status: 400 }
      );
    }

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
      INSERT INTO video_comments (
        video_id,
        comment_text
      )
      VALUES (
        ${videoId},
        ${text}
      )
      RETURNING id, video_id, comment_text, created_at
    `;

    const comment = result[0];

    return NextResponse.json({
      comment: {
        id: Number(comment.id),
        videoId: Number(comment.video_id),
        text: comment.comment_text,
        createdAt: comment.created_at,
      },
    });
  } catch (error) {
    console.error("Save comment error:", error);

    return NextResponse.json(
      { error: "Unable to save comment." },
      { status: 500 }
    );
  }
} 
