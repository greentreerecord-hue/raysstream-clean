import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import postgres from "postgres";

export const dynamic = "force-dynamic";

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
    await ensureViewersTable();

    const body = await request.json();

    const name = String(body.name || "").trim();
    const username = String(
      body.username || ""
    )
      .trim()
      .toLowerCase();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        {
          error:
            "Name, username, email, and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        {
          error:
            "Username must be at least 3 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !/^[a-z0-9._-]+$/.test(username)
    ) {
      return NextResponse.json(
        {
          error:
            "Username can only contain letters, numbers, periods, underscores, and hyphens.",
        },
        {
          status: 400,
        }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        {
          error: "Please enter a valid email.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters.",
        },
        {
          status: 400,
        }
      );
    }

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

    return NextResponse.json({
      message: "Viewer account created!",
      viewer: {
        id: Number(rows[0].id),
        name: String(rows[0].name),
        username: String(rows[0].username),
        email: String(rows[0].email),
      },
    });
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
      return NextResponse.json(
        {
          error:
            "That username or email is already registered.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to create viewer account.",
      },
      {
        status: 500,
      }
    );
  }
} 
