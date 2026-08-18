import { NextResponse } from "next/server";
import postgres from "postgres";

const connectionString = process.env.RAYSSTREAM_DB_DATABASE_URL;

if (!connectionString) {
  throw new Error("RAYSSTREAM_DB_DATABASE_URL is missing");
}

const sql = postgres(connectionString, {
  ssl: "require",
});

async function createSubscribersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET() {
  try {
    await createSubscribersTable();

    const result = await sql`
      SELECT COUNT(*)::int AS count
      FROM subscribers
    `;

    return NextResponse.json({
      count: result[0].count,
    });
  } catch (error) {
    console.error("Subscriber count error:", error);

    return NextResponse.json(
      { error: "Unable to load subscriber count." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await createSubscribersTable();

    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const existingSubscriber = await sql`
      SELECT id
      FROM subscribers
      WHERE email = ${email}
      LIMIT 1
    `;

    if (existingSubscriber.length > 0) {
      const countResult = await sql`
        SELECT COUNT(*)::int AS count
        FROM subscribers
      `;

      return NextResponse.json({
        message: "You are already subscribed!",
        count: countResult[0].count,
      });
    }

    await sql`
      INSERT INTO subscribers (email)
      VALUES (${email})
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int AS count
      FROM subscribers
    `;

    return NextResponse.json({
      message: "Subscription successful!",
      count: countResult[0].count,
    });
  } catch (error) {
    console.error("Subscription error:", error);

    return NextResponse.json(
      { error: "Unable to complete subscription." },
      { status: 500 }
    );
  }
} 
