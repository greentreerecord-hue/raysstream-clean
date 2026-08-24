import { del } from "@vercel/blob";
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

async function ensureProfileColumns() {
  await sql`
    ALTER TABLE creators
    ADD COLUMN IF NOT EXISTS profile_picture_url TEXT
  `;

  await sql`
    ALTER TABLE creators
    ADD COLUMN IF NOT EXISTS profile_picture_pathname TEXT
  `;
}

export async function GET(request: Request) {
  try {
    await ensureProfileColumns();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        {
          error: "Creator email is required.",
        },
        {
          status: 400,
        }
      );
    }

    const creatorEmail = email.trim().toLowerCase();

    const creators = await sql`
      SELECT
        name,
        profile_picture_url,
        profile_picture_pathname
      FROM creators
      WHERE LOWER(email) = ${creatorEmail}
      LIMIT 1
    `;

    if (creators.length === 0) {
      return NextResponse.json(
        {
          error: "Creator was not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      name: creators[0].name,
      profilePictureUrl:
        creators[0].profile_picture_url || "",
      profilePicturePathname:
        creators[0].profile_picture_pathname || "",
    });
  } catch (error) {
    console.error("Load creator profile error:", error);

    return NextResponse.json(
      {
        error: "Could not load the creator profile.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureProfileColumns();

    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const profilePictureUrl =
      body.profilePictureUrl?.trim();
    const profilePicturePathname =
      body.profilePicturePathname?.trim();

    if (
      !email ||
      !profilePictureUrl ||
      !profilePicturePathname
    ) {
      return NextResponse.json(
        {
          error: "Missing creator profile information.",
        },
        {
          status: 400,
        }
      );
    }

    const safeEmail = email.replace(
      /[^a-z0-9]/g,
      "-"
    );

    const creatorFolder = `profiles/${safeEmail}/`;

    if (
      !profilePicturePathname.startsWith(
        creatorFolder
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid creator profile picture.",
        },
        {
          status: 403,
        }
      );
    }

    const existingCreators = await sql`
      SELECT profile_picture_url
      FROM creators
      WHERE LOWER(email) = ${email}
      LIMIT 1
    `;

    if (existingCreators.length === 0) {
      return NextResponse.json(
        {
          error: "Creator was not found.",
        },
        {
          status: 404,
        }
      );
    }

    const oldProfilePictureUrl =
      existingCreators[0].profile_picture_url;

    await sql`
      UPDATE creators
      SET
        profile_picture_url = ${profilePictureUrl},
        profile_picture_pathname =
          ${profilePicturePathname}
      WHERE LOWER(email) = ${email}
    `;

    if (
      oldProfilePictureUrl &&
      oldProfilePictureUrl !== profilePictureUrl
    ) {
      try {
        await del(oldProfilePictureUrl, {
          token:
            process.env
              .RAYSSTREAM_VIDEO_READ_WRITE_TOKEN,
        });
      } catch (error) {
        console.error(
          "Unable to delete old profile picture:",
          error
        );
      }
    }

    return NextResponse.json({
      success: true,
      profilePictureUrl,
      message:
        "Creator profile picture updated successfully.",
    });
  } catch (error) {
    console.error("Save creator profile error:", error);

    return NextResponse.json(
      {
        error: "Could not save the creator profile.",
      },
      {
        status: 500,
      }
    );
  }
} 
