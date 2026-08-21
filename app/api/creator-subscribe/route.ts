import { NextResponse } from "next/server";
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

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS creator_subscriptions (
      id SERIAL PRIMARY KEY,
      creator_email TEXT NOT NULL,
      subscriber_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (creator_email, subscriber_id)
    )
  `;
}

export async function GET(request: Request) {
  try {
    await ensureTable();

    const { searchParams } = new URL(request.url);

    const creatorEmail = String(
      searchParams.get("creatorEmail") || ""
    )
      .trim()
      .toLowerCase();

    if (!creatorEmail) {
      return NextResponse.json(
        {
          error: "Creator email is required.",
        },
        {
          status: 400,
        }
      );
    }

    const rows = await sql`
      SELECT COUNT(*) AS count
      FROM creator_subscriptions
      WHERE creator_email = ${creatorEmail}
    `;

    return NextResponse.json({
      creatorEmail,
      count: Number(rows[0].count || 0),
    });
  } catch (error) {
    console.error(
      "Load creator subscribers error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load the creator subscriber count.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();

    const body = await request.json();

    const creatorEmail = String(
      body.creatorEmail || ""
    )
      .trim()
      .toLowerCase();

    const subscriberId = String(
      body.subscriberId || ""
    ).trim();

    if (!creatorEmail) {
      return NextResponse.json(
        {
          error: "Creator email is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!subscriberId) {
      return NextResponse.json(
        {
          error: "Subscriber ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (subscriberId.length > 200) {
      return NextResponse.json(
        {
          error: "Subscriber ID is too long.",
        },
        {
          status: 400,
        }
      );
    }

    const inserted = await sql`
      INSERT INTO creator_subscriptions (
        creator_email,
        subscriber_id
      )
      VALUES (
        ${creatorEmail},
        ${subscriberId}
      )
      ON CONFLICT (
        creator_email,
        subscriber_id
      )
      DO NOTHING
      RETURNING id
    `;

    const countRows = await sql`
      SELECT COUNT(*) AS count
      FROM creator_subscriptions
      WHERE creator_email = ${creatorEmail}
    `;

    const newSubscription = inserted.length > 0;

    return NextResponse.json({
      creatorEmail,
      subscribed: true,
      alreadySubscribed: !newSubscription,
      count: Number(countRows[0].count || 0),
      message: newSubscription
        ? "Subscribed to creator!"
        : "You are already subscribed to this creator.",
    });
  } catch (error) {
    console.error(
      "Save creator subscription error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to subscribe to this creator.",
      },
      {
        status: 500,
      }
    );
  }
} 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    