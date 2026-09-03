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

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const viewerId = Number(body.viewerId);
    const fullName = String(
      body.fullName || ""
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
      SET name = ${fullName}
      WHERE id = ${viewerId}
      RETURNING
        id,
        name,
        username,
        email
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

    const viewer = rows[0];

    return NextResponse.json({
      message: "Profile updated successfully.",
      viewer: {
        id: Number(viewer.id),
        fullName: String(viewer.name),
        username: String(viewer.username),
        email: String(viewer.email),
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
