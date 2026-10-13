import { NextResponse } from "next/server";
import postgres from "postgres";
import { getCreatorFromSession } from "../../../lib/creator-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getDatabase() {
  const url = process.env.RAYSSTREAM_DB_DATABASE_URL;

  if (!url) {
    throw new Error("Database is not configured.");
  }

  return postgres(url, {
    ssl: "require",
    max: 1,
    prepare: false,
  });
}

function json(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function ensureTable(
  sql: ReturnType<typeof getDatabase>
) {
  await sql`
    CREATE TABLE IF NOT EXISTS prereleases (
      id SERIAL PRIMARY KEY,
      creator_id INTEGER NOT NULL REFERENCES creators(id),
      title TEXT NOT NULL,
      creator_name TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('Music', 'Video')),
      description TEXT NOT NULL DEFAULT '',
      release_date DATE NOT NULL,
      cover_url TEXT NOT NULL DEFAULT '',
      preview_url TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function validUrl(value: string) {
  if (!value) return true;

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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export async function GET() {
  const sql = getDatabase();

  try {
    await ensureTable(sql);

    const releases = await sql`
      SELECT
        id::text AS id,
        title,
        creator_name AS creator,
        kind,
        description,
        to_char(release_date, 'YYYY-MM-DD') AS "releaseDate",
        cover_url AS "coverUrl",
        preview_url AS "previewUrl"
      FROM prereleases
      ORDER BY release_date DESC, created_at DESC
      LIMIT 200
    `;

    return json({ releases });
  } catch (error) {
    console.error("Prerelease loading failed:", error);
    return json({ error: "Could not load prereleases." }, 500);
  } finally {
    await sql.end();
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  if (origin !== new URL(request.url).origin) {
    return json({ error: "Invalid request origin." }, 403);
  }

  let body: Record<string, unknown>;

  try {
    const parsed = await request.json();

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json({ error: "Invalid submission." }, 400);
    }

    body = parsed;
  } catch {
    return json({ error: "Invalid submission." }, 400);
  }

  const text = (key: string) =>
    typeof body[key] === "string" ? body[key].trim() : "";

  const title = text("title");
  const kind = text("kind");
  const description = text("description");
  const releaseDate = text("releaseDate");
  const coverUrl = text("coverUrl");
  const previewUrl = text("previewUrl");

  if (
    !title ||
    title.length > 200 ||
    description.length > 3000 ||
    (kind !== "Music" && kind !== "Video") ||
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

  const sql = getDatabase();

  try {
    const creator = await getCreatorFromSession(request);

    if (!creator) {
      return json({ error: "Please log in as a creator." }, 401);
    }

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

    return json({ success: true, id: rows[0].id }, 201);
  } catch (error) {
    console.error("Prerelease submission failed:", error);
    return json({ error: "Could not save your prerelease." }, 500);
  } finally {
    await sql.end();
  }
} 
