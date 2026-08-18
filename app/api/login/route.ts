import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import postgres from "postgres";

const connectionString = process.env.RAYSSTREAM_DB_DATABASE_URL;

if (!connectionString) {
  throw new Error("RAYSSTREAM_DB_DATABASE_URL is missing");
}

const sql = postgres(connectionString, {
  ssl: "require",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const creators = await sql`
      SELECT id, name, email, password_hash
      FROM creators
      WHERE email = ${email}
      LIMIT 1
    `;

    if (creators.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const creator = creators[0];

    const passwordMatches = await bcrypt.compare(
      password,
      creator.password_hash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      name: creator.name,
      email: creator.email,
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Something went wrong logging in." },
      { status: 500 }
    );
  }
} 
