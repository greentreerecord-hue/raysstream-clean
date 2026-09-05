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
            "This signup request is not allowed.",
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

    let parsedBody: unknown;

    try {
      parsedBody = await request.json();
    } catch {
      return jsonResponse(
        {
          error: "Invalid signup request.",
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
          error: "Invalid signup request.",
        },
        400
      );
    }

    const body = parsedBody as Record<
      string,
      unknown
    >;

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!name || !username || !email || !password) {
      return jsonResponse(
        {
          error:
            "Name, username, email, and password are required.",
        },
        400
      );
    }

    if (name.length > 100) {
      return jsonResponse(
        {
          error:
            "Name must be 100 characters or less.",
        },
        400
      );
    }

    if (
      username.length < 3 ||
      username.length > 30
    ) {
      return jsonResponse(
        {
          error:
            "Username must be between 3 and 30 characters.",
        },
        400
      );
    }

    if (!/^[a-z0-9._-]+$/.test(username)) {
      return jsonResponse(
        {
          error:
            "Username can only contain letters, numbers, periods, underscores, and hyphens.",
        },
        400
      );
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      return jsonResponse(
        {
          error: "Please enter a valid email.",
        },
        400
      );
    }

    if (
      password.length < 6 ||
      password.length > 128
    ) {
      return jsonResponse(
        {
          error:
            "Password must be between 6 and 128 characters.",
        },
        400
      );
    }

    await ensureViewersTable();

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const rows = await sql`
      INSERT INTO viewers (
        name,
        username,
        email,
        password_hash
      )
      VALUES (
        ${name},
        ${username},
        ${email},
        ${passwordHash}
      )
      RETURNING id, name, username, email
    `;

    const viewer = {
      id: Number(rows[0].id),
      name: String(rows[0].name),
      username: String(rows[0].username),
      email: String(rows[0].email),
    };

    // Replace any existing viewer session in
    // this browser with the new account session.
    await revokeViewerSession(request);

    const session =
      await createViewerSession(viewer.id);

    const response = jsonResponse({
      message: "Viewer account created!",
      viewer,
    });

    setViewerSessionCookie(
      response,
      session
    );

    return response;
  } catch (error) {
    console.error(
      "Unable to create viewer account:",
      error
    );

    const databaseError = error as {
      code?: string;
      constraint_name?: string;
    };

    if (databaseError.code === "23505") {
      return jsonResponse(
        {
          error:
            "That username or email is already registered.",
        },
        409
      );
    }

    return jsonResponse(
      {
        error:
          "Unable to create viewer account.",
      },
      500
    );
  }
} 
