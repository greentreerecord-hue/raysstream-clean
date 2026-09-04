import { NextResponse } from "next/server";
import postgres from "postgres";

import {
  getViewerIdFromSession,
} from "../../../lib/viewer-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

function jsonResponse(
  body: unknown,
  status = 200
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

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

  await sql`
    ALTER TABLE viewers
    ADD COLUMN IF NOT EXISTS
    profile_picture_url TEXT
  `;
}

export async function GET() {
  try {
    await ensureCommentsTable();

    const rows = await sql`
      SELECT
        comments.id,
        comments.video_id,
        comments.comment_text,
        comments.viewer_id,
        comments.viewer_name,
        comments.viewer_username,
        comments.created_at,
        viewers.profile_picture_url
      FROM video_comments AS comments
      LEFT JOIN viewers
        ON viewers.id = comments.viewer_id
      ORDER BY comments.created_at ASC
    `;

    return jsonResponse({
      comments: rows.map((row) => ({
        id: Number(row.id),
        videoId: Number(row.video_id),
        text: String(row.comment_text),

        viewerId:
          row.viewer_id === null
            ? null
            : Number(row.viewer_id),

        viewerName:
          row.viewer_name ||
          "Ray'sStream User",

        viewerUsername:
          row.viewer_username || null,

        viewerProfilePictureUrl:
          row.profile_picture_url || null,

        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error(
      "Load comments error:",
      error
    );

    return jsonResponse(
      {
        error: "Unable to load comments.",
      },
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");

    if (
      request.headers.get("sec-fetch-site") ===
        "cross-site" ||
      (
        origin !== null &&
        origin !== new URL(request.url).origin
      )
    ) {
      return jsonResponse(
        {
          error:
            "This comment request is not allowed.",
        },
        403
      );
    }

    const contentType =
      request.headers.get("content-type") || "";

    if (
      !contentType
        .toLowerCase()
        .startsWith("application/json")
    ) {
      return jsonResponse(
        {
          error: "A JSON request is required.",
        },
        415
      );
    }

    const viewerId =
      await getViewerIdFromSession(request);

    if (viewerId === null) {
      return jsonResponse(
        {
          error:
            "Please log in to comment.",
        },
        401
      );
    }

    let parsedBody: unknown;

    try {
      parsedBody = await request.json();
    } catch {
      return jsonResponse(
        {
          error: "Invalid comment request.",
        },
        400
      );
    }

    if (
      typeof parsedBody !== "object" ||
      parsedBody === null ||
      Array.isArray(parsedBody)
    ) {
      return jsonResponse(
        {
          error: "Invalid comment request.",
        },
        400
      );
    }

    const body = parsedBody as Record<
      string,
      unknown
    >;

    const videoId = Number(body.videoId);

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    if (
      !Number.isInteger(videoId) ||
      videoId < 1
    ) {
      return jsonResponse(
        {
          error:
            "A valid video ID is required.",
        },
        400
      );
    }

    if (!text) {
      return jsonResponse(
        {
          error: "Comment text is required.",
        },
        400
      );
    }

    if (text.length > 1000) {
      return jsonResponse(
        {
          error:
            "Comment must be 1,000 characters or less.",
        },
        400
      );
    }

    await ensureCommentsTable();

    const viewerRows = await sql`
      SELECT
        id,
        name,
        username,
        profile_picture_url
      FROM viewers
      WHERE id = ${viewerId}
      LIMIT 1
    `;

    if (viewerRows.length === 0) {
      return jsonResponse(
        {
          error:
            "Viewer account not found. Please log in again.",
        },
        401
      );
    }

    const viewerName = String(
      viewerRows[0].name
    );

    const viewerUsername = String(
      viewerRows[0].username
    );

    const viewerProfilePictureUrl =
      viewerRows[0].profile_picture_url || null;

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

    return jsonResponse({
      comment: {
        id: Number(comment.id),
        videoId: Number(comment.video_id),
        text: String(comment.comment_text),
        viewerId: Number(comment.viewer_id),

        viewerName:
          comment.viewer_name ||
          "Ray'sStream User",

        viewerUsername:
          comment.viewer_username || null,

        viewerProfilePictureUrl,

        createdAt: comment.created_at,
      },
    });
  } catch (error) {
    console.error(
      "Save comment error:",
      error
    );

    return jsonResponse(
      {
        error: "Unable to save comment.",
      },
      500
    );
  }
} 
