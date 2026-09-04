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

async function ensureLikesTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS video_likes (
      video_id INTEGER PRIMARY KEY,
      like_count INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS viewer_video_likes (
      id SERIAL PRIMARY KEY,
      video_id INTEGER NOT NULL,
      viewer_id INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (video_id, viewer_id)
    )
  `;
}

export async function GET(request: Request) {
  try {
    await ensureLikesTables();

    // The query-string viewerId is deliberately ignored.
    // Liked videos are loaded only from the secure session.
    const viewerId =
      await getViewerIdFromSession(request);

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

    let likedVideoIds: number[] = [];

    if (viewerId !== null) {
      const viewerLikeRows = await sql`
        SELECT video_id
        FROM viewer_video_likes
        WHERE viewer_id = ${viewerId}
        ORDER BY video_id
      `;

      likedVideoIds = viewerLikeRows.map(
        (row) => Number(row.video_id)
      );
    }

    return jsonResponse({
      likes,
      likedVideoIds,
    });
  } catch (error) {
    console.error(
      "Unable to load likes:",
      error
    );

    return jsonResponse(
      {
        error: "Unable to load likes.",
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
            "This like request is not allowed.",
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
            "Please log in to like this video.",
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
          error: "Invalid like request.",
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
          error: "Invalid like request.",
        },
        400
      );
    }

    const body = parsedBody as Record<
      string,
      unknown
    >;

    const videoId = Number(body.videoId);

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

    await ensureLikesTables();

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

        const insertedLikes = await transaction`
          INSERT INTO viewer_video_likes (
            video_id,
            viewer_id,
            created_at
          )
          VALUES (
            ${videoId},
            ${viewerId},
            NOW()
          )
          ON CONFLICT (video_id, viewer_id)
          DO NOTHING
          RETURNING id
        `;

        if (insertedLikes.length === 0) {
          const currentRows = await transaction`
            SELECT like_count
            FROM video_likes
            WHERE video_id = ${videoId}
            LIMIT 1
          `;

          return {
            accountMissing: false,
            count:
              currentRows.length > 0
                ? Number(
                    currentRows[0].like_count
                  )
                : 0,
            alreadyLiked: true,
          };
        }

        const countRows = await transaction`
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
            like_count =
              video_likes.like_count + 1,
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
      alreadyLiked: result.alreadyLiked,
    });
  } catch (error) {
    console.error(
      "Unable to save like:",
      error
    );

    return jsonResponse(
      {
        error: "Unable to save like.",
      },
      500
    );
  }
} 
