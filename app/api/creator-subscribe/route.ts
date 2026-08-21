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

async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS creator_videos (
      id SERIAL PRIMARY KEY,
      creator_email TEXT NOT NULL,
      blob_url TEXT UNIQUE NOT NULL,
      pathname TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

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

function validChannelId(channelId: string) {
  return /^[a-f0-9]{32}$/.test(channelId);
}

async function findCreatorEmail(channelId: string) {
  const rows = await sql`
    SELECT creator_email
    FROM creator_videos
    WHERE MD5(LOWER(creator_email)) = ${channelId}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return "";
  }

  return String(rows[0].creator_email)
    .trim()
    .toLowerCase();
}

export async function GET(request: Request) {
  try {
    await ensureTables();

    const { searchParams } = new URL(request.url);

    const channelId = String(
      searchParams.get("channelId") || ""
    )
      .trim()
      .toLowerCase();

    if (!validChannelId(channelId)) {
      return NextResponse.json(
        {
          error: "A valid creator channel ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const creatorEmail =
      await findCreatorEmail(channelId);

    if (!creatorEmail) {
      return NextResponse.json(
        {
          error: "Creator channel not found.",
        },
        {
          status: 404,
        }
      );
    }

    const rows = await sql`
      SELECT COUNT(*) AS count
      FROM creator_subscriptions
      WHERE creator_email = ${creatorEmail}
    `;

    return NextResponse.json({
      channelId,
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
    await ensureTables();

    const body = await request.json();

    const channelId = String(
      body.channelId || ""
    )
      .trim()
      .toLowerCase();

    const subscriberId = String(
      body.subscriberId || ""
    ).trim();

    if (!validChannelId(channelId)) {
      return NextResponse.json(
        {
          error: "A valid creator channel ID is required.",
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

    const creatorEmail =
      await findCreatorEmail(channelId);

    if (!creatorEmail) {
      return NextResponse.json(
        {
          error: "Creator channel not found.",
        },
        {
          status: 404,
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
      channelId,
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
