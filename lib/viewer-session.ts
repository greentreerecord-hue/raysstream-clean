import { createHash, randomBytes } from "node:crypto";
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

const COOKIE_NAME = "raysstream_viewer_session";

const SESSION_SECONDS = 7 * 24 * 60 * 60;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

async function ensureSessionTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS viewer_sessions (
      token_hash TEXT PRIMARY KEY,
      viewer_id INTEGER NOT NULL
        REFERENCES viewers(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;
}

function hashToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function readSessionToken(request: Request) {
  const cookieHeader =
    request.headers.get("cookie") || "";

  const matchingCookies = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter((cookie) =>
      cookie.startsWith(`${COOKIE_NAME}=`)
    );

  if (matchingCookies.length !== 1) {
    return null;
  }

  const token = matchingCookies[0].slice(
    COOKIE_NAME.length + 1
  );

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return null;
  }

  return token;
}

// Call only after the password has been verified.
export async function createViewerSession(
  viewerId: number
) {
  if (
    !Number.isInteger(viewerId) ||
    viewerId < 1
  ) {
    throw new Error("Invalid viewer ID.");
  }

  await ensureSessionTable();

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_SECONDS * 1000
  );

  await sql`
    INSERT INTO viewer_sessions (
      token_hash,
      viewer_id,
      expires_at
    )
    VALUES (
      ${tokenHash},
      ${viewerId},
      ${expiresAt}
    )
  `;

  return { token, expiresAt };
}

export function setViewerSessionCookie(
  response: NextResponse,
  session: {
    token: string;
    expiresAt: Date;
  }
) {
  response.cookies.set(
    COOKIE_NAME,
    session.token,
    {
      ...cookieOptions,
      expires: session.expiresAt,
      maxAge: SESSION_SECONDS,
    }
  );

  response.headers.set(
    "Cache-Control",
    "no-store"
  );
}

export async function getViewerIdFromSession(
  request: Request
): Promise<number | null> {
  const token = readSessionToken(request);

  if (!token) {
    return null;
  }

  await ensureSessionTable();

  const tokenHash = hashToken(token);

  const rows = await sql`
    SELECT sessions.viewer_id
    FROM viewer_sessions AS sessions
    INNER JOIN viewers
      ON viewers.id = sessions.viewer_id
    WHERE sessions.token_hash = ${tokenHash}
      AND sessions.expires_at > NOW()
    LIMIT 1
  `;

  if (rows.length === 0) {
    return null;
  }

  return Number(rows[0].viewer_id);
}

export async function revokeViewerSession(
  request: Request
) {
  const token = readSessionToken(request);

  if (!token) {
    return;
  }

  await ensureSessionTable();

  const tokenHash = hashToken(token);

  await sql`
    DELETE FROM viewer_sessions
    WHERE token_hash = ${tokenHash}
  `;
}

export function clearViewerSessionCookie(
  response: NextResponse
) {
  response.cookies.set(COOKIE_NAME, "", {
    ...cookieOptions,
    expires: new Date(0),
    maxAge: 0,
  });

  response.headers.set(
    "Cache-Control",
    "no-store"
  );
} 
