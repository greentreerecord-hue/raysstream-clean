import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import postgres from "postgres";
import { getCreatorFromSession } from "../../../lib/creator-session";

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

async function ensureProfileColumns() {
  await sql`
    ALTER TABLE creators
    ADD COLUMN IF NOT EXISTS
      profile_picture_url TEXT
  `;

  await sql`
    ALTER TABLE creators
    ADD COLUMN IF NOT EXISTS
      profile_picture_pathname TEXT
  `;
}

function unauthorizedResponse() {
  return NextResponse.json(
    {
      error:
        "Please log in to your creator account.",
    },
    {
      status: 401,
    }
  );
}

function validBlobUrl(
  blobUrl: string,
  expectedPathname: string
) {
  try {
    const parsedUrl = new URL(blobUrl);

    const validHost =
      parsedUrl.hostname.endsWith(
        ".public.blob.vercel-storage.com"
      );

    const urlPathname = decodeURIComponent(
      parsedUrl.pathname.replace(/^\/+/, "")
    );

    return (
      parsedUrl.protocol === "https:" &&
      validHost &&
      urlPathname === expectedPathname
    );
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const creator =
      await getCreatorFromSession(request);

    if (!creator) {
      return unauthorizedResponse();
    }

    await ensureProfileColumns();

    const creators = await sql`
      SELECT
        name,
        email,
        profile_picture_url,
        profile_picture_pathname
      FROM creators
      WHERE id = ${creator.id}
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

    const creatorProfile = creators[0];

    return NextResponse.json({
      name: creatorProfile.name,
      email: creatorProfile.email,
      profilePictureUrl:
        creatorProfile.profile_picture_url || "",
      profilePicturePathname:
        creatorProfile.profile_picture_pathname ||
        "",
    });
  } catch (error) {
    console.error(
      "Load creator profile error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not load the creator profile.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const creator =
      await getCreatorFromSession(request);

    if (!creator) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    const profilePictureUrl =
      typeof body.profilePictureUrl === "string"
        ? body.profilePictureUrl.trim()
        : "";

    const profilePicturePathname =
      typeof body.profilePicturePathname ===
      "string"
        ? body.profilePicturePathname.trim()
        : "";

    if (
      !profilePictureUrl ||
      !profilePicturePathname
    ) {
      return NextResponse.json(
        {
          error:
            "Missing creator profile information.",
        },
        {
          status: 400,
        }
      );
    }

    const safeEmail = creator.email.replace(
      /[^a-z0-9]/g,
      "-"
    );

    const creatorFolder =
      `profiles/${safeEmail}/`;

    if (
      !profilePicturePathname.startsWith(
        creatorFolder
      ) ||
      profilePicturePathname.includes("..") ||
      profilePicturePathname.includes("\\") ||
      !validBlobUrl(
        profilePictureUrl,
        profilePicturePathname
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid creator profile picture.",
        },
        {
          status: 403,
        }
      );
    }

    await ensureProfileColumns();

    const existingCreators = await sql`
      SELECT profile_picture_url
      FROM creators
      WHERE id = ${creator.id}
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
        profile_picture_url =
          ${profilePictureUrl},
        profile_picture_pathname =
          ${profilePicturePathname}
      WHERE id = ${creator.id}
    `;

    if (
      oldProfilePictureUrl &&
      oldProfilePictureUrl !==
        profilePictureUrl
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
      profilePicturePathname,
      message:
        "Creator profile picture updated successfully.",
    });
  } catch (error) {
    console.error(
      "Save creator profile error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not save the creator profile.",
      },
      {
        status: 500,
      }
    );
  }
} 
export async function PATCH(request: Request) {
  try {
    const creator =
      await getCreatorFromSession(request);

    if (!creator) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    const newEmail =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(newEmail)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    const existingCreators = await sql`
      SELECT id
      FROM creators
      WHERE LOWER(email) = ${newEmail}
        AND id <> ${creator.id}
      LIMIT 1
    `;

    if (existingCreators.length > 0) {
      return NextResponse.json(
        {
          error:
            "That email address is already being used.",
        },
        {
          status: 409,
        }
      );
    }

    const currentCreators = await sql`
      SELECT email
      FROM creators
      WHERE id = ${creator.id}
      LIMIT 1
    `;

    if (currentCreators.length === 0) {
      return NextResponse.json(
        {
          error: "Creator was not found.",
        },
        {
          status: 404,
        }
      );
    }

    const oldEmail = String(
      currentCreators[0].email
    )
      .trim()
      .toLowerCase();

    if (oldEmail === newEmail) {
      return NextResponse.json({
        success: true,
        email: newEmail,
        message:
          "Your email address is already up to date.",
      });
    }

    await sql.begin(async (transaction) => {
      await transaction`
        UPDATE creator_videos
        SET creator_email = ${newEmail}
        WHERE LOWER(creator_email) = ${oldEmail}
      `;

      await transaction`
        UPDATE music_releases
        SET creator_email = ${newEmail}
        WHERE LOWER(creator_email) = ${oldEmail}
      `;

      

      await transaction`
        UPDATE creators
        SET email = ${newEmail}
        WHERE id = ${creator.id}
      `;
    });

    return NextResponse.json({
      success: true,
      email: newEmail,
      message:
        "Your creator email was updated successfully.",
    });
  } catch (error) {
    console.error(
      "Update creator email error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not update your creator email.",
      },
      {
        status: 500,
      }
    );
  }
} 

