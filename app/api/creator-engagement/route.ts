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
    CREATE TABLE IF NOT EXISTS creator_viewer_likes (
      id SERIAL PRIMARY KEY,
      video_id TEXT NOT NULL,
      viewer_id INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (video_id, viewer_id)
    )
  `;
}

async function findViewer(viewerId: number) {
  if (
    !Number.isInteger(viewerId) ||
    viewerId < 1
  ) {
    return null;
  }

  const rows = await sql`
    SELECT id, name, username
    FROM viewers
    WHERE id = ${viewerId}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return null;
  }

  return {
    id: Number(rows[0].id),
    name: String(rows[0].name),
    username: String(rows[0].username),
  };
}

export async function GET(request: Request) {
  try {
    await ensureCreatorEngagementTables();

    const { searchParams } =
      new URL(request.url);

    const videoId =
      searchParams.get("videoId")?.trim();

    const viewerId = Number(
      searchParams.get("viewerId")
    );

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
      SELECT
        id,
        comment_text,
        viewer_id,
        viewer_name,
        viewer_username,
        created_at
      FROM creator_video_comments
      WHERE video_id = ${videoId}
      ORDER BY created_at ASC
    `;

    let liked = false;

    if (
      Number.isInteger(viewerId) &&
      viewerId > 0
    ) {
      const likedRows = await sql`
        SELECT id
        FROM creator_viewer_likes
        WHERE video_id = ${videoId}
          AND viewer_id = ${viewerId}
        LIMIT 1
      `;

      liked = likedRows.length > 0;
    }

    return NextResponse.json({
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
        viewerId: row.viewer_id
          ? Number(row.viewer_id)
          : null,
        viewerName:
          row.viewer_name ||
          "Ray'sStream User",
        viewerUsername:
          row.viewer_username || null,
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

    const videoId = String(
      body.videoId || ""
    ).trim();

    const action = String(
      body.action || ""
    ).trim();

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
      const viewerId = Number(body.viewerId);

      const viewer =
        await findViewer(viewerId);

      if (!viewer) {
        return NextResponse.json(
          {
            error:
              "Please log in to like this video.",
          },
          {
            status: 401,
          }
        );
      }

      const insertedLikes = await sql`
        INSERT INTO creator_viewer_likes (
          video_id,
          viewer_id
        )
        VALUES (
          ${videoId},
          ${viewer.id}
        )
        ON CONFLICT (video_id, viewer_id)
        DO NOTHING
        RETURNING id
      `;

      if (insertedLikes.length === 0) {
        const currentRows = await sql`
          SELECT like_count
          FROM creator_video_engagement
          WHERE video_id = ${videoId}
          LIMIT 1
        `;

        return NextResponse.json({
          count: Number(
            currentRows[0]?.like_count || 0
          ),
          liked: true,
          message:
            "You already liked this video.",
        });
      }

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
        liked: true,
      });
    }

    if (action === "comment") {
      const viewerId = Number(body.viewerId);

      const viewer =
        await findViewer(viewerId);

      if (!viewer) {
        return NextResponse.json(
          {
            error:
              "Please log in to comment.",
          },
          {
            status: 401,
          }
        );
      }

      const text = String(
        body.text || ""
      ).trim();

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
          comment_text,
          viewer_id,
          viewer_name,
          viewer_username
        )
        VALUES (
          ${videoId},
          ${text},
          ${viewer.id},
          ${viewer.name},
          ${viewer.username}
        )
        RETURNING
          id,
          comment_text,
          viewer_id,
          viewer_name,
          viewer_username,
          created_at
      `;

      return NextResponse.json({
        comment: {
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
          viewerUsername: String(
            rows[0].viewer_username
          ),
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
