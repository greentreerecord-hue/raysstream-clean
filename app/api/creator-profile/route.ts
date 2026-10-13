import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import postgres from "postgres";
import { getCreatorFromSession } from "../../../lib/creator-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const connectionString =
  process.env.RAYSSTREAM_DB_DATABASE_URL;

if (!connectionString) {
  throw new Error("RAYSSTREAM_DB_DATABASE_URL is missing");
}

const sql = postgres(connectionString, {
  ssl: "require",
});

function json(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

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

function unauthorizedResponse() {
  return json(
    { error: "Please log in to your creator account." },
    401
  );
}

function validBlobUrl(
  blobUrl: string,
  expectedPathname: string
) {
  try {
    const parsedUrl = new URL(blobUrl);

    const validHost = parsedUrl.hostname.endsWith(
      ".public.blob.vercel-storage.com"
    );

    const urlPathname = decodeURIComponent(
      parsedUrl.pathname.replace(/^\/+/, "")
    );

    return (
      parsedUrl.protocol === "https:" &&
      validHost &&
      !parsedUrl.username &&
      !parsedUrl.password &&
      urlPathname === expectedPathname
    );
  } catch {
    return false;
  }
}

async function readBody(request: Request) {
  try {
    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return null;
    }

    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const creator = await getCreatorFromSession(request);

    if (!creator) {
      return unauthorizedResponse();
    }

    await ensureProfileColumns();

    const rows = await sql`
      SELECT
        name,
        email,
        profile_picture_url,
        profile_picture_pathname
      FROM creators
      WHERE id = ${creator.id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return json({ error: "Creator was not found." }, 404);
    }

    const profile = rows[0];

    return json({
      name: profile.name,
      email: profile.email,
      profilePictureUrl: profile.profile_picture_url || "",
      profilePicturePathname:
        profile.profile_picture_pathname || "",
    });
  } catch (error) {
    console.error("Load creator profile error:", error);

    return json(
      { error: "Could not load the creator profile." },
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const creator = await getCreatorFromSession(request);

    if (!creator) {
      return unauthorizedResponse();
    }

    const body = await readBody(request);

    if (!body) {
      return json({ error: "Invalid profile information." }, 400);
    }

    const profilePictureUrl =
      typeof body.profilePictureUrl === "string"
        ? body.profilePictureUrl.trim()
        : "";

    const profilePicturePathname =
      typeof body.profilePicturePathname === "string"
        ? body.profilePicturePathname.trim()
        : "";

    if (!profilePictureUrl || !profilePicturePathname) {
      return json(
        { error: "Missing creator profile information." },
        400
      );
    }

    const safeEmail = creator.email.replace(/[^a-z0-9]/g, "-");
    const creatorFolder = `profiles/${safeEmail}/`;

    if (
      !profilePicturePathname.startsWith(creatorFolder) ||
      profilePicturePathname.includes("..") ||
      profilePicturePathname.includes("\\") ||
      !validBlobUrl(profilePictureUrl, profilePicturePathname)
    ) {
      return json(
        { error: "Invalid creator profile picture." },
        403
      );
    }

    await ensureProfileColumns();

    const rows = await sql`
      SELECT profile_picture_url
      FROM creators
      WHERE id = ${creator.id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return json({ error: "Creator was not found." }, 404);
    }

    const oldProfilePictureUrl = rows[0].profile_picture_url;

    await sql`
      UPDATE creators
      SET
        profile_picture_url = ${profilePictureUrl},
        profile_picture_pathname = ${profilePicturePathname}
      WHERE id = ${creator.id}
    `;

    if (
      oldProfilePictureUrl &&
      oldProfilePictureUrl !== profilePictureUrl
    ) {
      try {
        await del(oldProfilePictureUrl, {
          token: process.env.RAYSSTREAM_VIDEO_READ_WRITE_TOKEN,
        });
      } catch (error) {
        console.error(
          "Unable to delete old profile picture:",
          error
        );
      }
    }

    return json({
      success: true,
      profilePictureUrl,
      profilePicturePathname,
      message: "Creator profile picture updated successfully.",
    });
  } catch (error) {
    console.error("Save creator profile error:", error);

    return json(
      { error: "Could not save the creator profile." },
      500
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const creator = await getCreatorFromSession(request);

    if (!creator) {
      return unauthorizedResponse();
    }

    const body = await readBody(request);

    if (!body) {
      return json({ error: "Invalid profile update." }, 400);
    }

    // Update the creator's display name.
    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      if (
        request.headers.get("origin") !==
        new URL(request.url).origin
      ) {
        return json({ error: "Invalid request origin." }, 403);
      }

      const newName =
        typeof body.name === "string"
          ? body.name.trim().replace(/\s+/g, " ")
          : "";

      if (!newName || newName.length > 100) {
        return json(
          {
            error:
              "Enter a creator name between 1 and 100 characters.",
          },
          400
        );
      }

      const updated = await sql.begin(async (transaction) => {
        const rows = await transaction`
          UPDATE creators
          SET name = ${newName}
          WHERE id = ${creator.id}
          RETURNING name, email
        `;

        if (rows.length === 0) {
          return null;
        }

        const tables = await transaction`
          SELECT to_regclass('public.prereleases') AS prereleases
        `;

        if (tables[0].prereleases) {
          await transaction`
            UPDATE prereleases
            SET creator_name = ${newName}
            WHERE creator_id = ${creator.id}
          `;
        }

        return rows[0];
      });

      if (!updated) {
        return json({ error: "Creator was not found." }, 404);
      }

      return json({
        success: true,
        name: updated.name,
        email: updated.email,
        message: "Your creator name was updated successfully.",
      });
    }

    // Keep the existing email-editing feature.
    const newEmail =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(newEmail)) {
      return json(
        { error: "Please enter a valid email address." },
        400
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
      return json(
        { error: "That email address is already being used." },
        409
      );
    }

    const currentCreators = await sql`
      SELECT email
      FROM creators
      WHERE id = ${creator.id}
      LIMIT 1
    `;

    if (currentCreators.length === 0) {
      return json({ error: "Creator was not found." }, 404);
    }

    const oldEmail = String(currentCreators[0].email)
      .trim()
      .toLowerCase();

    if (oldEmail === newEmail) {
      return json({
        success: true,
        email: newEmail,
        message: "Your email address is already up to date.",
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

    return json({
      success: true,
      email: newEmail,
      message: "Your creator email was updated successfully.",
    });
  } catch (error) {
    console.error("Update creator profile error:", error);

    return json(
      { error: "Could not update your creator profile." },
      500
    );
  }
} 
