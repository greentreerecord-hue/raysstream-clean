import { NextResponse } from "next/server";
import postgres from "postgres";
import { getCreatorFromSession } from "../../../lib/creator-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getDatabase() {
  const url =
    process.env.RAYSSTREAM_DB_DATABASE_URL;

  if (!url) {
    throw new Error(
      "Database is not configured."
    );
  }

  return postgres(url, {
    ssl: "require",
    max: 1,
    prepare: false,
  });
}

function json(
  body: object,
  status = 200
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

async function ensureTable(
  sql: ReturnType<typeof getDatabase>
) {
  await sql`
    CREATE TABLE IF NOT EXISTS prereleases (
      id SERIAL PRIMARY KEY,
      creator_id INTEGER NOT NULL
        REFERENCES creators(id),
      title TEXT NOT NULL,
      creator_name TEXT NOT NULL,
      kind TEXT NOT NULL
        CHECK (kind IN ('Music', 'Video')),
      description TEXT NOT NULL DEFAULT '',
      release_date DATE NOT NULL,
      cover_url TEXT NOT NULL DEFAULT '',
      preview_url TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW()
    )
  `;
}

function validUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function validDate(value: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(
    `${value}T00:00:00.000Z`
  );

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) ===
      value
  );
}

function validOrigin(request: Request) {
  return (
    request.headers.get("origin") ===
    new URL(request.url).origin
  );
}

async function readBody(
  request: Request
): Promise<Record<string, unknown> | null> {
  try {
    const parsed = await request.json();

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function GET() {
  let sql:
    | ReturnType<typeof getDatabase>
    | undefined;

  try {
    sql = getDatabase();

    await ensureTable(sql);

    const releases = await sql`
      SELECT
        id::text AS id,
        title,
        creator_name AS creator,
        kind,
        description,
        to_char(
          release_date,
          'YYYY-MM-DD'
        ) AS "releaseDate",
        cover_url AS "coverUrl",
        preview_url AS "previewUrl"
      FROM prereleases
      ORDER BY
        release_date DESC,
        created_at DESC
      LIMIT 200
    `;

    return json({ releases });
  } catch (error) {
    console.error(
      "Prerelease loading failed:",
      error
    );

    return json(
      {
        error:
          "Could not load prereleases.",
      },
      500
    );
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

export async function POST(
  request: Request
) {
  if (!validOrigin(request)) {
    return json(
      {
        error:
          "Invalid request origin.",
      },
      403
    );
  }

  const body = await readBody(request);

  if (!body) {
    return json(
      { error: "Invalid submission." },
      400
    );
  }

  const text = (key: string) =>
    typeof body[key] === "string"
      ? body[key].trim()
      : "";

  const title = text("title");
  const kind = text("kind");
  const description =
    text("description");
  const releaseDate =
    text("releaseDate");
  const coverUrl = text("coverUrl");
  const previewUrl =
    text("previewUrl");

  if (
    !title ||
    title.length > 200 ||
    description.length > 3000 ||
    (
      kind !== "Music" &&
      kind !== "Video"
    ) ||
    !validDate(releaseDate) ||
    coverUrl.length > 2048 ||
    previewUrl.length > 2048 ||
    !validUrl(coverUrl) ||
    !validUrl(previewUrl)
  ) {
    return json(
      {
        error:
          "Enter a title, Music or Video, a valid release date, and HTTPS links for any cover or preview.",
      },
      400
    );
  }

  let sql:
    | ReturnType<typeof getDatabase>
    | undefined;

  try {
    const creator =
      await getCreatorFromSession(
        request
      );

    if (!creator) {
      return json(
        {
          error:
            "Please log in as a creator.",
        },
        401
      );
    }

    sql = getDatabase();

    await ensureTable(sql);

    const rows = await sql`
      INSERT INTO prereleases (
        creator_id,
        title,
        creator_name,
        kind,
        description,
        release_date,
        cover_url,
        preview_url
      )
      VALUES (
        ${creator.id},
        ${title},
        ${creator.name},
        ${kind},
        ${description},
        ${releaseDate},
        ${coverUrl},
        ${previewUrl}
      )
      RETURNING id::text AS id
    `;

    return json(
      {
        success: true,
        id: rows[0].id,
      },
      201
    );
  } catch (error) {
    console.error(
      "Prerelease submission failed:",
      error
    );

    return json(
      {
        error:
          "Could not save your prerelease.",
      },
      500
    );
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

export async function PATCH(
  request: Request
) {
  if (!validOrigin(request)) {
    return json(
      {
        error:
          "Invalid request origin.",
      },
      403
    );
  }

  const body = await readBody(request);

  if (!body) {
    return json(
      { error: "Invalid update." },
      400
    );
  }

  const id = String(body.id ?? "");

  if (
    !/^[1-9]\d{0,9}$/.test(id) ||
    Number(id) > 2147483647
  ) {
    return json(
      {
        error:
          "A valid prerelease is required.",
      },
      400
    );
  }

  const fields = [
    "title",
    "kind",
    "description",
    "releaseDate",
    "coverUrl",
    "previewUrl",
  ] as const;

  const has = (key: string) =>
    Object.prototype.hasOwnProperty.call(
      body,
      key
    );

  if (
    !fields.some((key) => has(key))
  ) {
    return json(
      {
        error:
          "Choose something to update.",
      },
      400
    );
  }

  for (const key of fields) {
    if (
      has(key) &&
      typeof body[key] !== "string"
    ) {
      return json(
        {
          error:
            `Invalid value for ${key}.`,
        },
        400
      );
    }
  }

  const text = (key: string) =>
    typeof body[key] === "string"
      ? body[key].trim()
      : "";

  const title = text("title");
  const kind = text("kind");
  const description =
    text("description");
  const releaseDate =
    text("releaseDate");
  const coverUrl = text("coverUrl");
  const previewUrl =
    text("previewUrl");

  if (
    has("title") &&
    (
      !title ||
      title.length > 200
    )
  ) {
    return json(
      {
        error:
          "Enter a title of 200 characters or fewer.",
      },
      400
    );
  }

  if (
    has("kind") &&
    kind !== "Music" &&
    kind !== "Video"
  ) {
    return json(
      {
        error:
          "Choose Music or Video.",
      },
      400
    );
  }

  if (
    has("description") &&
    description.length > 3000
  ) {
    return json(
      {
        error:
          "Keep the description to 3,000 characters or fewer.",
      },
      400
    );
  }

  if (
    has("releaseDate") &&
    !validDate(releaseDate)
  ) {
    return json(
      {
        error:
          "Enter a valid release date.",
      },
      400
    );
  }

  if (
    has("coverUrl") &&
    (
      coverUrl.length > 2048 ||
      !validUrl(coverUrl)
    )
  ) {
    return json(
      {
        error:
          "Use an HTTPS cover image link, or leave it blank.",
      },
      400
    );
  }

  if (
    has("previewUrl") &&
    (
      previewUrl.length > 2048 ||
      !validUrl(previewUrl)
    )
  ) {
    return json(
      {
        error:
          "Use an HTTPS preview link, or leave it blank.",
      },
      400
    );
  }

  let sql:
    | ReturnType<typeof getDatabase>
    | undefined;

  try {
    const creator =
      await getCreatorFromSession(
        request
      );

    if (!creator) {
      return json(
        {
          error:
            "Please log in as a creator.",
        },
        401
      );
    }

    sql = getDatabase();

    await ensureTable(sql);

    const rows = await sql`
      UPDATE prereleases
      SET
        title = CASE
          WHEN ${has("title")}
          THEN ${title}
          ELSE title
        END,
        kind = CASE
          WHEN ${has("kind")}
          THEN ${kind}
          ELSE kind
        END,
        description = CASE
          WHEN ${has("description")}
          THEN ${description}
          ELSE description
        END,
        release_date = CASE
          WHEN ${has("releaseDate")}
          THEN ${releaseDate || null}::date
          ELSE release_date
        END,
        cover_url = CASE
          WHEN ${has("coverUrl")}
          THEN ${coverUrl}
          ELSE cover_url
        END,
        preview_url = CASE
          WHEN ${has("previewUrl")}
          THEN ${previewUrl}
          ELSE preview_url
        END
      WHERE id = ${Number(id)}
        AND creator_id = ${creator.id}
      RETURNING
        id::text AS id,
        title,
        creator_name AS creator,
        kind,
        description,
        to_char(
          release_date,
          'YYYY-MM-DD'
        ) AS "releaseDate",
        cover_url AS "coverUrl",
        preview_url AS "previewUrl"
    `;

    if (rows.length === 0) {
      return json(
        {
          error:
            "This prerelease was not found in your account.",
        },
        404
      );
    }

    return json({
      success: true,
      id: rows[0].id,
      release: rows[0],
    });
  } catch (error) {
    console.error(
      "Prerelease update failed:",
      error
    );

    return json(
      {
        error:
          "Could not update your prerelease.",
      },
      500
    );
  } finally {
    if (sql) {
      await sql.end();
    }
  }
} 
