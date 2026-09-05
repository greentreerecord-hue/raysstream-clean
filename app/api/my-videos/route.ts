import {
  del,
  list,
} from "@vercel/blob";
import { NextResponse } from "next/server";
import postgres from "postgres";
import {
  getCreatorFromSession,
} from "../../../lib/creator-session";

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

const blobToken =
  process.env
    .RAYSSTREAM_VIDEO_READ_WRITE_TOKEN;

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

function creatorFolderFor(
  email: string
) {
  const safeEmail = email.replace(
    /[^a-z0-9]/g,
    "-"
  );

  return {
    videoFolder: `videos/${safeEmail}/`,
    thumbnailFolder:
      `thumbnails/${safeEmail}/`,
  };
}

function unauthorized() {
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

async function blobMatches(
  folder: string,
  pathname: string,
  url: string
) {
  const { blobs } = await list({
    prefix: folder,
    token: blobToken,
  });

  return blobs.some(
    (blob) =>
      blob.pathname === pathname &&
      blob.url === url
  );
}

export async function GET(
  request: Request
) {
  try {
    const creator =
      await getCreatorFromSession(request);

    if (!creator) {
      return unauthorized();
    }

    await ensureVideoTable();

    const { videoFolder } =
      creatorFolderFor(creator.email);

    const { blobs } = await list({
      prefix: videoFolder,
      token: blobToken,
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
      WHERE creator_email =
        ${creator.email}
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
            savedVideo
              ?.thumbnail_pathname || null,
        };
      }
    );

    return NextResponse.json({
      videos,
      creatorEmail: creator.email,
    });
  } catch (error) {
    console.error(
      "My videos error:",
      error
    );

    return NextResponse.json(
      {
        error: "Could not load videos.",
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
    const creator =
      await getCreatorFromSession(request);

    if (!creator) {
      return unauthorized();
    }

    await ensureVideoTable();

    const body = await request.json();

    const url =
      typeof body.url === "string"
        ? body.url.trim()
        : "";

    const pathname =
      typeof body.pathname === "string"
        ? body.pathname.trim()
        : "";

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const thumbnailUrl =
      typeof body.thumbnailUrl === "string" &&
      body.thumbnailUrl.trim()
        ? body.thumbnailUrl.trim()
        : null;

    const thumbnailPathname =
      typeof body.thumbnailPathname ===
        "string" &&
      body.thumbnailPathname.trim()
        ? body.thumbnailPathname.trim()
        : null;

    if (!url || !pathname || !title) {
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

    if (
      title.length > 200 ||
      description.length > 5000
    ) {
      return NextResponse.json(
        {
          error:
            "Video title or description is too long.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      videoFolder,
      thumbnailFolder,
    } = creatorFolderFor(creator.email);

    const validVideo =
      pathname.startsWith(
        videoFolder
      ) &&
      (await blobMatches(
        videoFolder,
        pathname,
        url
      ));

    if (!validVideo) {
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
      (thumbnailUrl &&
        !thumbnailPathname) ||
      (!thumbnailUrl &&
        thumbnailPathname)
    ) {
      return NextResponse.json(
        {
          error:
            "Incomplete thumbnail information.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      thumbnailUrl &&
      thumbnailPathname
    ) {
      const validThumbnail =
        thumbnailPathname.startsWith(
          thumbnailFolder
        ) &&
        (await blobMatches(
          thumbnailFolder,
          thumbnailPathname,
          thumbnailUrl
        ));

      if (!validThumbnail) {
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
    }

    const existingRows = await sql`
      SELECT creator_email
      FROM creator_videos
      WHERE blob_url = ${url}
      LIMIT 1
    `;

    if (
      existingRows.length > 0 &&
      String(
        existingRows[0].creator_email
      ).toLowerCase() !== creator.email
    ) {
      return NextResponse.json(
        {
          error:
            "This video belongs to another creator.",
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
        ${creator.email},
        ${url},
        ${pathname},
        ${title},
        ${description},
        ${thumbnailUrl},
        ${thumbnailPathname}
      )
      ON CONFLICT (blob_url)
      DO UPDATE SET
        pathname = EXCLUDED.pathname,
        title = EXCLUDED.title,
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
    const creator =
      await getCreatorFromSession(request);

    if (!creator) {
      return unauthorized();
    }

    await ensureVideoTable();

    const body = await request.json();

    const url =
      typeof body.url === "string"
        ? body.url.trim()
        : "";

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const thumbnailUrl =
      typeof body.thumbnailUrl === "string" &&
      body.thumbnailUrl.trim()
        ? body.thumbnailUrl.trim()
        : null;

    const thumbnailPathname =
      typeof body.thumbnailPathname ===
        "string" &&
      body.thumbnailPathname.trim()
        ? body.thumbnailPathname.trim()
        : null;

    if (!url || !title) {
      return NextResponse.json(
        {
          error:
            "Video and title are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      title.length > 200 ||
      description.length > 5000
    ) {
      return NextResponse.json(
        {
          error:
            "Video title or description is too long.",
        },
        {
          status: 400,
        }
      );
    } 
if (
      (thumbnailUrl &&
        !thumbnailPathname) ||
      (!thumbnailUrl &&
        thumbnailPathname)
    ) {
      return NextResponse.json(
        {
          error:
            "Incomplete thumbnail information.",
        },
        {
          status: 400,
        }
      );
    }

    const existingVideos = await sql`
      SELECT
        pathname,
        thumbnail_url
      FROM creator_videos
      WHERE creator_email =
        ${creator.email}
        AND blob_url = ${url}
      LIMIT 1
    `;

    if (existingVideos.length === 0) {
      return NextResponse.json(
        {
          error:
            "Video not found for this creator.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      thumbnailUrl &&
      thumbnailPathname
    ) {
      const { thumbnailFolder } =
        creatorFolderFor(
          creator.email
        );

      const validThumbnail =
        thumbnailPathname.startsWith(
          thumbnailFolder
        ) &&
        (await blobMatches(
          thumbnailFolder,
          thumbnailPathname,
          thumbnailUrl
        ));

      if (!validThumbnail) {
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
    }

    const oldThumbnailUrl =
      existingVideos[0]
        .thumbnail_url || null;

    await sql`
      UPDATE creator_videos
      SET
        title = ${title},
        description = ${description},
        thumbnail_url =
          ${thumbnailUrl},
        thumbnail_pathname =
          ${thumbnailPathname}
      WHERE creator_email =
        ${creator.email}
        AND blob_url = ${url}
    `;

    if (
      oldThumbnailUrl &&
      oldThumbnailUrl !== thumbnailUrl
    ) {
      await del(oldThumbnailUrl, {
        token: blobToken,
      });
    }

    return NextResponse.json({
      success: true,
      title,
      description,
      thumbnailUrl,
      thumbnailPathname,
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
    const creator =
      await getCreatorFromSession(request);

    if (!creator) {
      return unauthorized();
    }

    await ensureVideoTable();

    const body = await request.json();

    const url =
      typeof body.url === "string"
        ? body.url.trim()
        : "";

    if (!url) {
      return NextResponse.json(
        {
          error:
            "Video information is required.",
        },
        {
          status: 400,
        }
      );
    }

    const savedVideos = await sql`
      SELECT
        blob_url,
        thumbnail_url
      FROM creator_videos
      WHERE creator_email =
        ${creator.email}
        AND blob_url = ${url}
      LIMIT 1
    `;

    if (savedVideos.length === 0) {
      return NextResponse.json(
        {
          error:
            "Video not found for this creator.",
        },
        {
          status: 404,
        }
      );
    }

    const savedVideo =
      savedVideos[0];

    const filesToDelete =
      savedVideo.thumbnail_url
        ? [
            savedVideo.blob_url,
            savedVideo.thumbnail_url,
          ]
        : [savedVideo.blob_url];

    await del(filesToDelete, {
      token: blobToken,
    });

    await sql`
      DELETE FROM creator_videos
      WHERE creator_email =
        ${creator.email}
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
