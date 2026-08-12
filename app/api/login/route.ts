import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "crypto";

const sql = neon(process.env.NEON_DATABASE_URL!);

function verifyPassword(password: string, storedPassword: string) {
  const parts = storedPassword.split(":");

  if (parts.length !== 2) {
    return false;
  }

  const [salt, storedHash] = parts;

  const hash = scryptSync(password, salt, 64);
  const storedHashBuffer = Buffer.from(storedHash, "hex");

  if (hash.length !== storedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(hash, storedHashBuffer);
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter your email and password." },
        { status: 400 }
      );
    }

    const creators = await sql`
      SELECT id, username, email, password
      FROM creators
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;

    if (creators.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const creator = creators[0];

    const passwordMatches = verifyPassword(
      password,
      creator.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      username: creator.username,
      email: creator.email,
    });
  } catch (error) {
    console.error("Creator login error:", error);

    return NextResponse.json(
      { error: "Could not sign in." },
      { status: 500 }
    );
  }
} 
