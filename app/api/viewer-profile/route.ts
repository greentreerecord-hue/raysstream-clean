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

async function ensureViewerProfileColumn() {
  await sql`
    ALTER TABLE viewers
    ADD COLUMN IF NOT EXISTS
    profile_picture_url TEXT
  `;
}

export async function GET(request: Request) {
  try {
    await ensureViewerProfileColumn();

    const { searchParams } =
      new URL(request.url);

    const viewerId = Number(
      searchParams.get("viewerId")
    );

    if (
      !Number.isInteger(viewerId) ||
      viewerId < 1
    ) {
      return NextResponse.json(
        {
          error: "A valid viewer ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const rows = await sql`
      SELECT
        id,
        name,
        username,
        email,
        profile_picture_url
      FROM viewers
      WHERE id = ${viewerId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: "Viewer account not found.",
        },
        {
          status: 404,
        }
      );
    }

    const viewer = rows[0];

    return NextResponse.json({
      viewer: {
        id: Number(viewer.id),
        fullName: String(viewer.name),
        username: String(viewer.username),
        email: String(viewer.email),
        profilePictureUrl: String(
          viewer.profile_picture_url || ""
        ),
      },
    });
  } catch (error) {
    console.error(
      "Unable to load viewer profile:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load viewer profile.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await ensureViewerProfileColumn();

    const body = await request.json();

    const viewerId = Number(body.viewerId);

    const fullName = String(
      body.fullName || ""
    ).trim();

    const profilePictureUrl = String(
      body.profilePictureUrl || ""
    ).trim();

    if (
      !Number.isInteger(viewerId) ||
      viewerId < 1
    ) {
      return NextResponse.json(
        {
          error: "A valid viewer ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        {
          error: "Your full name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (fullName.length > 100) {
      return NextResponse.json(
        {
          error:
            "Your full name must be 100 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    const rows = await sql`
      UPDATE viewers
      SET
        name = ${fullName},
        profile_picture_url =
          ${profilePictureUrl}
      WHERE id = ${viewerId}
      RETURNING
        id,
        name,
        username,
        email,
        profile_picture_url
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: "Viewer account not found.",
        },
        {
          status: 404,
        }
      );
    }

    await sql`
      UPDATE video_comments
      SET viewer_name = ${fullName}
      WHERE viewer_id = ${viewerId}
    `;

    await sql`
      UPDATE creator_video_comments
      SET viewer_name = ${fullName}
      WHERE viewer_id = ${viewerId}
    `;

    const viewer = rows[0];

    return NextResponse.json({
      message: "Profile updated successfully.",
      viewer: {
        id: Number(viewer.id),
        fullName: String(viewer.name),
        username: String(viewer.username),
        email: String(viewer.email),
        profilePictureUrl: String(
          viewer.profile_picture_url || ""
        ),
      },
    });
  } catch (error) {
    console.error(
      "Unable to update viewer profile:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to update viewer profile.",
      },
      {
        status: 500,
      }
    );
  }
} 
