import {
  createHash,
  randomBytes,
} from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

const SESSION_LENGTH_SECONDS =
  60 * 60 * 24 * 30;

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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          error:
            "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const creators = await sql`
      SELECT id, name, email, password_hash
      FROM creators
      WHERE LOWER(email) = ${email}
      LIMIT 1
    `;

    if (creators.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const creator = creators[0];

    const passwordMatches =
      await bcrypt.compare(
        password,
        creator.password_hash
      );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    await ensureSessionTable();

    await sql`
      DELETE FROM creator_sessions
      WHERE expires_at <= NOW()
    `;

    const sessionToken =
      randomBytes(32).toString("hex");

    const sessionTokenHash =
      hashSessionToken(sessionToken);

    const expiresAt = new Date(
      Date.now() +
        SESSION_LENGTH_SECONDS * 1000
    );

    await sql`
      INSERT INTO creator_sessions (
        creator_id,
        session_token_hash,
        expires_at
      )
      VALUES (
        ${creator.id},
        ${sessionTokenHash},
        ${expiresAt}
      )
    `;

    const hostname =
      new URL(request.url).hostname;

    const useSecureCookie =
      hostname !== "localhost" &&
      hostname !== "127.0.0.1";

    const response = NextResponse.json({
      success: true,
      name: creator.name,
      email: creator.email,
    });

    response.cookies.set({
      name: SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      secure: useSecureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_LENGTH_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong logging in.",
      },
      { status: 500 }
    );
  }
} 
