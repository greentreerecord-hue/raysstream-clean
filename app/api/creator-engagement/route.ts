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

  await sql`
    ALTER TABLE creator_video_comments
    ADD COLUMN IF NOT EXISTS viewer_id INTEGER
  `;

  await sql`
    ALTER TABLE creator_video_comments
    ADD COLUMN IF NOT EXISTS viewer_name TEXT
  `;

  await sql`
    ALTER TABLE creator_video_comments
    ADD COLUMN IF NOT EXISTS viewer_username TEXT
  `;

  await sql`
    ALTER TABLE viewers
    ADD COLUMN IF NOT EXISTS
    profile_picture_url TEXT
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS creator_viewer_likes (
      id SERIAL PRIMARY KEY,
      video_id TEXT NOT NULL,
      viewer_id INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (video_id, viewer_id)
    )
  `;
}

export async function GET(request: Request) {
  try {
    await ensureCreatorEngagementTables();

    const { searchParams } =
      new URL(request.url);

    const videoId =
      searchParams.get("videoId")?.trim() || "";

    if (!videoId || videoId.length > 200) {
      return jsonResponse(
        {
          error: "A valid video ID is required.",
        },
        400
      );
    }

    // Any viewerId in the URL is ignored.
    // The liked status comes from the secure session.
    const viewerId =
      await getViewerIdFromSession(request);

    const engagementRows = await sql`
      SELECT view_count, like_count
      FROM creator_video_engagement
      WHERE video_id = ${videoId}
      LIMIT 1
    `;

    const commentRows = await sql`
      SELECT
        comments.id,
        comments.comment_text,
        comments.viewer_id,
        comments.viewer_name,
        comments.viewer_username,
        comments.created_at,
        viewers.profile_picture_url
      FROM creator_video_comments AS comments
      LEFT JOIN viewers
        ON viewers.id = comments.viewer_id
      WHERE comments.video_id = ${videoId}
      ORDER BY comments.created_at ASC
    `;

    let liked = false;

    if (viewerId !== null) {
      const likedRows = await sql`
        SELECT id
        FROM creator_viewer_likes
        WHERE video_id = ${videoId}
          AND viewer_id = ${viewerId}
        LIMIT 1
      `;

      liked = likedRows.length > 0;
    }

    return jsonResponse({
      views: Number(
        engagementRows[0]?.view_count || 0
      ),

      likes: Number(
        engagementRows[0]?.like_count || 0
      ),

      liked,

      comments: commentRows.map((row) => ({
        id: Number(row.id),
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
      "Unable to load creator engagement:",
      error
    );

    return jsonResponse(
      {
        error:
          "Unable to load creator engagement.",
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
            "This engagement request is not allowed.",
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

    let parsedBody: unknown;

    try {
      parsedBody = await request.json();
    } catch {
      return jsonResponse(
        {
          error:
            "Invalid creator engagement request.",
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
          error:
            "Invalid creator engagement request.",
        },
        400
      );
    }

    const body = parsedBody as Record<
      string,
      unknown
    >;

    const videoId =
      typeof body.videoId === "string"
        ? body.videoId.trim()
        : "";

    const action =
      typeof body.action === "string"
        ? body.action.trim()
        : "";

    if (!videoId || videoId.length > 200) {
      return jsonResponse(
        {
          error: "A valid video ID is required.",
        },
        400
      );
    }

    if (
      action !== "view" &&
      action !== "like" &&
      action !== "comment"
    ) {
      return jsonResponse(
        {
          error:
            "Invalid engagement action.",
        },
        400
      );
    }

    await ensureCreatorEngagementTables();

    // Views remain public.
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

      return jsonResponse({
        count: Number(rows[0].view_count),
      });
    }

    // Browser-supplied viewerId is ignored.
    const viewerId =
      await getViewerIdFromSession(request);

    if (viewerId === null) {
      return jsonResponse(
        {
          error:
            action === "like"
              ? "Please log in to like this video."
              : "Please log in to comment.",
        },
        401
      );
    }

    if (action === "like") {
      const result = await sql.begin(
        async (transaction) => {
          const viewerRows = await transaction`
            SELECT id
            FROM viewers
            WHERE id = ${viewerId}
            LIMIT 1
          `;

          if (viewerRows.length === 0) {
            return {
              accountMissing: true,
              count: 0,
              alreadyLiked: false,
            };
          }

          const insertedLikes =
            await transaction`
              INSERT INTO creator_viewer_likes (
                video_id,
                viewer_id
              )
              VALUES (
                ${videoId},
                ${viewerId}
              )
              ON CONFLICT (
                video_id,
                viewer_id
              )
              DO NOTHING
              RETURNING id
            `;

          if (insertedLikes.length === 0) {
            const currentRows =
              await transaction`
                SELECT like_count
                FROM creator_video_engagement
                WHERE video_id = ${videoId}
                LIMIT 1
              `;

            return {
              accountMissing: false,
              count: Number(
                currentRows[0]?.like_count || 0
              ),
              alreadyLiked: true,
            };
          }

          const countRows = await transaction`
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

          return {
            accountMissing: false,
            count: Number(
              countRows[0].like_count
            ),
            alreadyLiked: false,
          };
        }
      );

      if (result.accountMissing) {
        return jsonResponse(
          {
            error:
              "Viewer account not found. Please log in again.",
          },
          401
        );
      }

      return jsonResponse({
        count: result.count,
        liked: true,
        alreadyLiked: result.alreadyLiked,

        message: result.alreadyLiked
          ? "You already liked this video."
          : undefined,
      });
    } 
  const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

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
            "Comment must be 1,000 characters or fewer.",
        },
        400
      );
    }

    const comment = await sql.begin(
      async (transaction) => {
        const viewerRows = await transaction`
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
          return null;
        }

        const viewer = viewerRows[0];

        const rows = await transaction`
          INSERT INTO creator_video_comments (
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
            ${String(viewer.name)},
            ${String(viewer.username)}
          )
          RETURNING
            id,
            comment_text,
            viewer_id,
            viewer_name,
            viewer_username,
            created_at
        `;

        return {
          id: Number(rows[0].id),

          text: String(
            rows[0].comment_text
          ),

          viewerId: Number(
            rows[0].viewer_id
          ),

          viewerName: String(
            rows[0].viewer_name
          ),

          viewerUsername:
            rows[0].viewer_username
              ? String(
                  rows[0].viewer_username
                )
              : null,

          viewerProfilePictureUrl:
            viewer.profile_picture_url
              ? String(
                  viewer.profile_picture_url
                )
              : null,

          createdAt: rows[0].created_at,
        };
      }
    );

    if (comment === null) {
      return jsonResponse(
        {
          error:
            "Viewer account not found. Please log in again.",
        },
        401
      );
    }

    return jsonResponse({
      comment,
    });
  } catch (error) {
    console.error(
      "Unable to save creator engagement:",
      error
    );

    return jsonResponse(
      {
        error:
          "Unable to save creator engagement.",
      },
      500
    );
  }
} 
