import { createHash } from "crypto";
import postgres from "postgres";

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

const SESSION_COOKIE =
  "raysstream_creator_session";

export type CreatorSession = {
  id: number;
  name: string;
  email: string;
};

function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function getCookieValue(
  request: Request,
  cookieName: string
) {
  const cookieHeader =
    request.headers.get("cookie") || "";

  for (const cookie of cookieHeader.split(";")) {
    const separatorIndex =
      cookie.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = cookie
      .slice(0, separatorIndex)
      .trim();

    if (name !== cookieName) {
      continue;
    }

    return decodeURIComponent(
      cookie
        .slice(separatorIndex + 1)
        .trim()
    );
  }

  return "";
}

async function ensureCreatorSessionTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS creator_sessions (
      id SERIAL PRIMARY KEY,
      creator_id INTEGER NOT NULL,
      session_token_hash TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS
      creator_sessions_creator_id_index
    ON creator_sessions (creator_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS
      creator_sessions_expires_at_index
    ON creator_sessions (expires_at)
  `;
}

export async function getCreatorFromSession(
  request: Request
): Promise<CreatorSession | null> {
  const sessionToken = getCookieValue(
    request,
    SESSION_COOKIE
  );

  if (!sessionToken) {
    return null;
  }

  await ensureCreatorSessionTable();

  const sessionTokenHash =
    hashSessionToken(sessionToken);

  const rows = await sql`
    SELECT
      creators.id,
      creators.name,
      creators.email
    FROM creator_sessions
    INNER JOIN creators
      ON creators.id =
        creator_sessions.creator_id
    WHERE
      creator_sessions.session_token_hash =
        ${sessionTokenHash}
      AND creator_sessions.expires_at > NOW()
    LIMIT 1
  `;

  if (rows.length === 0) {
    return null;
  }

  return {
    id: Number(rows[0].id),
    name: String(rows[0].name),
    email: String(rows[0].email)
      .trim()
      .toLowerCase(),
  };
} 
