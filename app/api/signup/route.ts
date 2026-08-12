import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { randomBytes, scryptSync } from "crypto";

const sql = neon(process.env.NEON_DATABASE_URL!);

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Please fill in all fields." },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    await sql`
      CREATE TABLE IF NOT EXISTS creators (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      INSERT INTO creators (username, email, password)
      VALUES (${username}, ${email}, ${passwordHash})
    `;

    return NextResponse.json({
      success: true,
      message: `Welcome to Ray'sStream, ${username}!`,
    });
  } catch (error) {
    console.error("Creator signup error:", error);

    return NextResponse.json(
      { error: "Could not create account. That email may already be registered." },
      { status: 500 }
    );
  }
} 
