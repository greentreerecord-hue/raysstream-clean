import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import postgres from "postgres";

import {
  createViewerSession,
  revokeViewerSession,
  setViewerSessionCookie,
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

async function ensureViewersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS viewers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    const requestOrigin =
      new URL(request.url).origin;

    if (
      request.headers.get("sec-fetch-site") ===
        "cross-site" ||
      (origin !== null && origin !== requestOrigin)
    ) {
      return NextResponse.json(
        {
          error: "This login request is not allowed.",
        },
        {
          status: 403,
        }
      );
    }

    const contentType =
      request.headers.get("content-type") || "";

    if (
      !contentType
        .toLowerCase()
        .startsWith("application/json")
    ) {
      return NextResponse.json(
        {
          error: "A JSON request is required.",
        },
        {
          status: 415,
        }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid login request.",
        },
        {
          status: 400,
        }
      );
    }

    const login =
      typeof body?.login === "string"
        ? body.login.trim().toLowerCase()
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    if (!login || !password) {
      return NextResponse.json(
        {
          error:
            "Username or email and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    await ensureViewersTable();

    const rows = await sql`
      SELECT
        id,
        name,
        username,
        email,
        password_hash
      FROM viewers
      WHERE LOWER(username) = ${login}
         OR LOWER(email) = ${login}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "Incorrect username, email, or password.",
        },
        {
          status: 401,
        }
      );
    }

    const viewer = rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      String(viewer.password_hash)
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          error:
            "Incorrect username, email, or password.",
        },
        {
          status: 401,
        }
      );
    }

    // Replace this browser's previous session.
    await revokeViewerSession(request);

    const session = await createViewerSession(
      Number(viewer.id)
    );

    const response = NextResponse.json({
      message: "Viewer login successful!",
      viewer: {
        id: Number(viewer.id),
        name: String(viewer.name),
        username: String(viewer.username),
        email: String(viewer.email),
      },
    });

    setViewerSessionCookie(response, session);

    return response;
  } catch (error) {
    console.error("Viewer login error:", error);

    return NextResponse.json(
      {
        error: "Unable to log in.",
      },
      {
        status: 500,
      }
    );
  }
} 
