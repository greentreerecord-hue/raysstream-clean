import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import postgres from "postgres";

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

async function ensureVideoTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS creator_videos (
      id SERIAL PRIMARY KEY,
      creator_email TEXT NOT NULL,
      blob_url TEXT UNIQUE NOT NULL,
      pathname TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      thumbnail_url TEXT,
      thumbnail_pathname TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE creator_videos
    ADD COLUMN IF NOT EXISTS description TEXT
  `;

  await sql`
    ALTER TABLE creator_videos
    ADD COLUMN IF NOT EXISTS thumbnail_url TEXT
  `;

  await sql`
    ALTER TABLE creator_videos
    ADD COLUMN IF NOT EXISTS thumbnail_pathname TEXT
  `;
}

export async function GET(request: Request) {
  try {
    await ensureVideoTable();

    const { searchParams } = new URL(
      request.url
    );

    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        {
          error:
            "Creator email is required.",
        },
        {
          status: 400,
        }
      );
    }

    const creatorEmail =
      email.trim().toLowerCase();

    const safeEmail =
      creatorEmail.replace(
        /[^a-z0-9]/g,
        "-"
      );

    const { blobs } = await list({
      prefix: `videos/${safeEmail}/`,
      token:
        process.env
          .RAYSSTREAM_VIDEO_READ_WRITE_TOKEN,
    });

    const videoBlobs = blobs.filter(
      (blob) => {
        const name =
          blob.pathname.toLowerCase();

        return (
          name.endsWith(".mp4") ||
          name.endsWith(".webm") ||
          name.endsWith(".mov")
        );
      }
    );

    const savedVideos = await sql`
      SELECT
        blob_url,
        title,
        description,
        thumbnail_url,
        thumbnail_pathname
      FROM creator_videos
      WHERE creator_email = ${creatorEmail}
    `;

    const videos = videoBlobs.map(
      (blob) => {
        const savedVideo =
          savedVideos.find(
            (video) =>
              video.blob_url === blob.url
          );

        return {
          url: blob.url,
          pathname: blob.pathname,
          title:
            savedVideo?.title || null,
          description:
            savedVideo?.description || "",
          thumbnailUrl:
            savedVideo?.thumbnail_url ||
            null,
          thumbnailPathname:
            savedVideo?.thumbnail_pathname ||
            null,
        };
      }
    );

    return NextResponse.json({
      videos,
    });
  } catch (error) {
    console.error(
      "My videos error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not load videos.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    await ensureVideoTable();

    const body =
      await request.json();

    const email =
      body.email
        ?.trim()
        .toLowerCase();

    const url = body.url;
    const pathname = body.pathname;
    const title =
      body.title?.trim();

    const description =
      typeof body.description ===
      "string"
        ? body.description.trim()
        : "";

    const thumbnailUrl =
      body.thumbnailUrl || null;

    const thumbnailPathname =
      body.thumbnailPathname || null;

    if (
      !email ||
      !url ||
      !pathname ||
      !title
    ) {
      return NextResponse.json(
        {
          error:
            "Missing video information.",
        },
        {
          status: 400,
        }
      );
    }

    const safeEmail =
      email.replace(
        /[^a-z0-9]/g,
        "-"
      );

    const creatorFolder =
      `videos/${safeEmail}/`;

    const thumbnailFolder =
      `thumbnails/${safeEmail}/`;

    if (
      !pathname.startsWith(
        creatorFolder
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid creator video.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      thumbnailPathname &&
      !thumbnailPathname.startsWith(
        thumbnailFolder
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid video thumbnail.",
        },
        {
          status: 403,
        }
      );
    }

    await sql`
      INSERT INTO creator_videos (
        creator_email,
        blob_url,
        pathname,
        title,
        description,
        thumbnail_url,
        thumbnail_pathname
      )
      VALUES (
        ${email},
        ${url},
        ${pathname},
        ${title},
        ${description},
        ${thumbnailUrl},
        ${thumbnailPathname}
      )
      ON CONFLICT (blob_url)
      DO UPDATE SET
        creator_email =
          EXCLUDED.creator_email,
        pathname =
          EXCLUDED.pathname,
        title =
          EXCLUDED.title,
        description =
          EXCLUDED.description,
        thumbnail_url =
          EXCLUDED.thumbnail_url,
        thumbnail_pathname =
          EXCLUDED.thumbnail_pathname
    `;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Save video error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not save video information.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: Request
) {
  try {
    await ensureVideoTable();

    const body =
      await request.json();

    const email =
      body.email
        ?.trim()
        .toLowerCase();

    const url = body.url;
    const pathname = body.pathname;
    const title =
      body.title?.trim();

    const description =
      typeof body.description ===
      "string"
        ? body.description.trim()
        : "";

    if (
      !email ||
      !url ||
      !pathname ||
      !title
    ) {
      return NextResponse.json(
        {
          error:
            "Email, video, pathname, and title are required.",
        },
        {
          status: 400,
        }
      );
    }

    const safeEmail =
      email.replace(
        /[^a-z0-9]/g,
        "-"
      );

    const creatorFolder =
      `videos/${safeEmail}/`;

    if (
      !pathname.startsWith(
        creatorFolder
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot edit this video.",
        },
        {
          status: 403,
        }
      );
    }

    await sql`
      INSERT INTO creator_videos (
        creator_email,
        blob_url,
        pathname,
        title,
        description
      )
      VALUES (
        ${email},
        ${url},
        ${pathname},
        ${title},
        ${description}
      )
      ON CONFLICT (blob_url)
      DO UPDATE SET
        creator_email =
          EXCLUDED.creator_email,
        pathname =
          EXCLUDED.pathname,
        title =
          EXCLUDED.title,
        description =
          EXCLUDED.description
    `;

    return NextResponse.json({
      success: true,
      title,
      description,
    });
  } catch (error) {
    console.error(
      "Edit details error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not update video details.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request
) {
  try {
    await ensureVideoTable();

    const body =
      await request.json();

    const email =
      body.email
        ?.trim()
        .toLowerCase();

    const url = body.url;
    const pathname = body.pathname;

    if (
      !email ||
      !url ||
      !pathname
    ) {
      return NextResponse.json(
        {
          error:
            "Missing video information.",
        },
        {
          status: 400,
        }
      );
    }

    const safeEmail =
      email.replace(
        /[^a-z0-9]/g,
        "-"
      );

    const creatorFolder =
      `videos/${safeEmail}/`;

    if (
      !pathname.startsWith(
        creatorFolder
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot delete this video.",
        },
        {
          status: 403,
        }
      );
    }

    const savedVideos =
      await sql`
        SELECT thumbnail_url
        FROM creator_videos
        WHERE
          creator_email = ${email}
          AND blob_url = ${url}
        LIMIT 1
      `;

    const thumbnailUrl =
      savedVideos[0]
        ?.thumbnail_url;

    const filesToDelete =
      thumbnailUrl
        ? [url, thumbnailUrl]
        : [url];

    await del(filesToDelete, {
      token:
        process.env
          .RAYSSTREAM_VIDEO_READ_WRITE_TOKEN,
    });

    await sql`
      DELETE FROM creator_videos
      WHERE
        creator_email = ${email}
        AND blob_url = ${url}
    `;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Delete video error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not delete video.",
      },
      {
        status: 500,
      }
    );
  }
} 
