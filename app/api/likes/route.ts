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

    const { searchParams } = new URL(request.url);
    const viewerIdValue =
      searchParams.get("viewerId");

    const viewerId = viewerIdValue
      ? Number(viewerIdValue)
      : null;

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

    if (
      viewerId !== null &&
      Number.isInteger(viewerId) &&
      viewerId > 0
    ) {
      const viewerLikeRows = await sql`
        SELECT video_id
        FROM viewer_video_likes
        WHERE viewer_id = ${viewerId}
        ORDER BY video_id
      `;

      likedVideoIds = viewerLikeRows.map((row) =>
        Number(row.video_id)
      );
    }

    return NextResponse.json({
      likes,
      likedVideoIds,
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
    await ensureLikesTables();

    const body = await request.json();
    const videoId = Number(body.videoId);

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
        SELECT id
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

      const insertedLikes = await sql`
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
        const currentRows = await sql`
          SELECT like_count
          FROM video_likes
          WHERE video_id = ${videoId}
          LIMIT 1
        `;

        return NextResponse.json({
          count:
            currentRows.length > 0
              ? Number(currentRows[0].like_count)
              : 0,
          alreadyLiked: true,
        });
      }
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
        like_count =
          video_likes.like_count + 1,
        updated_at = NOW()
      RETURNING like_count
    `;

    return NextResponse.json({
      count: Number(rows[0].like_count),
      alreadyLiked: false,
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
