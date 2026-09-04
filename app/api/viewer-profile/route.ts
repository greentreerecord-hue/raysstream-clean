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

class InvalidPictureError extends Error {}

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

async function ensureViewerProfileColumn() {
  await sql`
    ALTER TABLE viewers
    ADD COLUMN IF NOT EXISTS
    profile_picture_url TEXT
  `;
}

function isOwnPicture(
  pictureUrl: string,
  viewerId: number
) {
  try {
    const base = "https://profile.invalid";
    const picture = new URL(pictureUrl, base);

    if (
      picture.origin !== base ||
      picture.pathname !== "/api/viewer-picture" ||
      picture.hash !== ""
    ) {
      return false;
    }

    const entries = Array.from(
      picture.searchParams.entries()
    );

    if (
      entries.length !== 1 ||
      entries[0][0] !== "pathname"
    ) {
      return false;
    }

    const pathname = entries[0][1];
    const prefix = `viewer-pictures/${viewerId}/`;

    if (!pathname.startsWith(prefix)) {
      return false;
    }

    const filename = pathname.slice(prefix.length);

    // Only a single image filename is allowed.
    // No nested folders, traversal, or encoded separators.
    if (
      !/^[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(
        filename
      )
    ) {
      return false;
    }

    const expectedUrl =
      `/api/viewer-picture?pathname=${encodeURIComponent(
        pathname
      )}`;

    return pictureUrl === expectedUrl;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const viewerId =
      await getViewerIdFromSession(request);

    if (viewerId === null) {
      return jsonResponse(
        {
          error:
            "Please log in to your viewer account.",
        },
        401
      );
    }

    await ensureViewerProfileColumn();

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
      return jsonResponse(
        {
          error: "Viewer account not found.",
        },
        404
      );
    }

    const viewer = rows[0];

    return jsonResponse({
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

    return jsonResponse(
      {
        error: "Unable to load viewer profile.",
      },
      500
    );
  }
}

export async function PUT(request: Request) {
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
            "This profile request is not allowed.",
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
            "Please log in to your viewer account.",
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
          error: "Invalid profile request.",
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
          error: "Invalid profile request.",
        },
        400
      );
    }

    const body = parsedBody as Record<
      string,
      unknown
    >;

    const fullName =
      typeof body.fullName === "string"
        ? body.fullName.trim()
        : "";

    if (!fullName) {
      return jsonResponse(
        {
          error: "Your full name is required.",
        },
        400
      );
    }

    if (fullName.length > 100) {
      return jsonResponse(
        {
          error:
            "Your full name must be 100 characters or less.",
        },
        400
      );
    }

    // null means keep the current picture.
    // An empty string means remove it from the profile.
    let profilePictureUrl: string | null = null;

    if (body.profilePictureUrl !== undefined) {
      if (
        typeof body.profilePictureUrl !== "string"
      ) {
        return jsonResponse(
          {
            error: "Invalid profile picture.",
          },
          400
        );
      }

      profilePictureUrl =
        body.profilePictureUrl.trim();

      if (profilePictureUrl.length > 2048) {
        return jsonResponse(
          {
            error: "Invalid profile picture.",
          },
          400
        );
      }
    }

    await ensureViewerProfileColumn();

    const viewer = await sql.begin(
      async (transaction) => {
        // Lock this viewer's row while checking and saving.
        const currentRows = await transaction`
          SELECT profile_picture_url
          FROM viewers
          WHERE id = ${viewerId}
          FOR UPDATE
        `;

        if (currentRows.length === 0) {
          return null;
        }

        const currentPictureUrl = String(
          currentRows[0].profile_picture_url || ""
        );

        // Existing legacy pictures may remain unchanged.
        // A different picture must belong to this viewer's
        // session-scoped upload folder.
        if (
          profilePictureUrl !== null &&
          profilePictureUrl !== "" &&
          profilePictureUrl !== currentPictureUrl &&
          !isOwnPicture(profilePictureUrl, viewerId)
        ) {
          throw new InvalidPictureError(
            "Please upload a new picture using your own viewer account."
          );
        }

        const rows = await transaction`
          UPDATE viewers
          SET
            name = ${fullName},
            profile_picture_url = COALESCE(
              ${profilePictureUrl},
              profile_picture_url
            )
          WHERE id = ${viewerId}
          RETURNING
            id,
            name,
            username,
            email,
            profile_picture_url
        `;

        await transaction`
          UPDATE video_comments
          SET viewer_name = ${fullName}
          WHERE viewer_id = ${viewerId}
        `;

        await transaction`
          UPDATE creator_video_comments
          SET viewer_name = ${fullName}
          WHERE viewer_id = ${viewerId}
        `;

        return rows[0];
      }
    );

    if (viewer === null) {
      return jsonResponse(
        {
          error: "Viewer account not found.",
        },
        404
      );
    }

    return jsonResponse({
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
    if (error instanceof InvalidPictureError) {
      return jsonResponse(
        {
          error: error.message,
        },
        400
      );
    }

    console.error(
      "Unable to update viewer profile:",
      error
    );

    return jsonResponse(
      {
        error: "Unable to update viewer profile.",
      },
      500
    );
  }
} 
