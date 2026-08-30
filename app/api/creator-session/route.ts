import { createHash } from "crypto";
import {
  NextRequest,
  NextResponse,
} from "next/server";
import postgres from "postgres";

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

const SESSION_COOKIE =
  "raysstream_creator_session";

function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

async function ensureSessionTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS creator_sessions (
      id SERIAL PRIMARY KEY,
      creator_id INTEGER NOT NULL,
      session_token_hash TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET(
  request: NextRequest
) {
  try {
    await ensureSessionTable();

    const sessionToken =
      request.cookies.get(
        SESSION_COOKIE
      )?.value || "";

    if (!sessionToken) {
      return NextResponse.json(
        {
          authenticated: false,
          reason: "missing-cookie",
        },
        { status: 401 }
      );
    }

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
      const response = NextResponse.json(
        {
          authenticated: false,
          reason: "invalid-or-expired-session",
        },
        { status: 401 }
      );

      response.cookies.set({
        name: SESSION_COOKIE,
        value: "",
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    const creator = rows[0];

    return NextResponse.json({
      authenticated: true,
      creator: {
        id: creator.id,
        name: creator.name,
        email: creator.email,
      },
    });
  } catch (error) {
    console.error(
      "Creator session error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to verify creator session.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    await ensureSessionTable();

    const sessionToken =
      request.cookies.get(
        SESSION_COOKIE
      )?.value || "";

    if (sessionToken) {
      const sessionTokenHash =
        hashSessionToken(sessionToken);

      await sql`
        DELETE FROM creator_sessions
        WHERE session_token_hash =
          ${sessionTokenHash}
      `;
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: SESSION_COOKIE,
      value: "",
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error(
      "Creator logout error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to log out.",
      },
      { status: 500 }
    );
  }
} 
